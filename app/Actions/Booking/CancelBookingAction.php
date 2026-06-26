<?php

namespace App\Actions\Booking;

use App\Enums\ReservationStatusEnum;
use App\Enums\RoomStatusEnum;
use App\Models\Reservation;

class CancelBookingAction
{
    /**
     * Cancel a reservation if its status allows it.
     *
     * @throws \RuntimeException
     */
    public function cancel(Reservation $reservation): Reservation
    {
        if (! $reservation->status->canBeCancelled()) {
            throw new \RuntimeException('This reservation cannot be cancelled.');
        }

        $reservation->update([
            'status' => ReservationStatusEnum::Cancelled->value,
        ]);

        // Free up the room so it can be booked again
        $reservation->room->update(['status' => RoomStatusEnum::Available->value]);

        return $reservation->fresh();
    }
}
