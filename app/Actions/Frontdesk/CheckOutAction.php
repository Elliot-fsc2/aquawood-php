<?php

namespace App\Actions\Frontdesk;

use App\Enums\ReservationStatusEnum;
use App\Enums\RoomStatusEnum;
use App\Models\Receipt;
use App\Models\Reservation;
use Carbon\Carbon;

class CheckOutAction
{
    public function handle(
        Reservation $reservation,
        string $actualCheckOut,
        GenerateReceiptAction $generateReceipt,
        CalculateProRatedPriceAction $calculator,
    ): Receipt {
        $currentStatus = $reservation->status instanceof ReservationStatusEnum
            ? $reservation->status->value
            : $reservation->status;

        if ($currentStatus !== ReservationStatusEnum::CheckedIn->value) {
            throw new \RuntimeException('Only checked-in reservations can be checked out.');
        }

        $actualOut = Carbon::parse($actualCheckOut);

        $reservation->update([
            'status' => ReservationStatusEnum::CheckedOut->value,
            'check_out_date' => $actualOut->format('Y-m-d'),
        ]);

        $reservation->room->update(['status' => RoomStatusEnum::Available->value]);

        return $generateReceipt->handle($reservation, $actualCheckOut, $calculator);
    }
}
