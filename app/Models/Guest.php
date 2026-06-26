<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Guest extends Model
{
    protected $fillable = [
        'user_id',
        'phone',
        'country',
        'loyalty_tier',
        'points',
        'total_stays',
        'total_spent',
        'preferences',
        'last_stay',
    ];

    protected function casts(): array
    {
        return [
            'preferences' => 'array',
            'total_spent' => 'decimal:2',
            'last_stay' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
