<?php

namespace App\Actions\Frontdesk;

use App\Enums\ReservationStatusEnum;
use App\Enums\RoomStatusEnum;
use App\Models\Reservation;

class CheckInAction
{
    public function handle(Reservation $reservation): Reservation
    {
        $allowed = [ReservationStatusEnum::Pending->value, ReservationStatusEnum::Confirmed->value];
        $currentStatus = $reservation->status instanceof ReservationStatusEnum
            ? $reservation->status->value
            : $reservation->status;

        if (! in_array($currentStatus, $allowed)) {
            throw new \RuntimeException('Reservation cannot be checked in from its current status.');
        }

        $reservation->update([
            'status' => ReservationStatusEnum::CheckedIn->value,
        ]);

        $reservation->room->update(['status' => RoomStatusEnum::Occupied->value]);

        return $reservation->fresh()->load('room');
    }
}
