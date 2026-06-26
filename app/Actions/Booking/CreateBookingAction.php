<?php

namespace App\Actions\Booking;

use App\Enums\ReservationStatusEnum;
use App\Enums\RoomStatusEnum;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\RoomCategory;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class CreateBookingAction
{
    /**
     * Validate the booking data.
     *
     * @param  array<string, mixed>  $data
     *
     * @throws \RuntimeException
     */
    public function validate(array $data): void
    {
        $checkIn = Carbon::parse($data['check_in_date']);
        $checkOut = Carbon::parse($data['check_out_date']);

        if ($checkIn->isPast() && ! $checkIn->isToday()) {
            throw new \RuntimeException('Check-in date cannot be in the past.');
        }

        if ($checkIn->greaterThanOrEqualTo($checkOut)) {
            throw new \RuntimeException('Check-out date must be after the check-in date.');
        }

        $nights = $checkIn->diffInDays($checkOut);

        if ($nights < 1) {
            throw new \RuntimeException('The booking must be for at least one night.');
        }

        $maxNights = 30;
        if ($nights > $maxNights) {
            throw new \RuntimeException("Bookings cannot exceed {$maxNights} nights.");
        }

        // Verify the room category exists
        if (! RoomCategory::where('id', $data['room_category_id'])->exists()) {
            throw new \RuntimeException('The selected room category does not exist.');
        }

        // Check if the user is suspended
        $user = User::find($data['user_id']);
        if ($user && $user->is_suspended) {
            throw new \RuntimeException('Your account has been suspended. Please contact support to make a reservation.');
        }
    }

    /**
     * Create a booking by assigning a random available room from the given category.
     *
     * @param  array{user_id: int, room_category_id: int, check_in_date: string, check_out_date: string, notes?: string|null}  $data
     *
     * @throws \RuntimeException
     */
    public function create(array $data): Reservation
    {
        $this->validate($data);

        $checkIn = Carbon::parse($data['check_in_date']);
        $checkOut = Carbon::parse($data['check_out_date']);
        $nights = $checkIn->diffInDays($checkOut);

        // Find a random available room in this category that is not already booked
        // for the requested dates
        $room = Room::where('room_category_id', $data['room_category_id'])
            ->where('status', RoomStatusEnum::Available->value)
            ->whereNotIn('id', function ($query) use ($checkIn, $checkOut) {
                $query->select('room_id')
                    ->from('reservations')
                    ->where(function ($q) use ($checkIn, $checkOut) {
                        // Overlapping bookings: existing check_in < new check_out
                        // AND existing check_out > new check_in
                        $q->where('check_in_date', '<', $checkOut->format('Y-m-d'))
                            ->where('check_out_date', '>', $checkIn->format('Y-m-d'));
                    })
                    ->whereNotIn('status', [ReservationStatusEnum::Cancelled->value]);
            })
            ->inRandomOrder()
            ->first();

        if (! $room) {
            throw new \RuntimeException('No available rooms in this category for the selected dates. Please try different dates or another category.');
        }

        return DB::transaction(function () use ($room, $data, $nights) {
            $reservation = Reservation::create([
                'user_id' => $data['user_id'],
                'room_id' => $room->id,
                'check_in_date' => $data['check_in_date'],
                'check_out_date' => $data['check_out_date'],
                'total_price' => $room->base_rate * $nights,
                'status' => ReservationStatusEnum::Pending->value,
                'notes' => $data['notes'] ?? null,
            ]);

            $room->update(['status' => RoomStatusEnum::Booked->value]);

            return $reservation;
        });
    }
}
