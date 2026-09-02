<?php

use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\ApplicantController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AwardVerificationController;
use App\Http\Controllers\Api\CommitteeController;
use App\Http\Controllers\Api\FinanceController;
use App\Http\Controllers\Api\PublicPortalController;
use App\Http\Controllers\Api\SchoolPortalController;
use App\Http\Controllers\Api\SystemSettingsController;
use App\Http\Controllers\Api\VerificationOfficerController;
use Illuminate\Support\Facades\Route;

// Authentication & Demo Profiles
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::get('/demo-users', [AuthController::class, 'demoUsers']);
    Route::middleware('auth:sanctum')->get('/user', [AuthController::class, 'user']);
});

// Public Citizen & Portal Routes
Route::prefix('public')->group(function () {
    Route::get('/statistics', [PublicPortalController::class, 'statistics']);
    Route::get('/lookup-data', [PublicPortalController::class, 'lookupData']);
    Route::post('/lookup-status', [PublicPortalController::class, 'lookupStatus']);
    Route::get('/db-debug', function () {
        return response()->json([
            'users_count' => \App\Models\User::count(),
            'users' => \App\Models\User::select('id', 'name', 'email', 'role', 'national_id')->get(),
            'applications_count' => \App\Models\Application::count(),
            'applications' => \App\Models\Application::select('id', 'application_no', 'full_name', 'stage', 'ward_id')->get(),
            'wards_count' => \App\Models\Ward::count(),
            'cycles_count' => \App\Models\BursaryCycle::count(),
            'audit_logs_count' => \App\Models\AuditLog::count(),
        ]);
    });
    Route::get('/admin-test', function () {
        try {
            $controller = new \App\Http\Controllers\Api\AdminController();
            return $controller->dashboard(request());
        } catch (\Throwable $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ], 500);
        }
    });
    Route::get('/ensure-seed', function () {
        try {
            // 1. Super Admin
            \App\Models\User::updateOrCreate(
                ['email' => 'admin@ngcdf.go.ke'],
                [
                    'name' => 'Willy',
                    'email' => 'admin@ngcdf.go.ke',
                    'phone' => '+254 700 000 000',
                    'role' => 'admin',
                    'national_id' => '41354126',
                    'password' => \Illuminate\Support\Facades\Hash::make('William#20'),
                    'designation' => 'Constituency Fund Manager / Super Admin',
                    'is_active' => true,
                ]
            );

            // 2. Departmental Staff Accounts
            \App\Models\User::updateOrCreate(
                ['email' => 'verification@ngcdf.go.ke'],
                [
                    'name' => 'Jane Mutheu',
                    'email' => 'verification@ngcdf.go.ke',
                    'phone' => '+254 711 223 344',
                    'role' => 'verification_officer',
                    'national_id' => '28901234',
                    'password' => \Illuminate\Support\Facades\Hash::make('William#20'),
                    'designation' => 'Ward Verification Officer',
                    'ward_id' => 1,
                    'is_active' => true,
                ]
            );

            \App\Models\User::updateOrCreate(
                ['email' => 'committee@ngcdf.go.ke'],
                [
                    'name' => 'Pastor David Musyoka',
                    'email' => 'committee@ngcdf.go.ke',
                    'phone' => '+254 722 334 455',
                    'role' => 'committee_member',
                    'national_id' => '12345678',
                    'password' => \Illuminate\Support\Facades\Hash::make('William#20'),
                    'designation' => 'Constituency Bursary Committee Chair',
                    'ward_id' => 4,
                    'is_active' => true,
                ]
            );

            \App\Models\User::updateOrCreate(
                ['email' => 'finance@ngcdf.go.ke'],
                [
                    'name' => 'Kiprop Langat',
                    'email' => 'finance@ngcdf.go.ke',
                    'phone' => '+254 733 445 566',
                    'role' => 'finance_officer',
                    'national_id' => '23456789',
                    'password' => \Illuminate\Support\Facades\Hash::make('William#20'),
                    'designation' => 'Constituency Accountant / Finance Officer',
                    'is_active' => true,
                ]
            );

            \App\Models\User::updateOrCreate(
                ['email' => 'school@ngcdf.go.ke'],
                [
                    'name' => 'Sister Mary',
                    'email' => 'school@ngcdf.go.ke',
                    'phone' => '+254 744 556 677',
                    'role' => 'school_officer',
                    'national_id' => '34567890',
                    'password' => \Illuminate\Support\Facades\Hash::make('William#20'),
                    'designation' => 'Institution Principal / Bursar',
                    'school_id' => 1,
                    'is_active' => true,
                ]
            );

            // 3. Applicant Willy Mutunga
            $applicant = \App\Models\User::updateOrCreate(
                ['national_id' => '41354125'],
                [
                    'name' => 'Willy Mutunga',
                    'email' => 'applicant@ngcdf.go.ke',
                    'phone' => '0712345678',
                    'role' => 'applicant',
                    'national_id' => '41354125',
                    'password' => \Illuminate\Support\Facades\Hash::make('William#20'),
                    'ward_id' => 1,
                    'is_active' => true,
                ]
            );

            // 4. Ensure Cycle
            $cycle = \App\Models\BursaryCycle::firstOrCreate(
                ['academic_year' => '2026/2027'],
                [
                    'title' => '2026/2027 Financial Year (Cycle 1)',
                    'total_budget' => 30000000.00,
                    'allocated_amount' => 10000.00,
                    'start_date' => '2026-06-01',
                    'end_date' => '2026-09-30',
                    'is_active' => true,
                    'status' => 'committee_review',
                ]
            );

            // 5. Ensure Application CDF/BURS/2026/000001
            \App\Models\Application::updateOrCreate(
                ['application_no' => 'CDF/BURS/2026/000001'],
                [
                    'cycle_id' => $cycle->id,
                    'user_id' => $applicant->id,
                    'ward_id' => 1,
                    'institution_id' => 2,
                    'institution_type' => 'university',
                    'stage' => 'approved',
                    'full_name' => 'Willy Mutunga',
                    'national_id' => '41354125',
                    'phone' => '0712345678',
                    'admission_no' => 'P01/0018/2022',
                    'course_name' => 'BSC COMPUTER SCIENCE',
                    'year_of_study' => 'Year 2',
                    'fees_payable' => 65000.00,
                    'fees_paid' => 40000.00,
                    'fee_balance' => 25000.00,
                    'requested_amount' => 25000.00,
                    'approved_amount' => 10000.00,
                    'vulnerability_category' => 'General',
                    'score' => 85,
                    'verification_status' => 'verified',
                    'is_disabled' => false,
                    'guardian_monthly_income' => 15000.00,
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Staff and baseline applications verified and synced successfully.',
                'total_users' => \App\Models\User::count(),
                'total_applications' => \App\Models\Application::count(),
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
            ], 500);
        }
    });
});

// Public Award QR Verification
Route::get('/verify/award/{hash}', [AwardVerificationController::class, 'verify']);

// Applicant Portal Routes
Route::prefix('applicant')->group(function () {
    Route::get('/my-applications', [ApplicantController::class, 'myApplications']);
    Route::get('/applications/{id}', [ApplicantController::class, 'show']);
    Route::post('/verify-id', [ApplicantController::class, 'verifyNationalId']);
    Route::post('/submit-wizard', [ApplicantController::class, 'submitWizard']);
    Route::get('/notifications', [ApplicantController::class, 'notifications']);
});

// Verification Officer Routes
Route::prefix('verification')->group(function () {
    Route::get('/queue', [VerificationOfficerController::class, 'queue']);
    Route::get('/applications/{id}', [VerificationOfficerController::class, 'showDetails']);
    Route::post('/documents/{docId}/status', [VerificationOfficerController::class, 'updateDocumentStatus']);
    Route::post('/applications/{id}/field-verification', [VerificationOfficerController::class, 'recordFieldVerification']);
    Route::post('/applications/{id}/forward-committee', [VerificationOfficerController::class, 'forwardToCommittee']);
});

// Committee Review & Decisions
Route::prefix('committee')->group(function () {
    Route::get('/applications', [CommitteeController::class, 'index']);
    Route::post('/applications/{id}/decision', [CommitteeController::class, 'recordDecision']);
});

// Finance & Disbursement Module
Route::prefix('finance')->group(function () {
    Route::get('/dashboard', [FinanceController::class, 'dashboard']);
    Route::post('/batches', [FinanceController::class, 'createBatch']);
});

// School Verification Portal
Route::prefix('school')->group(function () {
    Route::get('/students', [SchoolPortalController::class, 'index']);
    Route::post('/students/{id}/confirm', [SchoolPortalController::class, 'confirmStudent']);
});

// Management & Analytics Portal
Route::prefix('analytics')->group(function () {
    Route::get('/dashboard', [AnalyticsController::class, 'dashboard']);
});

// System Settings & Audit Trail
Route::prefix('settings')->group(function () {
    Route::get('/', [SystemSettingsController::class, 'index']);
    Route::get('/audit-logs', [SystemSettingsController::class, 'auditLogs']);
    Route::post('/scoring-weights', [SystemSettingsController::class, 'updateScoringWeights']);
});

// Super Admin Management & Live Governance
Route::prefix('admin')->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\Api\AdminController::class, 'dashboard']);
    Route::post('/cycle/toggle-window', [\App\Http\Controllers\Api\AdminController::class, 'toggleCycleWindow']);
    Route::post('/wards/{id}/budget', [\App\Http\Controllers\Api\AdminController::class, 'updateWardBudget']);
    Route::post('/users', [\App\Http\Controllers\Api\AdminController::class, 'createUser']);
    Route::delete('/users/{id}', [\App\Http\Controllers\Api\AdminController::class, 'deleteUser']);
    Route::post('/users/{id}/reset-password', [\App\Http\Controllers\Api\AdminController::class, 'resetUserPassword']);
});

