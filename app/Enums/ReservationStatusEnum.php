<?php

namespace App\Enums;

enum ReservationStatusEnum: string
{
    case Pending = 'pending';
    case Confirmed = 'confirmed';
    case CheckedIn = 'checked_in';
    case CheckedOut = 'checked_out';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pending',
            self::Confirmed => 'Confirmed',
            self::CheckedIn => 'Checked In',
            self::CheckedOut => 'Checked Out',
            self::Cancelled => 'Cancelled',
        };
    }

    public function canBeCancelled(): bool
    {
        return match ($this) {
            self::Pending, self::Confirmed => true,
            self::CheckedIn, self::CheckedOut, self::Cancelled => false,
        };
    }
}
