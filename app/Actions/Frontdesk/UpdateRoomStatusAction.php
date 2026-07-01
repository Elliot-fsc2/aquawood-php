<?php

namespace App\Actions\Frontdesk;

use App\Enums\RoomStatusEnum;
use App\Models\Room;

class UpdateRoomStatusAction
{
    public function handle(Room $room, string $status): Room
    {
        $valid = array_map(fn ($case) => $case->value, RoomStatusEnum::cases());

        if (! in_array($status, $valid)) {
            throw new \RuntimeException('Invalid room status: '.$status);
        }

        $room->update(['status' => $status]);

        return $room->fresh();
    }
}
