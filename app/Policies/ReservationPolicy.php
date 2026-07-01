<?php

namespace App\Policies;

use App\Enums\PermissionEnum;
use App\Models\Reservation;
use App\Models\User;

class ReservationPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can(PermissionEnum::ManageReservations->value);
    }

    public function view(User $user, Reservation $reservation): bool
    {
        return $user->can(PermissionEnum::ManageReservations->value);
    }

    public function create(User $user): bool
    {
        return $user->can(PermissionEnum::ManageReservations->value);
    }

    public function update(User $user, Reservation $reservation): bool
    {
        return $user->can(PermissionEnum::ManageReservations->value);
    }

    public function checkIn(User $user, Reservation $reservation): bool
    {
        return $user->can(PermissionEnum::ManageCheckIn->value);
    }

    public function checkOut(User $user, Reservation $reservation): bool
    {
        return $user->can(PermissionEnum::ManageCheckOut->value);
    }

    public function cancel(User $user, Reservation $reservation): bool
    {
        return $user->can(PermissionEnum::ManageReservations->value);
    }
}
