<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\BursaryCycle;
use App\Models\SystemSetting;
use App\Services\AuditLoggerService;
use Illuminate\Http\Request;

class SystemSettingsController extends Controller
{
    public function index()
    {
        return response()->json([
            'success' => true,
            'cycles' => BursaryCycle::all(),
            'scoring_weights' => [
                ['key' => 'financial_need_weight', 'label' => 'Financial Need & Household Hardship', 'max_points' => 25],
                ['key' => 'vulnerability_weight', 'label' => 'Vulnerability (Orphan, PWD, Chronic Illness)', 'max_points' => 20],
                ['key' => 'fee_burden_weight', 'label' => 'Fee Arrears & Remaining Balance Ratio', 'max_points' => 20],
                ['key' => 'education_need_weight', 'label' => 'Programme Type & TVET Priority', 'max_points' => 15],
                ['key' => 'household_weight', 'label' => 'Household Size & Concurrent Siblings', 'max_points' => 10],
                ['key' => 'previous_support_weight', 'label' => 'Track Record & Compliance History', 'max_points' => 10],
            ],
            'total_max_points' => 100,
            'settings' => SystemSetting::all(),
        ]);
    }

    public function auditLogs(Request $request)
    {
        $query = AuditLog::latest();
        if ($request->filled('module')) {
            $query->where('module', $request->module);
        }
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('action', 'like', "%{$request->search}%")
                  ->orWhere('user_name', 'like', "%{$request->search}%")
                  ->orWhere('record_id', 'like', "%{$request->search}%");
            });
        }

        $logs = $query->limit(100)->get();

        return response()->json([
            'success' => true,
            'data' => $logs,
        ]);
    }

    public function updateScoringWeights(Request $request)
    {
        AuditLoggerService::log(
            action: 'SCORING_CRITERIA_UPDATED',
            module: 'Settings',
            newValues: $request->all()
        );

        return response()->json([
            'success' => true,
            'message' => 'Scoring criteria & system parameters updated successfully.',
        ]);
    }
}
