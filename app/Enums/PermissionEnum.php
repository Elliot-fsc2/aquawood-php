<?php

namespace App\Enums;

enum PermissionEnum: string
{
    case ViewRooms = 'view-rooms';
    case CreateRooms = 'create-rooms';
    case EditRooms = 'edit-rooms';
    case DeleteRooms = 'delete-rooms';
    case ViewFloors = 'view-floors';
    case CreateFloors = 'create-floors';
    case EditFloors = 'edit-floors';
    case DeleteFloors = 'delete-floors';
    case ViewRoomCategories = 'view-room-categories';
    case CreateRoomCategories = 'create-room-categories';
    case EditRoomCategories = 'edit-room-categories';
    case DeleteRoomCategories = 'delete-room-categories';

    /**
     * Get all permission values as an array of strings.
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
