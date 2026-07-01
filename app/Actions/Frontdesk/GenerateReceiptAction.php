<?php

namespace App\Actions\Frontdesk;

use App\Models\Receipt;
use App\Models\Reservation;

class GenerateReceiptAction
{
    public function handle(
        Reservation $reservation,
        string $actualCheckOut,
        CalculateProRatedPriceAction $calculator,
    ): Receipt {
        $room = $reservation->room;
        $ratePerNight = (float) $room->base_rate;

        $pricing = $calculator->handle(
            $ratePerNight,
            $reservation->check_in_date->format('Y-m-d'),
            $reservation->check_out_date->format('Y-m-d'),
            $actualCheckOut,
        );

        return Receipt::create([
            'reservation_id' => $reservation->id,
            'room_id' => $room->id,
            'check_in_date' => $reservation->check_in_date->format('Y-m-d'),
            'check_out_date' => $reservation->check_out_date->format('Y-m-d'),
            'actual_check_out_date' => $actualCheckOut,
            'nights_booked' => $pricing['nights_booked'],
            'nights_actual' => $pricing['nights_actual'],
            'rate_per_night' => $pricing['rate_per_night'],
            'subtotal' => $pricing['subtotal'],
            'adjustment' => $pricing['adjustment'],
            'tax' => $pricing['tax'],
            'total' => $pricing['total'],
            'status' => 'pending',
        ]);
    }
}
