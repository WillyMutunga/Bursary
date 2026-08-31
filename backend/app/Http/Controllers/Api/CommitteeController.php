<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\CommitteeDecision;
use App\Models\Notification;
use App\Services\AuditLoggerService;
use App\Services\AwardLetterService;
use Illuminate\Http\Request;

class CommitteeController extends Controller
{
    public function index(Request $request)
    {
        $query = Application::with(['ward', 'institution', 'documents', 'identityVerifications', 'fieldVerifications', 'committeeDecisions']);

        if ($request->filled('ward_id')) {
            $query->where('ward_id', $request->ward_id);
        }
        if ($request->filled('stage') && $request->stage !== 'all') {
            $query->where('stage', $request->stage);
        }

        $applications = $query->latest()->get();

        $stats = [
            'total_applications' => $applications->count(),
            'pending_review' => $applications->whereIn('stage', ['under_verification', 'committee_review'])->count(),
            'verified_applications' => $applications->whereIn('stage', ['committee_review', 'approved', 'awarded', 'paid'])->count(),
            'recommended_applications' => $applications->where('total_score', '>=', 60)->count(),
            'approved_applications' => $applications->whereIn('stage', ['approved', 'awarded', 'paid'])->count(),
            'allocated_funds_kes' => (float)$applications->whereIn('stage', ['approved', 'awarded', 'paid'])->sum('approved_amount'),
        ];

        return response()->json([
            'success' => true,
            'data' => $applications,
            'statistics' => $stats,
        ]);
    }

    public function recordDecision(Request $request, $id, AwardLetterService $awardService)
    {
        $application = Application::with('cycle', 'institution')->findOrFail($id);
        $user = $request->user();
        $userId = $user ? $user->id : 8;

        $request->validate([
            'decision' => 'required|in:APPROVE,REJECT,DEFER,RETURN_FOR_VERIFICATION',
            'approved_amount' => 'required|numeric|min:0',
            'modification_reason' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $approved = (float)$request->approved_amount;
        $recommended = (float)($request->input('recommended_amount', $approved));
        $amountModified = abs($recommended - $approved) > 0.01;

        $stage = match ($request->decision) {
            'APPROVE' => 'approved',
            'REJECT' => 'rejected',
            'DEFER' => 'deferred',
            'RETURN_FOR_VERIFICATION' => 'under_verification',
        };

        $decision = CommitteeDecision::create([
            'application_id' => $application->id,
            'committee_user_id' => $userId,
            'recommended_amount' => $recommended,
            'approved_amount' => $approved,
            'amount_modified' => $amountModified,
            'modification_reason' => $request->modification_reason,
            'decision' => $request->decision,
            'notes' => $request->notes ?? ($request->decision === 'APPROVE' ? "Awarded KSh " . number_format($approved) . " by Bursary Committee." : "Status updated to " . $request->decision),
        ]);

        $application->update([
            'stage' => $stage,
            'approved_amount' => ($request->decision === 'APPROVE') ? $approved : 0.00,
            'decision_date' => now(),
            'decision_reason' => $request->notes ?? $request->modification_reason,
            'decision_by_user_id' => $userId,
        ]);

        // If approved, generate digital award letter & QR certificate
        if ($request->decision === 'APPROVE') {
            $awardService->generateAwardLetterPayload($application);

            \App\Services\NotificationService::notifyMilestone('AWARDED', array_merge($application->toArray(), [
                'approved_amount' => $approved,
            ]));

            Notification::create([
                'user_id' => $application->user_id,
                'application_id' => $application->id,
                'title' => 'Bursary Award Approved! 🎉',
                'message' => "Congratulations! Your bursary application {$application->application_no} has been approved for KSh " . number_format($approved) . ". Your official QR award letter is now ready for download.",
                'type' => 'award_ready',
            ]);
        } else {
            Notification::create([
                'user_id' => $application->user_id,
                'application_id' => $application->id,
                'title' => 'Application Decision: ' . $request->decision,
                'message' => "Your bursary application {$application->application_no} status has been updated to: " . $request->decision . ".",
                'type' => 'status_change',
            ]);
        }

        AuditLoggerService::log(
            action: 'COMMITTEE_DECISION_RECORDED',
            module: 'Committee',
            recordId: (string)$application->id,
            newValues: [
                'decision' => $request->decision,
                'approved_amount' => $approved,
                'notes' => $request->notes,
            ],
            userId: $userId,
            userName: $user ? $user->name : 'Willy (Committee Member)',
            userRole: 'committee_member'
        );

        return response()->json([
            'success' => true,
            'message' => "Decision recorded successfully. Awarded KSh " . number_format($approved) . " to application {$application->application_no}.",
            'decision' => $decision,
            'application' => $application->fresh(['cycle', 'ward', 'institution', 'committeeDecisions']),
        ]);
    }
}
