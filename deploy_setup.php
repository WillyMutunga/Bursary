<?php

/**
 * 1-Click User Reset & Super Admin Initializer
 * Access: https://bursary.skysoftsystems.co.ke/deploy_setup.php?secret=Bursary2026Init
 */

define('LARAVEL_START', microtime(true));

$secretKey = 'Bursary2026Init';

if (!isset($_GET['secret']) || $_GET['secret'] !== $secretKey) {
    http_response_code(403);
    die('<h1>403 Forbidden</h1><p>Invalid or missing secret key.</p>');
}

// Check paths for backend
$possibleAutoloads = [
    __DIR__ . '/backend/vendor/autoload.php' => __DIR__ . '/backend/bootstrap/app.php',
    __DIR__ . '/../backend/vendor/autoload.php' => __DIR__ . '/../backend/bootstrap/app.php',
    __DIR__ . '/vendor/autoload.php' => __DIR__ . '/bootstrap/app.php',
    __DIR__ . '/../bursary_backend/vendor/autoload.php' => __DIR__ . '/../bursary_backend/bootstrap/app.php',
];

$autoloadPath = null;
$appPath = null;

foreach ($possibleAutoloads as $auto => $app) {
    if (file_exists($auto)) {
        $autoloadPath = $auto;
        $appPath = $app;
        break;
    }
}

if (!$autoloadPath) {
    die('<h1>Error</h1><p>Cannot find vendor/autoload.php. Looked in:<br>' . implode('<br>', array_keys($possibleAutoloads)) . '</p>');
}

require $autoloadPath;
$app = require_once $appPath;

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Artisan;
use App\Models\User;

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Bursary System - User Reset</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0B132B; color: #fff; padding: 40px 20px; }
        .card { max-width: 700px; margin: 0 auto; background: #1C2541; padding: 30px; border-radius: 20px; border: 1px solid #3A506B; }
        h1 { color: #D4A72C; margin-top: 0; font-size: 24px; }
        .log-box { background: #0B0F19; border: 1px solid #233142; border-radius: 12px; padding: 15px; font-family: monospace; font-size: 13px; color: #10B981; margin: 20px 0; white-space: pre-wrap; }
        .btn { display: inline-block; background: #0B6B3A; color: white; text-decoration: none; padding: 12px 24px; font-weight: bold; border-radius: 12px; }
    </style>
</head>
<body>
<div class="card">
    <h1>Constituency Bursary System - User Management Initializer</h1>
    <div class="log-box">
<?php
try {
    echo "1. Connecting to PostgreSQL Database...\n";
    DB::connection()->getPdo();
    echo "✓ Connected to: " . DB::connection()->getDatabaseName() . "\n\n";

    echo "2. Ensuring Super Admin User...\n";
    $admin = User::updateOrCreate(
        ['email' => 'admin@ngcdf.go.ke'],
        [
            'name' => 'Willy',
            'email' => 'admin@ngcdf.go.ke',
            'phone' => '+254 700 000 000',
            'role' => 'admin',
            'national_id' => '41354126',
            'password' => Hash::make('William#20'),
            'designation' => 'Constituency Fund Manager / Super Admin',
            'is_active' => true,
        ]
    );
    echo "✓ Super Admin Verified!\n";
    echo "• Username: Willy\n• Email: admin@ngcdf.go.ke\n• National ID: 41354126\n\n";

    // Clean up any extra dummy staff accounts if they exist
    User::whereIn('email', [
        'verification@ngcdf.go.ke',
        'finance@ngcdf.go.ke',
        'school@ngcdf.go.ke',
    ])->delete();

    echo "3. Ensuring Committee Member Christine Mbatha (ID: 12345678)...\n";
    $christine = User::updateOrCreate(
        ['email' => 'committee@ngcdf.go.ke'],
        [
            'name' => 'Christine Mbatha',
            'email' => 'committee@ngcdf.go.ke',
            'phone' => '+254 700 000 000',
            'role' => 'committee_member',
            'national_id' => '12345678',
            'password' => Hash::make('William#20'),
            'designation' => 'Constituency Bursary Committee Member',
            'ward_id' => 1,
            'is_active' => true,
        ]
    );
    echo "✓ Committee Member Verified: Christine Mbatha (ID: 12345678, committee@ngcdf.go.ke)\n\n";

    echo "\n4. Ensuring Baseline Constituency Bursary Application...\n";
    $applicant = User::where('national_id', '41354125')->first();
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

    // Ensure columns exist on applications table
    if (\Illuminate\Support\Facades\Schema::hasTable('applications')) {
        if (!\Illuminate\Support\Facades\Schema::hasColumn('applications', 'institution_postal_address')) {
            \Illuminate\Support\Facades\Schema::table('applications', function (\Illuminate\Database\Schema\Blueprint $table) {
                $table->string('institution_postal_address')->nullable();
                $table->string('institution_campus_branch')->nullable();
            });
            echo "✓ Added columns institution_postal_address and institution_campus_branch to applications table.\n";
        }
    }

    // Ensure Kenyatta University exists in institutions table
    $ku = \App\Models\Institution::firstOrCreate(
        ['name' => 'Kenyatta University (KU)'],
        [
            'code' => 'KU-002',
            'type' => 'university',
            'county' => 'Nairobi',
            'contact_email' => 'finance@ku.ac.ke',
            'contact_phone' => '+254 20 8710901',
            'bank_name' => 'National Bank of Kenya',
            'bank_account_no' => '01003000900',
            'bank_branch' => 'Kenyatta University Branch',
            'is_verified' => true,
        ]
    );

    // Merge any duplicate KENYATTA UNIVERSITY institutions into Kenyatta University (KU)
    $otherKus = \App\Models\Institution::where('id', '!=', $ku->id)
        ->whereRaw('LOWER(name) LIKE ?', ['%kenyatta%'])
        ->get();
    foreach ($otherKus as $dup) {
        \App\Models\Application::where('institution_id', $dup->id)->update([
            'institution_id' => $ku->id,
            'institution_postal_address' => 'P.O. Box 43844 - 00100, Nairobi',
            'institution_campus_branch' => 'Main Campus - Along Thika Superhighway',
        ]);
        try {
            $dup->delete();
        } catch (\Exception $e) {}
        echo "✓ Consolidated duplicate institution record (ID: {$dup->id}, {$dup->name}) into {$ku->name}\n";
    }

    if ($applicant) {
        \App\Models\Application::updateOrCreate(
            ['application_no' => 'CDF/BURS/2026/000001'],
            [
                'cycle_id' => $cycle->id,
                'user_id' => $applicant->id,
                'ward_id' => 1,
                'institution_id' => $ku->id,
                'institution_type' => 'university',
                'stage' => 'approved',
                'full_name' => 'Willy Mutunga',
                'national_id' => '41354125',
                'phone' => '0712345678',
                'admission_no' => 'P01/0018/2022',
                'course_name' => 'BSC COMPUTER SCIENCE',
                'year_of_study' => 'Year 2',
                'institution_postal_address' => 'P.O. Box 43844 - 00100, Nairobi',
                'institution_campus_branch' => 'Main Campus - Along Thika Superhighway',
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
        echo "✓ Application CDF/BURS/2026/000001 verified with Kenyatta University postal address in database.\n";
    }

    echo "\n5. Clearing application caches...\n";
    Artisan::call('config:clear');
    Artisan::call('cache:clear');
    Artisan::call('route:clear');
    echo "✓ System caches cleared.\n\n";

    echo "========================================================\n";
    echo "🎉 COMPLETE! Database state verified.\n";
    echo "• Total Users: " . User::count() . "\n";
    echo "• Total Applications: " . \App\Models\Application::count() . "\n";
    echo "========================================================\n";

} catch (\Exception $e) {
    echo "ERROR: " . htmlspecialchars($e->getMessage()) . "\n";
}
?>
    </div>
    <a href="/" class="btn">Go to Bursary Portal →</a>
</div>
</body>
</html>
