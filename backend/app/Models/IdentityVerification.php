<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IdentityVerification extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'name_match' => 'boolean',
        'id_match' => 'boolean',
        'response_metadata' => 'array',
        'verified_at' => 'datetime',
    ];

    public function application()
    {
        return $this->belongsTo(Application::class);
    }
}
