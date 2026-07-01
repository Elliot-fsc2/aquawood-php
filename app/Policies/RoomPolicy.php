<?php

namespace App\Policies;

use App\Enums\PermissionEnum;
use App\Models\Room;
use App\Models\User;

class RoomPolicy
{
    public function updateRoomStatus(User $user, Room $room): bool
    {
        return $user->can(PermissionEnum::ManageRoomStatus->value);
    }
}
