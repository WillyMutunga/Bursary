<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BursaryCycle extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'academic_year',
        'total_budget',
        'allocated_amount',
        'disbursed_amount',
        'start_date',
        'end_date',
        'is_active',
        'status',
        'description',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'start_date' => 'date',
        'end_date' => 'date',
        'total_budget' => 'decimal:2',
        'allocated_amount' => 'decimal:2',
        'disbursed_amount' => 'decimal:2',
    ];

    public function applications()
    {
        return $this->hasMany(Application::class, 'cycle_id');
    }
}
