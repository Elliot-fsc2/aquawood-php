<?php

namespace App\Models;

use Database\Factories\RoomCategoryFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RoomCategory extends Model
{
    /** @use HasFactory<RoomCategoryFactory> */
    use HasFactory;

    protected $guarded = [];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'amenities' => 'array',
            'base_price' => 'decimal:2',
            'capacity' => 'integer',
        ];
    }

    /**
     * Get the floor that owns the RoomCategory.
     */
    public function floor(): BelongsTo
    {
        return $this->belongsTo(Floor::class);
    }

    /**
     * Get the rooms for this category.
     */
    public function rooms(): HasMany
    {
        return $this->hasMany(Room::class, 'room_category_id');
    }
}
