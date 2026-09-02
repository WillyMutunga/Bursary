<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('applications')) {
            Schema::table('applications', function (Blueprint $table) {
                if (!Schema::hasColumn('applications', 'institution_postal_address')) {
                    $table->string('institution_postal_address')->nullable();
                }
                if (!Schema::hasColumn('applications', 'institution_campus_branch')) {
                    $table->string('institution_campus_branch')->nullable();
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('applications')) {
            Schema::table('applications', function (Blueprint $table) {
                if (Schema::hasColumn('applications', 'institution_postal_address')) {
                    $table->dropColumn('institution_postal_address');
                }
                if (Schema::hasColumn('applications', 'institution_campus_branch')) {
                    $table->dropColumn('institution_campus_branch');
                }
            });
        }
    }
};
