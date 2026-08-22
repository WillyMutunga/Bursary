<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'date',
    ];

    public function batch()
    {
        return $this->belongsTo(PaymentBatch::class, 'payment_batch_id');
    }

    public function application()
    {
        return $this->belongsTo(Application::class);
    }

    public function institution()
    {
        return $this->belongsTo(Institution::class);
    }
}
