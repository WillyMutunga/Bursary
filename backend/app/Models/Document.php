<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'ocr_extracted_data' => 'array',
        'ocr_match_score' => 'integer',
    ];

    public function application()
    {
        return $this->belongsTo(Application::class);
    }
}
