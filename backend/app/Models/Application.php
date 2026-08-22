<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'is_disabled' => 'boolean',
        'has_chronic_illness' => 'boolean',
        'is_displaced_family' => 'boolean',
        'fees_payable' => 'decimal:2',
        'fees_paid' => 'decimal:2',
        'fee_balance' => 'decimal:2',
        'guardian_monthly_income' => 'decimal:2',
        'recommended_amount' => 'decimal:2',
        'approved_amount' => 'decimal:2',
        'disbursed_amount' => 'decimal:2',
        'submitted_at' => 'datetime',
        'decision_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function cycle()
    {
        return $this->belongsTo(BursaryCycle::class, 'cycle_id');
    }

    public function category()
    {
        return $this->belongsTo(BursaryCategory::class, 'category_id');
    }

    public function ward()
    {
        return $this->belongsTo(Ward::class);
    }

    public function institution()
    {
        return $this->belongsTo(Institution::class);
    }

    public function documents()
    {
        return $this->hasMany(Document::class);
    }

    public function identityVerifications()
    {
        return $this->hasMany(IdentityVerification::class);
    }

    public function fieldVerifications()
    {
        return $this->hasMany(FieldVerification::class);
    }

    public function committeeDecisions()
    {
        return $this->hasMany(CommitteeDecision::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function schoolConfirmations()
    {
        return $this->hasMany(SchoolConfirmation::class);
    }
}
