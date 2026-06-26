<?php

namespace App\Enums;

enum RoomStatusEnum: string
{
    case Available = 'available';
    case Occupied = 'occupied';
    case Maintenance = 'maintenance';
    case Booked = 'booked';

    public function label(): string
    {
        return match ($this) {
            self::Available => 'Available',
            self::Occupied => 'Occupied',
            self::Maintenance => 'Maintenance',
            self::Booked => 'Booked',
        };
    }
}
