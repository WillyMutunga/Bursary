<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Ward;
use App\Models\Institution;
use App\Models\Application;
use App\Models\BursaryCycle;
use App\Models\AuditLog;
use App\Services\AuditLoggerService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    public function dashboard(Request $request)
    {
        $users = User::latest()->get();
        $wards = Ward::orderBy('id')->get();
        $institutions = Institution::orderBy('id')->get();
        $activeCycle = BursaryCycle::where('is_active', true)->first() ?: BursaryCycle::first();
        $auditLogs = AuditLog::latest()->limit(100)->get();

        $stats = [
            'total_users' => User::count(),
            'total_applications' => Application::count(),
            'approved_applications' => Application::whereIn('stage', ['approved', 'awarded', 'paid'])->count(),
            'total_wards' => Ward::count(),
            'total_institutions' => Institution::count(),
            'total_budget_kes' => (float)($activeCycle ? $activeCycle->total_budget : 30000000.00),
            'allocated_funds_kes' => (float)Application::whereIn('stage', ['approved', 'awarded', 'paid'])->sum('approved_amount'),
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'users' => $users,
                'wards' => $wards,
                'institutions' => $institutions,
                'active_cycle' => $activeCycle,
                'statistics' => $stats,
                'audit_logs' => $auditLogs,
            ],
        ]);
    }

    public function toggleCycleWindow(Request $request)
    {
        $cycle = BursaryCycle::where('is_active', true)->first() ?: BursaryCycle::first();
        if (!$cycle) {
            $cycle = BursaryCycle::create([
                'title' => '2026/2027 Financial Year (Cycle 1)',
                'academic_year' => '2026/2027',
                'total_budget' => 30000000.00,
                'is_active' => true,
                'start_date' => now(),
                'end_date' => now()->addMonths(2),
            ]);
        }

        $newState = $request->has('is_active') ? (bool)$request->is_active : !$cycle->is_active;
        $cycle->is_active = $newState;
        if ($request->filled('end_date')) {
            $cycle->end_date = $request->end_date;
        }
        $cycle->save();

        AuditLoggerService::log(
            action: $newState ? 'BURSARY_WINDOW_OPENED' : 'BURSARY_WINDOW_CLOSED',
            module: 'Admin',
            recordId: (string)$cycle->id,
            newValues: ['is_active' => $newState, 'end_date' => $cycle->end_date],
            userName: 'Alex Kimani (Super Admin)',
            userRole: 'admin'
        );

        return response()->json([
            'success' => true,
            'message' => $newState ? 'Bursary application window is now OPEN in database.' : 'Bursary application window is now CLOSED in database.',
            'cycle' => $cycle,
        ]);
    }

    public function updateWardBudget(Request $request, $id)
    {
        $request->validate([
            'budget_allocation' => 'required|numeric|min:0',
        ]);

        $ward = Ward::findOrFail($id);
        $oldBudget = $ward->budget_allocation;
        $ward->update(['budget_allocation' => $request->budget_allocation]);

        AuditLoggerService::log(
            action: 'WARD_BUDGET_UPDATED',
            module: 'Admin',
            recordId: (string)$ward->id,
            oldValues: ['budget_allocation' => $oldBudget],
            newValues: ['budget_allocation' => $ward->budget_allocation],
            userName: 'Alex Kimani (Super Admin)',
            userRole: 'admin'
        );

        return response()->json([
            'success' => true,
            'message' => "Budget allocation for {$ward->name} updated to KSh " . number_format($ward->budget_allocation) . ".",
            'ward' => $ward,
        ]);
    }

    public function createUser(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'national_id' => 'required|string',
            'phone' => 'nullable|string',
            'role' => 'required|string|in:applicant,verification_officer,committee_member,finance_officer,school_officer,admin',
            'password' => 'required|string|min:6',
            'ward_id' => 'nullable|integer',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'national_id' => $validated['national_id'],
            'phone' => $validated['phone'] ?? '0700000000',
            'role' => $validated['role'],
            'password' => Hash::make($validated['password']),
            'ward_id' => $validated['ward_id'] ?? 1,
            'is_active' => true,
        ]);

        AuditLoggerService::log(
            action: 'USER_ACCOUNT_CREATED',
            module: 'Admin',
            recordId: (string)$user->id,
            newValues: ['name' => $user->name, 'email' => $user->email, 'role' => $user->role],
            userName: 'Alex Kimani (Super Admin)',
            userRole: 'admin'
        );

        return response()->json([
            'success' => true,
            'message' => "User {$user->name} ({$user->role}) created successfully in database.",
            'user' => $user,
        ]);
    }

    public function deleteUser($id)
    {
        $user = User::findOrFail($id);
        $userName = $user->name;
        $userRole = $user->role;
        $user->delete();

        AuditLoggerService::log(
            action: 'USER_ACCOUNT_DELETED',
            module: 'Admin',
            recordId: (string)$id,
            oldValues: ['name' => $userName, 'role' => $userRole],
            userName: 'Alex Kimani (Super Admin)',
            userRole: 'admin'
        );

        return response()->json([
            'success' => true,
            'message' => "User account for {$userName} deleted from database.",
        ]);
    }

    public function resetUserPassword(Request $request, $id)
    {
        $request->validate([
            'password' => 'required|string|min:6',
        ]);

        $user = User::findOrFail($id);
        $user->update([
            'password' => Hash::make($request->password),
        ]);

        AuditLoggerService::log(
            action: 'USER_PASSWORD_RESET',
            module: 'Admin',
            recordId: (string)$user->id,
            userName: 'Alex Kimani (Super Admin)',
            userRole: 'admin'
        );

        return response()->json([
            'success' => true,
            'message' => "Password for {$user->name} successfully reset.",
        ]);
    }
}
