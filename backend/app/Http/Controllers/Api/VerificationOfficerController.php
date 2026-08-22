<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Document;
use App\Models\FieldVerification;
use App\Models\Notification;
use App\Services\AuditLoggerService;
use App\Services\NationalIdVerificationService;
use App\Services\OcrDocumentService;
use Illuminate\Http\Request;

class VerificationOfficerController extends Controller
{
    public function queue(Request $request)
    {
        $query = Application::with(['ward', 'institution', 'documents', 'identityVerifications', 'fieldVerifications']);

        if ($request->filled('ward_id')) {
            $query->where('ward_id', $request->ward_id);
        }
        if ($request->filled('institution_id')) {
            $query->where('institution_id', $request->institution_id);
        }
        if ($request->filled('stage')) {
            $query->where('stage', $request->stage);
        }
        if ($request->filled('risk')) {
            $query->where('duplicate_risk', $request->risk);
        }
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('full_name', 'like', "%{$s}%")
                  ->orWhere('application_no', 'like', "%{$s}%")
                  ->orWhere('national_id', 'like', "%{$s}%")
                  ->orWhere('admission_no', 'like', "%{$s}%");
            });
        }

        $applications = $query->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $applications,
            'summary' => [
                'total_queue' => $applications->count(),
                'pending_verification' => $applications->where('stage', 'under_verification')->count(),
                'field_verification' => $applications->where('stage', 'field_verification')->count(),
                'high_risk' => $applications->where('duplicate_risk', 'high')->count(),
            ]
        ]);
    }

    public function showDetails($id)
    {
        $application = Application::with([
            'user', 'cycle', 'ward', 'institution', 'category',
            'documents', 'identityVerifications', 'fieldVerifications',
            'committeeDecisions'
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $application,
        ]);
    }

    public function updateDocumentStatus(Request $request, $docId)
    {
        $doc = Document::findOrFail($docId);
        $status = $request->input('verification_status', 'verified');
        $notes = $request->input('officer_notes', 'Verified by officer');

        $doc->update([
            'verification_status' => $status,
            'officer_notes' => $notes,
        ]);

        AuditLoggerService::log(
            action: 'DOCUMENT_VERIFIED',
            module: 'Verification',
            recordId: (string)$doc->id,
            newValues: ['status' => $status, 'notes' => $notes]
        );

        return response()->json([
            'success' => true,
            'message' => 'Document verification status updated.',
            'data' => $doc,
        ]);
    }

    public function recordFieldVerification(Request $request, $id)
    {
        $application = Application::findOrFail($id);
        $user = $request->user();
        $officerId = $user ? $user->id : 2;

        $request->validate([
            'location_visited' => 'required|string',
            'findings' => 'required|string',
            'recommendation' => 'required|in:VERIFIED,NOT_VERIFIED,REQUIRES_FURTHER_REVIEW',
        ]);

        $fieldRec = FieldVerification::create([
            'application_id' => $application->id,
            'officer_id' => $officerId,
            'visit_date' => now()->toDateString(),
            'applicant_visited' => $request->boolean('applicant_visited', true),
            'guardian_interviewed' => $request->boolean('guardian_interviewed', true),
            'household_verified' => $request->boolean('household_verified', true),
            'location_visited' => $request->location_visited,
            'gps_coordinates' => $request->input('gps_coordinates', '-1.2635, 36.8021'),
            'findings' => $request->findings,
            'recommendation' => $request->recommendation,
        ]);

        // If field verified, progress application stage
        if ($request->recommendation === 'VERIFIED') {
            $application->update(['stage' => 'committee_review']);
        } elseif ($request->recommendation === 'REQUIRES_FURTHER_REVIEW') {
            $application->update(['stage' => 'field_verification']);
        }

        AuditLoggerService::log(
            action: 'FIELD_VERIFICATION_RECORDED',
            module: 'Field Verification',
            recordId: (string)$fieldRec->id,
            newValues: ['recommendation' => $request->recommendation, 'findings' => $request->findings]
        );

        return response()->json([
            'success' => true,
            'message' => 'Field verification findings recorded successfully.',
            'data' => $fieldRec,
            'application' => $application,
        ]);
    }

    public function forwardToCommittee($id)
    {
        $application = Application::findOrFail($id);
        $application->update(['stage' => 'committee_review']);

        Notification::create([
            'user_id' => $application->user_id,
            'application_id' => $application->id,
            'title' => 'Verification Complete - Committee Review',
            'message' => "Your application {$application->application_no} has passed officer verification and is now queued for NG-CDF Committee assessment.",
            'type' => 'status_change',
        ]);

        AuditLoggerService::log(
            action: 'APPLICATION_FORWARDED_TO_COMMITTEE',
            module: 'Verification',
            recordId: (string)$application->id,
            newValues: ['stage' => 'committee_review']
        );

        return response()->json([
            'success' => true,
            'message' => 'Application successfully forwarded to Committee Review.',
            'data' => $application,
        ]);
    }
}
