<?php

namespace App\Models;

use Database\Factories\FloorFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Floor extends Model
{
    /** @use HasFactory<FloorFactory> */
    use HasFactory;

    protected $guarded = [];

    /**
     * Get all of the room for the Floor
     */
    public function room(): HasMany
    {
        return $this->hasMany(Room::class);
    }

    /**
     * Get all room categories for the Floor.
     */
    public function roomCategories(): HasMany
    {
        return $this->hasMany(RoomCategory::class);
    }
}
