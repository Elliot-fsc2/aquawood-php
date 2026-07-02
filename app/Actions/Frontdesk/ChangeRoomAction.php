<?php

namespace App\Actions\Frontdesk;

use App\Enums\ReservationStatusEnum;
use App\Enums\RoomStatusEnum;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\RoomTransfer;
use App\Models\User;

class ChangeRoomAction
{
    public function handle(
        Reservation $reservation,
        Room $newRoom,
        User $performedBy,
        ?string $reason = null,
        ?string $notes = null,
    ): Reservation {
        $currentStatus = $reservation->status instanceof ReservationStatusEnum
            ? $reservation->status->value
            : $reservation->status;

        if ($currentStatus !== ReservationStatusEnum::CheckedIn->value) {
            throw new \RuntimeException('Only checked-in guests can be transferred to a different room.');
        }

        if ($newRoom->id === $reservation->room_id) {
            throw new \RuntimeException('The guest is already assigned to this room.');
        }

        if ($newRoom->status !== RoomStatusEnum::Available->value) {
            throw new \RuntimeException('The selected room is not available.');
        }

        $oldRoom = $reservation->room;

        // Calculate rate adjustment if the new room has a different base rate
        $rateAdjustment = (float) $newRoom->base_rate - (float) $oldRoom->base_rate;

        // Mark old room as available
        $oldRoom->update(['status' => RoomStatusEnum::Available->value]);

        // Update the reservation to point to the new room
        $reservation->update(['room_id' => $newRoom->id]);

        // Mark new room as occupied
        $newRoom->update(['status' => RoomStatusEnum::Occupied->value]);

        // Create the audit trail
        RoomTransfer::create([
            'reservation_id' => $reservation->id,
            'from_room_id' => $oldRoom->id,
            'to_room_id' => $newRoom->id,
            'performed_by' => $performedBy->id,
            'reason' => $reason,
            'rate_adjustment' => $rateAdjustment,
            'notes' => $notes,
        ]);

        return $reservation->fresh()->load('room.category', 'room.floor');
    }
}
