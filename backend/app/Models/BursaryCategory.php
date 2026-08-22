<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BursaryCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'max_award',
        'description',
    ];

    public function applications()
    {
        return $this->hasMany(Application::class, 'category_id');
    }
}
