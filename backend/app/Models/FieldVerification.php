<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FieldVerification extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'visit_date' => 'date',
        'applicant_visited' => 'boolean',
        'guardian_interviewed' => 'boolean',
        'household_verified' => 'boolean',
    ];

    public function application()
    {
        return $this->belongsTo(Application::class);
    }

    public function officer()
    {
        return $this->belongsTo(User::class, 'officer_id');
    }
}
