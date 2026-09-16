<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Constituency;
use App\Models\User;
use App\Models\Ward;
use App\Models\BursaryCycle;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ConstituencyController extends Controller
{
    /**
     * List all active constituencies for public selection and dropdowns.
     */
    public function index(Request $request)
    {
        $query = Constituency::query();

        if (!$request->boolean('all')) {
            $query->where('is_active', true);
        }

        $constituencies = $query->withCount(['wards', 'applications'])
            ->with(['activeCycle'])
            ->orderBy('name', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $constituencies,
        ]);
    }

    /**
     * Show detailed branding and info for a specific constituency by ID or Slug.
     */
    public function show($id_or_slug)
    {
        $constituency = Constituency::where('id', $id_or_slug)
            ->orWhere('slug', $id_or_slug)
            ->with(['wards', 'activeCycle'])
            ->first();

        if (!$constituency) {
            return response()->json([
                'success' => false,
                'message' => 'Constituency not found.',
            ], 404);
        }

        // Aggregate statistics for this constituency
        $stats = [
            'total_wards' => $constituency->wards()->count(),
            'total_applications' => $constituency->applications()->count(),
            'approved_applications' => $constituency->applications()->whereIn('stage', ['approved', 'awarded', 'paid'])->count(),
            'total_disbursed' => (float) $constituency->applications()->where('stage', 'paid')->sum('disbursed_amount'),
        ];

        return response()->json([
            'success' => true,
            'data' => $constituency,
            'stats' => $stats,
        ]);
    }

    /**
     * Register a new constituency (Super Admin action).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:constituencies,code',
            'county' => 'required|string|max:255',
            'mp_name' => 'nullable|string|max:255',
            'mp_title' => 'nullable|string|max:255',
            'mp_message' => 'nullable|string',
            'mp_photo_url' => 'nullable|string',
            'fund_account_manager' => 'nullable|string|max:255',
            'office_postal_address' => 'nullable|string|max:255',
            'office_location' => 'nullable|string|max:255',
            'office_email' => 'nullable|email|max:255',
            'office_phone' => 'nullable|string|max:50',
            'primary_color' => 'nullable|string|max:20',
            'wards' => 'nullable|array',
            'wards.*.name' => 'required_with:wards|string',
            'wards.*.code' => 'nullable|string',
            'wards.*.budget_allocation' => 'nullable|numeric',
            'wards.*.representative_name' => 'nullable|string',
            // Optional Admin / Fund Manager user creation
            'admin_name' => 'nullable|string|max:255',
            'admin_email' => 'nullable|email|unique:users,email',
            'admin_password' => 'nullable|string|min:6',
            'admin_phone' => 'nullable|string',
        ]);

        try {
            return DB::transaction(function () use ($validated, $request) {
                $slug = Str::slug($validated['name']);
                // Ensure slug uniqueness
                $baseSlug = $slug;
                $counter = 1;
                while (Constituency::where('slug', $slug)->exists()) {
                    $slug = "{$baseSlug}-{$counter}";
                    $counter++;
                }

                $constituency = Constituency::create([
                    'name' => $validated['name'],
                    'slug' => $slug,
                    'code' => strtoupper($validated['code']),
                    'county' => $validated['county'],
                    'mp_name' => $validated['mp_name'] ?? 'Hon. Member of Parliament',
                    'mp_title' => $validated['mp_title'] ?? 'Member of National Assembly',
                    'mp_message' => $validated['mp_message'] ?? null,
                    'mp_photo_url' => $validated['mp_photo_url'] ?? null,
                    'fund_account_manager' => $validated['fund_account_manager'] ?? 'Constituency Fund Account Manager',
                    'office_postal_address' => $validated['office_postal_address'] ?? 'P.O. Box Accredited',
                    'office_location' => $validated['office_location'] ?? 'NG-CDF Constituency Office',
                    'office_email' => $validated['office_email'] ?? null,
                    'office_phone' => $validated['office_phone'] ?? null,
                    'primary_color' => $validated['primary_color'] ?? '#0B6B3A',
                    'is_active' => true,
                ]);

                // Create initial wards if provided
                if (!empty($validated['wards'])) {
                    foreach ($validated['wards'] as $index => $wData) {
                        Ward::create([
                            'constituency_id' => $constituency->id,
                            'name' => $wData['name'],
                            'code' => $wData['code'] ?? ($constituency->code . '-W0' . ($index + 1)),
                            'sub_county' => $constituency->name,
                            'population' => $wData['population'] ?? 40000,
                            'budget_allocation' => $wData['budget_allocation'] ?? 5000000.00,
                            'representative_name' => $wData['representative_name'] ?? null,
                        ]);
                    }
                }

                // Create default initial bursary cycle
                BursaryCycle::create([
                    'constituency_id' => $constituency->id,
                    'title' => '2026/2027 Financial Year (Cycle 1)',
                    'academic_year' => '2026/2027',
                    'total_budget' => 30000000.00,
                    'allocated_amount' => 0.00,
                    'disbursed_amount' => 0.00,
                    'start_date' => now()->startOfYear(),
                    'end_date' => now()->endOfYear(),
                    'is_active' => true,
                    'status' => 'open',
                    'description' => "Annual Constituency Bursary Allocation for {$constituency->name}",
                ]);

                // Create constituency staff user if provided
                $adminUser = null;
                if (!empty($validated['admin_email'])) {
                    $adminUser = User::create([
                        'constituency_id' => $constituency->id,
                        'name' => $validated['admin_name'] ?? ($constituency->name . ' Fund Manager'),
                        'email' => $validated['admin_email'],
                        'phone' => $validated['admin_phone'] ?? $constituency->office_phone,
                        'role' => 'admin',
                        'password' => Hash::make($validated['admin_password'] ?? 'William#20'),
                        'designation' => 'Constituency Fund Account Manager',
                        'is_active' => true,
                    ]);
                }

                try {
                    AuditLog::create([
                        'constituency_id' => $constituency->id,
                        'user_id' => auth()->id(),
                        'user_name' => auth()->user()?->name ?? 'System Super Admin',
                        'user_role' => auth()->user()?->role ?? 'super_admin',
                        'action' => 'CONSTITUENCY_REGISTERED',
                        'module' => 'Constituency Management',
                        'record_id' => (string) $constituency->id,
                        'new_values' => $constituency->toArray(),
                        'ip_address' => $request->ip() ?? '127.0.0.1',
                    ]);
                } catch (\Throwable $e) {
                    Log::warning("Audit log notice: " . $e->getMessage());
                }

                return response()->json([
                    'success' => true,
                    'message' => "Constituency '{$constituency->name}' successfully onboarded!",
                    'data' => $constituency->load(['wards', 'activeCycle']),
                    'admin_user' => $adminUser,
                ], 201);
            });
        } catch (\Throwable $ex) {
            Log::error("Failed to onboard constituency: " . $ex->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to onboard constituency: ' . $ex->getMessage(),
            ], 500);
        }
    }

    /**
     * Update constituency information and branding.
     */
    public function update(Request $request, $id)
    {
        $constituency = Constituency::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'county' => 'sometimes|string|max:255',
            'mp_name' => 'nullable|string|max:255',
            'mp_title' => 'nullable|string|max:255',
            'mp_message' => 'nullable|string',
            'mp_photo_url' => 'nullable|string',
            'fund_account_manager' => 'nullable|string|max:255',
            'office_postal_address' => 'nullable|string|max:255',
            'office_location' => 'nullable|string|max:255',
            'office_email' => 'nullable|email|max:255',
            'office_phone' => 'nullable|string|max:50',
            'primary_color' => 'nullable|string|max:20',
            'is_active' => 'sometimes|boolean',
        ]);

        $constituency->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Constituency details updated successfully.',
            'data' => $constituency->load(['wards', 'activeCycle']),
        ]);
    }

    /**
     * Add a ward to a constituency.
     */
    public function addWard(Request $request, $id)
    {
        $constituency = Constituency::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'budget_allocation' => 'nullable|numeric',
            'representative_name' => 'nullable|string|max:255',
            'population' => 'nullable|integer',
        ]);

        $ward = Ward::create([
            'constituency_id' => $constituency->id,
            'name' => $validated['name'],
            'code' => $validated['code'] ?? ($constituency->code . '-W' . (Ward::where('constituency_id', $constituency->id)->count() + 1)),
            'sub_county' => $constituency->name,
            'population' => $validated['population'] ?? 40000,
            'budget_allocation' => $validated['budget_allocation'] ?? 5000000.00,
            'representative_name' => $validated['representative_name'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Ward '{$ward->name}' added to {$constituency->name}.",
            'data' => $ward,
        ]);
    }

    /**
     * Delete or deactivate constituency.
     */
    public function destroy($id)
    {
        $constituency = Constituency::findOrFail($id);
        $constituency->update(['is_active' => false]);

        return response()->json([
            'success' => true,
            'message' => "Constituency '{$constituency->name}' deactivated successfully.",
        ]);
    }
}
