<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

// Create Super Admin in PostgreSQL
$superAdmin = User::updateOrCreate(
    ['email' => 'admin@ngcdf.go.ke'],
    [
        'name' => 'Alex Kimani (Super Admin)',
        'national_id' => '00000001',
        'phone' => '0700000000',
        'password' => Hash::make('Admin#2026'),
        'role' => 'admin',
        'designation' => 'Constituency Fund Manager / Super Admin',
        'ward_id' => 1,
        'is_active' => true,
    ]
);

echo "SUCCESS: Super Admin created with Email: {$superAdmin->email}, Password: Admin#2026, Role: {$superAdmin->role}\n";
