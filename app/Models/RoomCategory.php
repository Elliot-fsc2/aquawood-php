<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RoomCategory extends Model
{
    protected $guarded = [];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'amenities' => 'array',
            'base_price' => 'decimal:2',
        ];
    }

    /**
     * Get the floor that owns the RoomCategory.
     */
    public function floor(): BelongsTo
    {
        return $this->belongsTo(Floor::class);
    }
}
