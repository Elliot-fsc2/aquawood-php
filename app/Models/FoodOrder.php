<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FoodOrder extends Model
{
    protected $fillable = [
        'reservation_id',
        'room_id',
        'guest_id',
        'order_type',
        'status',
        'notes',
    ];

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class);
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function guest(): BelongsTo
    {
        return $this->belongsTo(User::class, 'guest_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(FoodOrderItem::class);
    }

    public function getSubtotalAttribute(): float
    {
        return (float) $this->items->sum('subtotal');
    }

    public function getTaxAttribute(): float
    {
        return round($this->subtotal * 0.12, 2);
    }

    public function getTotalAttribute(): float
    {
        return round($this->subtotal + $this->tax, 2);
    }
}
