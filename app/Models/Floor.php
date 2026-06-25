<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Floor extends Model
{
    protected $guarded = [];

    /**
     * Get all of the room for the Floor
     */
    public function room(): HasMany
    {
        return $this->hasMany(Room::class);
    }
}
