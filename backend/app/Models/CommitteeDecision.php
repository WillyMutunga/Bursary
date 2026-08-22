<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommitteeDecision extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'recommended_amount' => 'decimal:2',
        'approved_amount' => 'decimal:2',
        'amount_modified' => 'boolean',
    ];

    public function application()
    {
        return $this->belongsTo(Application::class);
    }

    public function committeeUser()
    {
        return $this->belongsTo(User::class, 'committee_user_id');
    }
}
