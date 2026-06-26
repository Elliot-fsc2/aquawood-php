<?php

namespace App\Models;

use App\Enums\ReservationStatusEnum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reservation extends Model
{
    protected $fillable = [
        'user_id',
        'room_id',
        'check_in_date',
        'check_out_date',
        'total_price',
        'status',
        'notes',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'check_in_date' => 'date',
            'check_out_date' => 'date',
            'total_price' => 'decimal:2',
            'status' => ReservationStatusEnum::class,
        ];
    }

    /**
     * Get the guest (user) that owns the Reservation.
     */
    public function guest(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    /**
     * Get the room that the reservation is for.
     */
    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }
}
