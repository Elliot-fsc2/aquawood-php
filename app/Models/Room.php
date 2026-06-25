<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Room extends Model
{
    protected $guarded = [];

    /**
     * Get the floor that owns the Room
     */
    public function floor(): BelongsTo
    {
        return $this->belongsTo(Floor::class);
    }
}
