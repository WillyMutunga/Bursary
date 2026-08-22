<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Institution extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'type', // secondary, tvet, university, special_needs
        'county',
        'contact_email',
        'contact_phone',
        'bank_name',
        'bank_account_no',
        'bank_branch',
        'is_verified',
    ];

    public function applications()
    {
        return $this->hasMany(Application::class);
    }
}
