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
            'users' => \App\Models\User::all(),
            'audit_logs' => \App\Models\AuditLog::latest()->limit(50)->get(),
            'applications_count' => \App\Models\Application::count(),
            'applications' => \App\Models\Application::all(),
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
    Route::get('/clean-users', function () {
        // Delete any added dummy users
        \App\Models\User::whereIn('email', [
            'verification@ngcdf.go.ke',
            'committee@ngcdf.go.ke',
            'finance@ngcdf.go.ke',
            'school@ngcdf.go.ke',
        ])->delete();

        return response()->json([
            'success' => true,
            'message' => 'Cleaned dummy users. Only original user accounts remain.',
            'users' => \App\Models\User::select('id', 'name', 'email', 'role', 'national_id')->get(),
        ]);
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

