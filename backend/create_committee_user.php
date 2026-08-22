<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$user = User::updateOrCreate(
    ['name' => 'Willy'],
    [
        'email' => 'willy.committee@ngcdf.go.ke',
        'national_id' => '10000001',
        'phone' => '0700000001',
        'password' => Hash::make('William#20'),
        'role' => 'committee_member',
        'designation' => 'Bursary Committee Member',
        'ward_id' => 1,
        'is_active' => true,
    ]
);

echo "SUCCESS: Committee user created with ID {$user->id}, Name: {$user->name}, Email: {$user->email}, Role: {$user->role}\n";
