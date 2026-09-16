<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Constituency extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'code',
        'county',
        'mp_name',
        'mp_title',
        'mp_photo_url',
        'mp_message',
        'fund_account_manager',
        'office_postal_address',
        'office_location',
        'office_email',
        'office_phone',
        'logo_url',
        'primary_color',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function wards()
    {
        return $this->hasMany(Ward::class);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function applications()
    {
        return $this->hasMany(Application::class);
    }

    public function bursaryCycles()
    {
        return $this->hasMany(BursaryCycle::class);
    }

    public function paymentBatches()
    {
        return $this->hasMany(PaymentBatch::class);
    }

    public function activeCycle()
    {
        return $this->hasOne(BursaryCycle::class)->where('is_active', true)->latest();
    }
}
