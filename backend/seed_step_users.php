<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

// 1. Step 4: Finance Officer
$financeUser = User::updateOrCreate(
    ['email' => 'finance@ngcdf.go.ke'],
    [
        'name' => 'David Ochieng',
        'national_id' => '22114455',
        'phone' => '0722114455',
        'password' => Hash::make('Finance#2026'),
        'role' => 'finance_officer',
        'designation' => 'Finance & Disbursement Officer',
        'ward_id' => 1,
        'is_active' => true,
    ]
);

// 2. Step 5: School Registrar (UoN)
$schoolUser = User::updateOrCreate(
    ['email' => 'school@uonbi.ac.ke'],
    [
        'name' => 'Dr. Mary Mutiso',
        'national_id' => '19876543',
        'phone' => '0719876543',
        'password' => Hash::make('School#2026'),
        'role' => 'school_officer',
        'school_id' => 1,
        'designation' => 'Academic Registrar (UoN)',
        'ward_id' => 1,
        'is_active' => true,
    ]
);

echo "SUCCESS:\n";
echo "1. Finance User -> Email: {$financeUser->email}, Password: Finance#2026, Role: {$financeUser->role}\n";
echo "2. School User  -> Email: {$schoolUser->email}, Password: School#2026, Role: {$schoolUser->role}\n";
