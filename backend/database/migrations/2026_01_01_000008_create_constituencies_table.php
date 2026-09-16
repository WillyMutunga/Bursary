<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('constituencies', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g. "Kibwezi West"
            $table->string('slug')->unique(); // e.g. "kibwezi-west"
            $table->string('code')->unique(); // e.g. "KBW-015"
            $table->string('county')->default('Makueni County');
            $table->string('mp_name')->default('Hon. Dr. Mwengi Mutuse, MP');
            $table->string('mp_title')->default('Member of National Assembly');
            $table->string('mp_photo_url')->nullable();
            $table->text('mp_message')->nullable();
            $table->string('fund_account_manager')->default('Constituency Fund Account Manager');
            $table->string('office_postal_address')->default('P.O. Box 128 - 90137, Kibwezi, Kenya');
            $table->string('office_location')->default('NG-CDF Office Building, Makindu / Kibwezi Town');
            $table->string('office_email')->nullable();
            $table->string('office_phone')->nullable();
            $table->string('logo_url')->nullable();
            $table->string('primary_color')->default('#0B6B3A');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('constituencies');
    }
};
