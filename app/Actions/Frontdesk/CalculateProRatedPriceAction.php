<?php

namespace App\Actions\Frontdesk;

use Carbon\Carbon;

class CalculateProRatedPriceAction
{
    public function handle(float $ratePerNight, string $checkInDate, string $originalCheckOut, string $actualCheckOut): array
    {
        $checkIn = Carbon::parse($checkInDate);
        $originalOut = Carbon::parse($originalCheckOut);
        $actualOut = Carbon::parse($actualCheckOut);

        $nightsBooked = max(1, $checkIn->diffInDays($originalOut));
        $nightsActual = max(1, $checkIn->diffInDays($actualOut));

        $originalTotal = $ratePerNight * $nightsBooked;
        $actualTotal = $ratePerNight * $nightsActual;
        $adjustment = $actualTotal - $originalTotal;

        $taxRate = 0.12;
        $subtotal = $actualTotal;
        $tax = $subtotal * $taxRate;
        $total = $subtotal + $tax;

        return [
            'nights_booked' => $nightsBooked,
            'nights_actual' => $nightsActual,
            'rate_per_night' => $ratePerNight,
            'subtotal' => round($subtotal, 2),
            'adjustment' => round($adjustment, 2),
            'tax' => round($tax, 2),
            'total' => round($total, 2),
        ];
    }
}
