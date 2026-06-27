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
            'base_price' => 'decimal:2',
            'capacity' => 'integer',
            'amenities' => 'json',
        ];
    }

    /**
     * The amenities are double-encoded in the database.
     */
    public function getAmenitiesAttribute(mixed $value): array
    {
        if (is_array($value)) {
            return $value;
        }

        $decoded = json_decode((string) $value, true);

        return is_array($decoded) ? $decoded : (json_decode((string) $decoded, true) ?: []);
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
