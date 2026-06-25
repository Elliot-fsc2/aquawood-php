<?php

namespace App\Enums;

enum FloorEnum: string
{
    case GroundFloor = 'Ground Floor';
    case GardenLevel = 'Garden Level';
    case LagoonLevel = 'Lagoon Level';
    case SkyLevel = 'Sky Level';

    public function code(): string
    {
        return match ($this) {
            self::GroundFloor => 'FL-1',
            self::GardenLevel => 'FL-2',
            self::LagoonLevel => 'FL-3',
            self::SkyLevel => 'FL-4',
        };
    }

    public function level(): int
    {
        return match ($this) {
            self::GroundFloor => 1,
            self::GardenLevel => 2,
            self::LagoonLevel => 3,
            self::SkyLevel => 4,
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::GroundFloor => 'Lobby, reception & accessible rooms',
            self::GardenLevel => 'Garden-view deluxe rooms',
            self::LagoonLevel => 'Lagoon-view suites & villas',
            self::SkyLevel => 'Presidential suites & penthouse',
        };
    }

    public static function fromCode(string $code): ?self
    {
        return match ($code) {
            'FL-1' => self::GroundFloor,
            'FL-2' => self::GardenLevel,
            'FL-3' => self::LagoonLevel,
            'FL-4' => self::SkyLevel,
            default => null,
        };
    }
}
