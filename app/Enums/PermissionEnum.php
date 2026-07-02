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
    case ManageReservations = 'manage-reservations';
    case ManageCheckIn = 'manage-checkin';
    case ManageCheckOut = 'manage-checkout';
    case ManageRoomStatus = 'manage-room-status';
    case ViewFoodItems = 'view-food-items';
    case CreateFoodItems = 'create-food-items';
    case EditFoodItems = 'edit-food-items';
    case DeleteFoodItems = 'delete-food-items';
    case ViewFoodOrders = 'view-food-orders';
    case CreateFoodOrders = 'create-food-orders';
    case EditFoodOrders = 'edit-food-orders';
    case CancelFoodOrders = 'cancel-food-orders';
    case ViewEmergencyAlerts = 'view-emergency-alerts';
    case AcknowledgeEmergencyAlerts = 'acknowledge-emergency-alerts';
    case ResolveEmergencyAlerts = 'resolve-emergency-alerts';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
