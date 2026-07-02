<?php

namespace App\Policies;

use App\Enums\ReservationStatusEnum;
use App\Models\Reservation;
use App\Models\User;

class EmergencyAlertPolicy
{
    public function create(User $user): bool
    {
        return Reservation::where('user_id', $user->id)
            ->where('status', ReservationStatusEnum::CheckedIn->value)
            ->exists();
    }
}
