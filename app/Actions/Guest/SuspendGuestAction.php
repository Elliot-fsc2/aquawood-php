<?php

namespace App\Actions\Guest;

use App\Models\User;
use Carbon\Carbon;

class SuspendGuestAction
{
    /**
     * Suspend a guest user account, preventing them from making new bookings.
     *
     * @throws \RuntimeException
     */
    public function suspend(User $user): User
    {
        if ($user->is_suspended) {
            throw new \RuntimeException('This guest account is already suspended.');
        }

        if ($user->hasRole('Admin')) {
            throw new \RuntimeException('Cannot suspend an admin account.');
        }

        $user->update(['suspended_at' => Carbon::now()]);

        return $user->fresh();
    }

    /**
     * Reinstate a suspended guest user account.
     *
     * @throws \RuntimeException
     */
    public function reinstate(User $user): User
    {
        if (! $user->is_suspended) {
            throw new \RuntimeException('This guest account is not currently suspended.');
        }

        $user->update(['suspended_at' => null]);

        return $user->fresh();
    }

    /**
     * Check if a user is suspended.
     */
    public function isSuspended(User $user): bool
    {
        return $user->is_suspended;
    }
}
