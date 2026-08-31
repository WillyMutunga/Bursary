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

    echo "2. Wiping all existing user accounts...\n";
    try {
        DB::statement('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
    } catch (\Exception $e) {
        DB::table('users')->delete();
    }
    echo "✓ All previous users cleared.\n\n";

    echo "3. Creating Single Super Admin User...\n";
    $admin = User::create([
        'name' => 'Willy',
        'email' => 'admin@ngcdf.go.ke',
        'phone' => '+254 700 000 000',
        'role' => 'admin',
        'national_id' => '41354126',
        'password' => Hash::make('William#20'),
        'designation' => 'Constituency Fund Manager / Super Admin',
        'is_active' => true,
    ]);
    echo "✓ Super Admin Created Successfully!\n";
    echo "• Username: Willy\n";
    echo "• Email: admin@ngcdf.go.ke\n";
    echo "• Password: William#20\n\n";

    echo "4. Clearing and optimizing application caches...\n";
    Artisan::call('config:clear');
    Artisan::call('cache:clear');
    Artisan::call('route:clear');
    echo "✓ System caches cleared.\n\n";

    echo "========================================================\n";
    echo "🎉 COMPLETE! Only Super Admin 'Willy' exists now.\n";
    echo "All staff roles can be created from the Admin Dashboard.\n";
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
