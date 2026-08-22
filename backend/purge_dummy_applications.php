<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Application;
use App\Models\Document;
use App\Models\IdentityVerification;
use App\Models\FieldVerification;
use App\Models\CommitteeDecision;
use App\Models\Payment;
use App\Models\PaymentBatch;
use App\Models\Notification;
use App\Models\AuditLog;
use Illuminate\Support\Facades\DB;

// Disable foreign keys temporarily for clean truncation/deletion
DB::statement('TRUNCATE TABLE payments, payment_batches, committee_decisions, field_verifications, identity_verifications, documents, applications, notifications CASCADE;');

echo "SUCCESS: All dummy applications, documents, decisions, and payments have been completely purged from PostgreSQL.\n";
