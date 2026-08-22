<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\AuditLog;
use App\Models\BursaryCycle;
use App\Models\Institution;
use App\Models\SystemSetting;
use App\Models\Ward;
use App\Models\BursaryCategory;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    public function dashboard()
    {
        $activeCycle = BursaryCycle::where('is_active', true)->first();
        $totalBudget = $activeCycle ? (float)$activeCycle->total_budget : 30000000.00;

        $totalApplications = Application::count();
        $verifiedCount = Application::whereIn('stage', ['committee_review', 'approved', 'rejected', 'deferred', 'awarded', 'paid'])->count();
        $recommendedCount = Application::where('total_score', '>=', 60)->count();
        $approvedCount = Application::whereIn('stage', ['approved', 'awarded', 'paid'])->count();
        $disbursedCount = Application::where('stage', 'paid')->count();
        $fundsAllocated = (float)Application::whereIn('stage', ['approved', 'awarded', 'paid'])->sum('approved_amount');

        $wards = Ward::all()->map(function ($w) {
            $apps = Application::where('ward_id', $w->id);
            $appCount = $apps->count();
            $approved = (clone $apps)->whereIn('stage', ['approved', 'awarded', 'paid'])->count();
            $allocated = (clone $apps)->whereIn('stage', ['approved', 'awarded', 'paid'])->sum('approved_amount');

            return [
                'id' => $w->id,
                'name' => $w->name,
                'code' => $w->code,
                'budget_allocation' => (float)$w->budget_allocation,
                'applications_count' => $appCount,
                'approved_count' => $approved,
                'allocated_funds' => (float)$allocated,
            ];
        });

        $stagesBreakdown = [
            ['stage' => 'Submitted', 'count' => $totalApplications],
            ['stage' => 'Verified', 'count' => $verifiedCount],
            ['stage' => 'Recommended', 'count' => $recommendedCount],
            ['stage' => 'Approved', 'count' => $approvedCount],
            ['stage' => 'Disbursed', 'count' => $disbursedCount],
        ];

        $categories = BursaryCategory::all()->map(function ($cat) use ($totalApplications) {
            $count = Application::where('category_id', $cat->id)->count();
            $amount = (float)Application::where('category_id', $cat->id)->whereIn('stage', ['approved', 'awarded', 'paid'])->sum('approved_amount');
            $pct = $totalApplications > 0 ? round(($count / $totalApplications) * 100) : 0;
            return [
                'name' => $cat->name,
                'percentage' => $pct,
                'amount_kes' => $amount,
                'count' => $count,
            ];
        });

        return response()->json([
            'success' => true,
            'summary' => [
                'applications_received' => $totalApplications,
                'applications_verified' => $verifiedCount,
                'beneficiaries' => $approvedCount,
                'funds_allocated' => $fundsAllocated,
                'total_budget' => $totalBudget,
            ],
            'ward_analytics' => $wards,
            'stage_funnel' => $stagesBreakdown,
            'category_distribution' => $categories,
        ]);
    }
}
