<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Update users table with bursary roles & attributes
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
            $table->string('role')->default('applicant')->after('phone'); // applicant, verification_officer, committee_member, finance_officer, school_officer, admin
            $table->string('national_id')->nullable()->after('role');
            $table->unsignedBigInteger('ward_id')->nullable()->after('national_id');
            $table->unsignedBigInteger('school_id')->nullable()->after('ward_id');
            $table->string('designation')->nullable()->after('school_id');
            $table->boolean('is_active')->default(true)->after('designation');
        });

        // 1. Wards
        Schema::create('wards', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->string('sub_county')->default('Westlands');
            $table->integer('population')->default(35000);
            $table->decimal('budget_allocation', 14, 2)->default(6000000.00);
            $table->string('representative_name')->nullable();
            $table->timestamps();
        });

        // 2. Institutions
        Schema::create('institutions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->enum('type', ['secondary', 'tvet', 'university', 'special_needs'])->default('secondary');
            $table->string('county')->default('Nairobi');
            $table->string('contact_email')->nullable();
            $table->string('contact_phone')->nullable();
            $table->string('bank_name')->nullable();
            $table->string('bank_account_no')->nullable();
            $table->string('bank_branch')->nullable();
            $table->boolean('is_verified')->default(true);
            $table->timestamps();
        });

        // 3. Bursary Cycles
        Schema::create('bursary_cycles', function (Blueprint $table) {
            $table->id();
            $table->string('title'); // e.g. "2026/2027 Financial Year Cycle 1"
            $table->string('academic_year')->default('2026/2027');
            $table->decimal('total_budget', 14, 2)->default(30000000.00);
            $table->decimal('allocated_amount', 14, 2)->default(22500000.00);
            $table->decimal('disbursed_amount', 14, 2)->default(18700000.00);
            $table->date('start_date');
            $table->date('end_date');
            $table->boolean('is_active')->default(true);
            $table->enum('status', ['open', 'verification', 'committee_review', 'disbursement', 'closed'])->default('open');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // 4. Bursary Categories
        Schema::create('bursary_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->decimal('max_award', 12, 2)->default(30000.00);
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // 5. Applications
        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->string('application_no')->unique(); // e.g. CDF/BURS/2026/000245
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('cycle_id')->constrained('bursary_cycles')->onDelete('cascade');
            $table->foreignId('category_id')->nullable()->constrained('bursary_categories');
            $table->foreignId('ward_id')->nullable()->constrained('wards');
            $table->foreignId('institution_id')->nullable()->constrained('institutions');

            // Lifecycle Stage
            $table->enum('stage', [
                'draft',
                'submitted',
                'under_verification',
                'field_verification',
                'committee_review',
                'approved',
                'rejected',
                'deferred',
                'awarded',
                'paid'
            ])->default('submitted');

            // Personal Information
            $table->string('full_name');
            $table->string('national_id')->index();
            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->default('male');
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('location')->nullable();
            $table->string('sub_location')->nullable();
            $table->string('village')->nullable();
            $table->string('physical_address')->nullable();

            // Education Information
            $table->string('admission_no')->index()->nullable();
            $table->string('course_name')->nullable();
            $table->string('year_of_study')->nullable();
            $table->string('semester_term')->nullable();
            $table->decimal('fees_payable', 12, 2)->default(0.00);
            $table->decimal('fees_paid', 12, 2)->default(0.00);
            $table->decimal('fee_balance', 12, 2)->default(0.00);
            $table->string('previous_term_gpa')->nullable();

            // Guardian / Household Information
            $table->enum('parent_status', ['both_alive', 'single_parent', 'total_orphan', 'partial_orphan', 'vulnerable'])->default('both_alive');
            $table->string('guardian_name')->nullable();
            $table->string('guardian_id')->nullable();
            $table->string('guardian_phone')->nullable();
            $table->string('guardian_occupation')->nullable();
            $table->decimal('guardian_monthly_income', 12, 2)->default(0.00);
            $table->integer('family_size')->default(4);
            $table->integer('siblings_in_school')->default(2);

            // Vulnerability & Special Needs
            $table->boolean('is_disabled')->default(false);
            $table->string('disability_details')->nullable();
            $table->boolean('has_chronic_illness')->default(false);
            $table->text('chronic_illness_details')->nullable();
            $table->boolean('is_displaced_family')->default(false);
            $table->text('special_circumstances')->nullable();

            // Scoring (Smart 100-pt Explainable Score)
            $table->integer('score_financial_need')->default(0); // Max 25
            $table->integer('score_vulnerability')->default(0);  // Max 20
            $table->integer('score_fee_burden')->default(0);     // Max 20
            $table->integer('score_education_need')->default(0); // Max 15
            $table->integer('score_household')->default(0);      // Max 10
            $table->integer('score_previous_support')->default(0);// Max 10
            $table->integer('total_score')->default(0);          // Max 100

            // Risk & Duplicate Radar
            $table->enum('duplicate_risk', ['low', 'medium', 'high'])->default('low');
            $table->text('duplicate_flag_reason')->nullable();
            $table->enum('id_verification_status', ['VERIFIED', 'NAME_MISMATCH', 'ID_NOT_VERIFIED', 'MANUAL_REVIEW'])->default('VERIFIED');
            $table->integer('ocr_match_percentage')->default(95);

            // Decisions & Awards
            $table->decimal('recommended_amount', 12, 2)->default(0.00);
            $table->decimal('approved_amount', 12, 2)->default(0.00);
            $table->decimal('disbursed_amount', 12, 2)->default(0.00);
            $table->date('decision_date')->nullable();
            $table->text('decision_reason')->nullable();
            $table->unsignedBigInteger('decision_by_user_id')->nullable();

            // Security & QR Verification
            $table->string('award_certificate_hash')->nullable()->unique();
            $table->text('qr_payload')->nullable();
            $table->integer('qr_verified_count')->default(0);
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();
        });

        // 6. Documents
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained()->onDelete('cascade');
            $table->enum('document_type', [
                'id_card',
                'fee_structure',
                'admission_letter',
                'death_certificate',
                'disability_card',
                'academic_transcript',
                'chief_letter'
            ]);
            $table->string('title');
            $table->string('file_name');
            $table->string('file_path');
            $table->integer('file_size_kb')->default(250);
            $table->enum('ocr_status', ['pending', 'processed', 'flagged'])->default('processed');
            $table->json('ocr_extracted_data')->nullable();
            $table->integer('ocr_match_score')->default(95);
            $table->enum('verification_status', ['pending', 'verified', 'rejected', 'manual_review'])->default('verified');
            $table->text('officer_notes')->nullable();
            $table->timestamps();
        });

        // 7. Identity Verifications (Pluggable Provider Log)
        Schema::create('identity_verifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('national_id');
            $table->string('queried_name');
            $table->string('verified_name')->nullable();
            $table->enum('status', ['VERIFIED', 'NAME_MISMATCH', 'ID_NOT_VERIFIED', 'MANUAL_REVIEW'])->default('VERIFIED');
            $table->boolean('name_match')->default(true);
            $table->boolean('id_match')->default(true);
            $table->string('provider_name')->default('IPRS_GATEWAY_V2');
            $table->string('provider_reference')->default('IPRS-REF-892193');
            $table->json('response_metadata')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
        });

        // 8. Field Verifications
        Schema::create('field_verifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained()->onDelete('cascade');
            $table->foreignId('officer_id')->constrained('users')->onDelete('cascade');
            $table->date('visit_date');
            $table->boolean('applicant_visited')->default(true);
            $table->boolean('guardian_interviewed')->default(true);
            $table->boolean('household_verified')->default(true);
            $table->string('location_visited');
            $table->string('gps_coordinates')->nullable();
            $table->text('findings');
            $table->enum('recommendation', ['VERIFIED', 'NOT_VERIFIED', 'REQUIRES_FURTHER_REVIEW'])->default('VERIFIED');
            $table->timestamps();
        });

        // 9. Committee Decisions & Audits
        Schema::create('committee_decisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained()->onDelete('cascade');
            $table->foreignId('committee_user_id')->constrained('users')->onDelete('cascade');
            $table->decimal('recommended_amount', 12, 2);
            $table->decimal('approved_amount', 12, 2);
            $table->boolean('amount_modified')->default(false);
            $table->text('modification_reason')->nullable();
            $table->enum('decision', ['APPROVE', 'REJECT', 'DEFER', 'RETURN_FOR_VERIFICATION'])->default('APPROVE');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 10. Payment Batches & Payments
        Schema::create('payment_batches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cycle_id')->constrained('bursary_cycles')->onDelete('cascade');
            $table->string('batch_no')->unique(); // e.g. BATCH-2026-AUG-001
            $table->decimal('total_amount', 14, 2);
            $table->integer('beneficiary_count');
            $table->enum('payment_method', ['EFT', 'CHEQUE', 'MPESA_B2C'])->default('EFT');
            $table->enum('status', ['pending_approval', 'approved', 'disbursed', 'reconciled'])->default('approved');
            $table->foreignId('created_by_user_id')->nullable()->constrained('users');
            $table->foreignId('approved_by_user_id')->nullable()->constrained('users');
            $table->timestamp('disbursed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_batch_id')->constrained()->onDelete('cascade');
            $table->foreignId('application_id')->constrained()->onDelete('cascade');
            $table->foreignId('institution_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 12, 2);
            $table->string('cheque_eft_number');
            $table->enum('status', ['pending', 'cleared', 'bounced', 'reconciled'])->default('cleared');
            $table->date('payment_date');
            $table->timestamps();
        });

        // 11. School Confirmations
        Schema::create('school_confirmations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained()->onDelete('cascade');
            $table->foreignId('institution_id')->constrained()->onDelete('cascade');
            $table->foreignId('verified_by_user_id')->nullable()->constrained('users');
            $table->boolean('is_enrolled')->default(true);
            $table->string('confirmed_admission_no');
            $table->decimal('confirmed_fee_balance', 12, 2);
            $table->text('comments')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamps();
        });

        // 12. Notifications
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('application_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('message');
            $table->enum('type', ['status_change', 'action_required', 'award_ready', 'sms_alert'])->default('status_change');
            $table->boolean('is_read')->default(false);
            $table->timestamps();
        });

        // 13. Audit Logs
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('user_name')->default('System');
            $table->string('user_role')->default('system');
            $table->string('action'); // e.g. 'APPLICATION_APPROVED', 'AMOUNT_MODIFIED', 'DOCUMENT_OCR_PROCESSED'
            $table->string('module'); // e.g. 'Applications', 'Committee', 'Finance', 'Verification'
            $table->string('record_id')->nullable();
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip_address')->nullable();
            $table->timestamps();
        });

        // 14. System Settings
        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value');
            $table->string('group')->default('general');
            $table->string('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('system_settings');
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('school_confirmations');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('payment_batches');
        Schema::dropIfExists('committee_decisions');
        Schema::dropIfExists('field_verifications');
        Schema::dropIfExists('identity_verifications');
        Schema::dropIfExists('documents');
        Schema::dropIfExists('applications');
        Schema::dropIfExists('bursary_categories');
        Schema::dropIfExists('bursary_cycles');
        Schema::dropIfExists('institutions');
        Schema::dropIfExists('wards');
    }
};
