<?php

namespace App\Actions\Frontdesk;

use App\Enums\ReservationStatusEnum;
use App\Enums\RoomStatusEnum;
use App\Models\Reservation;

class ConfirmBookingAction
{
    public function handle(Reservation $reservation): Reservation
    {
        $currentStatus = $reservation->status instanceof ReservationStatusEnum
            ? $reservation->status->value
            : $reservation->status;

        if ($currentStatus !== ReservationStatusEnum::Pending->value) {
            throw new \RuntimeException('Only pending reservations can be confirmed.');
        }

        $reservation->update([
            'status' => ReservationStatusEnum::Confirmed->value,
        ]);

        $reservation->room->update(['status' => RoomStatusEnum::Booked->value]);

        return $reservation->fresh()->load('room');
    }
}
