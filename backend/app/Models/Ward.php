<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ward extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'sub_county',
        'population',
        'budget_allocation',
        'representative_name',
    ];

    public function applications()
    {
        return $this->hasMany(Application::class);
    }
}
