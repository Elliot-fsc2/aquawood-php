<?php

namespace App\Actions\Frontdesk;

use App\Enums\ReservationStatusEnum;
use App\Enums\RoomStatusEnum;
use App\Models\Reservation;
use App\Models\Room;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class CreateWalkInReservationAction
{
    public function handle(array $data, int $userId): Reservation
    {
        $room = Room::findOrFail($data['room_id']);

        if ($room->status !== RoomStatusEnum::Available->value) {
            throw new \RuntimeException('The selected room is not available.');
        }

        $checkIn = Carbon::parse($data['check_in_date']);
        $checkOut = Carbon::parse($data['check_out_date']);

        if ($checkIn->greaterThanOrEqualTo($checkOut)) {
            throw new \RuntimeException('Check-out date must be after check-in date.');
        }

        $nights = $checkIn->diffInDays($checkOut);
        $totalPrice = $room->base_rate * $nights;

        return DB::transaction(function () use ($room, $data, $checkIn, $checkOut, $totalPrice, $userId) {
            $reservation = Reservation::create([
                'user_id' => $userId,
                'room_id' => $room->id,
                'check_in_date' => $checkIn->format('Y-m-d'),
                'check_out_date' => $checkOut->format('Y-m-d'),
                'total_price' => $totalPrice,
                'status' => ReservationStatusEnum::CheckedIn->value,
                'notes' => $data['notes'] ?? 'Walk-in reservation',
                'details' => [
                    'adults' => (int) ($data['adults'] ?? 1),
                    'children' => (int) ($data['children'] ?? 0),
                ],
            ]);

            $room->update(['status' => RoomStatusEnum::Occupied->value]);

            return $reservation->fresh()->load('room');
        });
    }
}
