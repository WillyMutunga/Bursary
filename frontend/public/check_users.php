<?php

/**
 * Diagnostic Tool: Check current system users in PostgreSQL
 * URL: https://bursary.skysoftsystems.co.ke/check_users.php
 */

$possibleAutoloads = [
    __DIR__ . '/backend/vendor/autoload.php' => __DIR__ . '/backend/bootstrap/app.php',
    __DIR__ . '/../vendor/autoload.php' => __DIR__ . '/../bootstrap/app.php',
    __DIR__ . '/../backend/vendor/autoload.php' => __DIR__ . '/../backend/bootstrap/app.php',
    __DIR__ . '/vendor/autoload.php' => __DIR__ . '/bootstrap/app.php',
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
    die(json_encode(['error' => 'Cannot find autoload.php']));
}

require $autoloadPath;
$app = require_once $appPath;

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

use App\Models\User;
use Illuminate\Support\Facades\DB;

header('Content-Type: application/json');

try {
    $dbName = DB::connection()->getDatabaseName();
    $users = User::select('id', 'name', 'email', 'role', 'national_id', 'phone', 'is_active', 'created_at')->get();
    
    echo json_encode([
        'success' => true,
        'database' => $dbName,
        'total_users' => $users->count(),
        'users' => $users,
    ], JSON_PRETTY_PRINT);
} catch (\Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
    ], JSON_PRETTY_PRINT);
}
