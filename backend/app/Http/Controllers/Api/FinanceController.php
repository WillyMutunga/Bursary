<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\BursaryCycle;
use App\Models\Payment;
use App\Models\PaymentBatch;
use App\Models\Notification;
use App\Services\AuditLoggerService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class FinanceController extends Controller
{
    public function dashboard()
    {
        $cycle = BursaryCycle::where('is_active', true)->first();
        $totalBudget = $cycle ? (float)$cycle->total_budget : 30000000.00;

        $approvedAmount = (float)Application::whereIn('stage', ['approved', 'awarded', 'paid'])->sum('approved_amount');
        $paidAmount = (float)Payment::where('status', 'cleared')->sum('amount');

        $pendingAmount = max(0.0, $approvedAmount - $paidAmount);
        $balanceRemaining = max(0.0, $totalBudget - $approvedAmount);

        $batches = PaymentBatch::with(['cycle', 'creator', 'approver'])
            ->withCount('payments')
            ->latest()
            ->get();

        $readyForPayment = Application::with(['institution', 'ward'])
            ->where('stage', 'approved')
            ->get();

        return response()->json([
            'success' => true,
            'budget' => [
                'total_budget' => $totalBudget,
                'approved' => $approvedAmount,
                'paid' => $paidAmount,
                'pending' => $pendingAmount,
                'balance' => $balanceRemaining,
                'utilization_rate_pct' => round(($approvedAmount / max(1, $totalBudget)) * 100, 1),
            ],
            'batches' => $batches,
            'ready_for_payment_count' => $readyForPayment->count(),
            'ready_for_payment' => $readyForPayment,
        ]);
    }

    public function createBatch(Request $request)
    {
        $request->validate([
            'application_ids' => 'required|array|min:1',
            'payment_method' => 'required|in:EFT,CHEQUE,MPESA_B2C',
        ]);

        $user = $request->user();
        $userId = $user ? $user->id : 4;
        $cycle = BursaryCycle::where('is_active', true)->first();

        $apps = Application::whereIn('id', $request->application_ids)
            ->where('stage', 'approved')
            ->get();

        if ($apps->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No eligible approved applications selected for batch processing.'
            ], 422);
        }

        $totalAmount = $apps->sum('approved_amount');
        $batchNo = 'BATCH-' . date('Y') . '-' . strtoupper(Str::random(5));

        $batch = PaymentBatch::create([
            'cycle_id' => $cycle ? $cycle->id : 1,
            'batch_no' => $batchNo,
            'total_amount' => $totalAmount,
            'beneficiary_count' => $apps->count(),
            'payment_method' => $request->payment_method,
            'status' => 'approved',
            'created_by_user_id' => $userId,
            'approved_by_user_id' => $userId,
            'disbursed_at' => now(),
        ]);

        foreach ($apps as $app) {
            Payment::create([
                'payment_batch_id' => $batch->id,
                'application_id' => $app->id,
                'institution_id' => $app->institution_id ?? 1,
                'amount' => $app->approved_amount,
                'cheque_eft_number' => 'EFT-' . rand(10000000, 99999999),
                'status' => 'cleared',
                'payment_date' => now()->toDateString(),
            ]);

            $app->update([
                'stage' => 'paid',
                'disbursed_amount' => $app->approved_amount,
            ]);

            Notification::create([
                'user_id' => $app->user_id,
                'application_id' => $app->id,
                'title' => 'Disbursement Completed 🏦',
                'message' => "Payment of KSh " . number_format($app->approved_amount) . " for your bursary has been dispatched to {$app->institution->name} under batch {$batchNo}.",
                'type' => 'status_change',
            ]);
        }

        AuditLoggerService::log(
            action: 'PAYMENT_BATCH_DISBURSED',
            module: 'Finance',
            recordId: (string)$batch->id,
            newValues: ['batch_no' => $batchNo, 'amount' => $totalAmount, 'beneficiaries' => $apps->count()],
            userId: $userId,
            userName: $user ? $user->name : 'Finance Officer',
            userRole: 'finance_officer'
        );

        return response()->json([
            'success' => true,
            'message' => "Payment batch {$batchNo} generated and disbursed to institutions successfully.",
            'batch' => $batch->load('payments'),
        ]);
    }
}
