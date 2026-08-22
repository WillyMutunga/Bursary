<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\BursaryCycle;
use App\Models\BursaryCategory;
use App\Models\Ward;
use App\Models\Institution;
use Illuminate\Http\Request;

class PublicPortalController extends Controller
{
    public function statistics()
    {
        $activeCycle = BursaryCycle::where('is_active', true)->first();

        $applicationsReceived = Application::count();
        $applicationsVerified = Application::whereIn('stage', ['committee_review', 'approved', 'awarded', 'paid'])->count();
        $beneficiaries = Application::whereIn('stage', ['approved', 'awarded', 'paid'])->count();
        $fundsAllocated = Application::whereIn('stage', ['approved', 'awarded', 'paid'])->sum('approved_amount');

        return response()->json([
            'success' => true,
            'data' => [
                'applications_received' => $applicationsReceived,
                'applications_verified' => $applicationsVerified,
                'beneficiaries' => $beneficiaries,
                'funds_allocated' => (float)$fundsAllocated,
                'active_cycle' => $activeCycle,
            ]
        ]);
    }

    public function lookupStatus(Request $request)
    {
        $request->validate([
            'query' => 'required|string',
        ]);

        $query = trim($request->input('query'));

        $application = Application::with(['cycle', 'ward', 'institution', 'documents'])
            ->where('application_no', $query)
            ->orWhere('national_id', $query)
            ->first();

        if (!$application) {
            return response()->json([
                'success' => false,
                'message' => "No application found matching '{$query}'. Please check your application reference or National ID."
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'application_no' => $application->application_no,
                'applicant_name' => $application->full_name,
                'national_id_masked' => substr($application->national_id, 0, 2) . '****' . substr($application->national_id, -2),
                'institution' => $application->institution ? $application->institution->name : 'N/A',
                'course' => $application->course_name,
                'stage' => $application->stage,
                'id_verification_status' => $application->id_verification_status,
                'submitted_at' => $application->created_at->format('d M Y, h:i A'),
                'approved_amount' => $application->approved_amount,
                'has_award_letter' => in_array($application->stage, ['approved', 'awarded', 'paid']),
                'certificate_hash' => $application->award_certificate_hash,
            ]
        ]);
    }

    public function lookupData()
    {
        return response()->json([
            'success' => true,
            'wards' => Ward::all(),
            'institutions' => Institution::all(),
            'categories' => BursaryCategory::all(),
            'active_cycle' => BursaryCycle::where('is_active', true)->first(),
        ]);
    }
}
