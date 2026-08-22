<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'role', // applicant, verification_officer, committee_member, finance_officer, school_officer, admin
        'national_id',
        'ward_id',
        'school_id',
        'designation',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function applications()
    {
        return $this->hasMany(Application::class);
    }

    public function ward()
    {
        return $this->belongsTo(Ward::class);
    }

    public function institution()
    {
        return $this->belongsTo(Institution::class, 'school_id');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }
}
