<?php

namespace App\Actions\GuestRequest;

use App\Enums\ReservationStatusEnum;
use App\Models\GuestRequest;
use App\Models\Reservation;
use App\Models\User;

class CreateGuestRequestAction
{
    /**
     * Create a new guest request.
     *
     * @param  array{title: string, details?: string|null, priority: string}  $data
     *
     * @throws \RuntimeException
     */
    public function create(User $user, array $data): GuestRequest
    {
        if ($user->is_suspended) {
            throw new \RuntimeException('Your account has been suspended. You cannot make requests.');
        }

        $hasActiveStay = Reservation::where('user_id', $user->id)
            ->where('status', ReservationStatusEnum::CheckedIn->value)
            ->exists();

        if (! $hasActiveStay) {
            throw new \RuntimeException('You can only make requests while checked in.');
        }

        return GuestRequest::create([
            'guest_id' => $user->id,
            'title' => $data['title'],
            'details' => $data['details'] ?? null,
            'priority' => $data['priority'],
        ]);
    }
}
