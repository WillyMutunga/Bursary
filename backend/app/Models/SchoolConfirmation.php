<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SchoolConfirmation extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'is_enrolled' => 'boolean',
        'confirmed_fee_balance' => 'decimal:2',
        'confirmed_at' => 'datetime',
    ];

    public function application()
    {
        return $this->belongsTo(Application::class);
    }

    public function institution()
    {
        return $this->belongsTo(Institution::class);
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by_user_id');
    }
}
