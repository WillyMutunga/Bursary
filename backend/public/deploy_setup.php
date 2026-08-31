<?php

/**
 * 1-Click Web-Based Migration & Seeder Runner for cPanel (No Terminal Needed)
 * Access via: https://bursary.skysoftsystems.co.ke/deploy_setup.php?secret=Bursary2026Init
 */

define('LARAVEL_START', microtime(true));

$secretKey = 'Bursary2026Init';

if (!isset($_GET['secret']) || $_GET['secret'] !== $secretKey) {
    http_response_code(403);
    die('<h1>403 Forbidden</h1><p>Invalid or missing secret key.</p>');
}

// Locate Laravel autoload
$autoloadPath = __DIR__ . '/../vendor/autoload.php';
$appPath = __DIR__ . '/../bootstrap/app.php';

if (!file_exists($autoloadPath)) {
    $autoloadPath = __DIR__ . '/../bursary_backend/vendor/autoload.php';
    $appPath = __DIR__ . '/../bursary_backend/bootstrap/app.php';
}

if (!file_exists($autoloadPath)) {
    die('<h1>Error</h1><p>Cannot find autoload.php at: ' . htmlspecialchars($autoloadPath) . '</p>');
}

require $autoloadPath;
$app = require_once $appPath;

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Bursary System - 1-Click Database Setup</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0B132B; color: #fff; padding: 40px 20px; line-height: 1.6; }
        .card { max-width: 700px; margin: 0 auto; background: #1C2541; padding: 30px; border-radius: 20px; border: 1px solid #3A506B; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        h1 { color: #D4A72C; margin-top: 0; font-size: 24px; }
        .log-box { background: #0B0F19; border: 1px solid #233142; border-radius: 12px; padding: 15px; font-family: monospace; font-size: 13px; color: #10B981; max-height: 350px; overflow-y: auto; white-space: pre-wrap; margin: 20px 0; }
        .btn { display: inline-block; background: #0B6B3A; color: white; text-decoration: none; padding: 12px 24px; font-weight: bold; border-radius: 12px; font-size: 14px; margin-top: 15px; }
        .btn:hover { background: #0d8246; }
        .badge { background: #D4A72C; color: #0F172A; padding: 3px 8px; border-radius: 6px; font-weight: bold; font-size: 11px; text-transform: uppercase; }
        .error { color: #EF4444; }
    </style>
</head>
<body>
<div class="card">
    <span class="badge">REPUBLIC OF KENYA • NG-CDF KIBWEZI WEST</span>
    <h1>Automatic Database Migration & Seeder Runner</h1>
    <p style="color: #94A3B8; font-size: 14px;">Running database migrations and seeders without terminal access...</p>

    <div class="log-box">
<?php
try {
    echo "1. Testing Database Connection...\n";
    DB::connection()->getPdo();
    echo "✓ Database connected successfully to: " . DB::connection()->getDatabaseName() . "\n\n";

    echo "2. Running Database Migrations (php artisan migrate --force)...\n";
    Artisan::call('migrate', ['--force' => true]);
    echo Artisan::output() . "\n";

    echo "3. Resetting Users & Seeding Single Super Admin...\n";
    
    // Clear all users
    try {
        DB::statement('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
    } catch (\Exception $e) {
        DB::table('users')->delete();
    }

    // Create Super Admin Willy
    \App\Models\User::create([
        'name' => 'Willy',
        'email' => 'admin@ngcdf.go.ke',
        'phone' => '+254 700 000 000',
        'role' => 'admin',
        'national_id' => '41354126',
        'password' => \Illuminate\Support\Facades\Hash::make('William#20'),
        'designation' => 'Constituency Fund Manager / Super Admin',
        'is_active' => true,
    ]);
    echo "✓ Seeded Single Super Admin: Willy (Password: William#20)\n";
    echo "✓ All other user accounts have been removed.\n";

    // Seed wards & cycle if missing
    if (\App\Models\Ward::count() === 0) {
        Artisan::call('db:seed', ['--force' => true]);
    }

    echo "4. Clearing & Optimizing Cache (config, route, cache)...\n";
    Artisan::call('config:clear');
    Artisan::call('cache:clear');
    Artisan::call('route:clear');
    echo "✓ Application caches cleared successfully.\n\n";

    echo "========================================================\n";
    echo "🎉 USER RESET & SUPER ADMIN INITIALIZATION COMPLETE!\n";
    echo "Username: Willy\n";
    echo "Password: William#20\n";
    echo "Role: Constituency Fund Manager / Super Admin\n";
    echo "========================================================\n";

} catch (\Exception $e) {
    echo '<span class="error">ERROR ENCOUNTERED: ' . htmlspecialchars($e->getMessage()) . "</span>\n";
    echo '<span class="error">' . htmlspecialchars($e->getTraceAsString()) . "</span>\n";
}
?>
    </div>

    <p style="color: #F59E0B; font-size: 12px;">⚠️ <strong>SECURITY NOTE:</strong> Please delete <code>deploy_setup.php</code> from your file manager now that setup is complete.</p>

    <a href="/" class="btn">Go to Bursary System Homepage →</a>
</div>
</body>
</html>
