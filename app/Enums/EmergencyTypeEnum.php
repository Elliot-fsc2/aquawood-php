<?php

namespace App\Enums;

enum EmergencyTypeEnum: string
{
    case General = 'general';
    case Medical = 'medical';
    case Fire = 'fire';
    case Security = 'security';
    case Other = 'other';

    public function label(): string
    {
        return match ($this) {
            self::General => 'General',
            self::Medical => 'Medical',
            self::Fire => 'Fire',
            self::Security => 'Security',
            self::Other => 'Other',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
