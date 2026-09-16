<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Users
        if (Schema::hasTable('users') && !Schema::hasColumn('users', 'constituency_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->foreignId('constituency_id')->nullable()->after('id')->constrained('constituencies')->onDelete('set null');
            });
        }

        // 2. Wards
        if (Schema::hasTable('wards') && !Schema::hasColumn('wards', 'constituency_id')) {
            Schema::table('wards', function (Blueprint $table) {
                $table->foreignId('constituency_id')->nullable()->after('id')->constrained('constituencies')->onDelete('cascade');
            });
        }

        // 3. Bursary Cycles
        if (Schema::hasTable('bursary_cycles') && !Schema::hasColumn('bursary_cycles', 'constituency_id')) {
            Schema::table('bursary_cycles', function (Blueprint $table) {
                $table->foreignId('constituency_id')->nullable()->after('id')->constrained('constituencies')->onDelete('cascade');
            });
        }

        // 4. Applications
        if (Schema::hasTable('applications') && !Schema::hasColumn('applications', 'constituency_id')) {
            Schema::table('applications', function (Blueprint $table) {
                $table->foreignId('constituency_id')->nullable()->after('id')->constrained('constituencies')->onDelete('cascade');
            });
        }

        // 5. Payment Batches
        if (Schema::hasTable('payment_batches') && !Schema::hasColumn('payment_batches', 'constituency_id')) {
            Schema::table('payment_batches', function (Blueprint $table) {
                $table->foreignId('constituency_id')->nullable()->after('id')->constrained('constituencies')->onDelete('cascade');
            });
        }

        // 6. Audit Logs
        if (Schema::hasTable('audit_logs') && !Schema::hasColumn('audit_logs', 'constituency_id')) {
            Schema::table('audit_logs', function (Blueprint $table) {
                $table->foreignId('constituency_id')->nullable()->after('id')->constrained('constituencies')->onDelete('set null');
            });
        }
    }

    public function down(): void
    {
        $tables = ['users', 'wards', 'bursary_cycles', 'applications', 'payment_batches', 'audit_logs'];
        foreach ($tables as $tbl) {
            if (Schema::hasTable($tbl) && Schema::hasColumn($tbl, 'constituency_id')) {
                Schema::table($tbl, function (Blueprint $table) {
                    $table->dropConstrainedForeignId('constituency_id');
                });
            }
        }
    }
};
