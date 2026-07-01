<?php

namespace App\Http\Controllers;

use App\Actions\Frontdesk\CalculateProRatedPriceAction;
use App\Actions\Frontdesk\CheckInAction;
use App\Actions\Frontdesk\CheckOutAction;
use App\Actions\Frontdesk\ConfirmBookingAction;
use App\Actions\Frontdesk\CreateWalkInGuestAction;
use App\Actions\Frontdesk\CreateWalkInReservationAction;
use App\Actions\Frontdesk\GenerateReceiptAction;
use App\Actions\Frontdesk\UpdateRoomStatusAction;
use App\Enums\ReservationStatusEnum;
use App\Models\GuestRequest;
use App\Models\Reservation;
use App\Models\Room;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FrontdeskController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', Reservation::class);

        $rooms = Room::with('category', 'floor')
            ->orderBy('floor_id')
            ->orderBy('number')
            ->get()
            ->map(fn ($room) => [
                'id' => (string) $room->id,
                'number' => $room->number,
                'type' => $room->category?->name ?? 'Standard',
                'floor' => $room->floor?->name ?? '',
                'status' => $room->status,
                'base_rate' => (float) $room->base_rate,
                'beds' => $room->beds,
                'capacity' => $room->capacity,
                'amenities' => $this->parseAmenities($room->amenities),
                'image' => $room->image
                    ? '/storage/'.$room->image
                    : ($room->category?->image
                        ? '/storage/'.$room->category->image
                        : '/images/aquawood-room.jpg'),
            ]);

        $reservations = Reservation::with('guest', 'room.category')
            ->latest()
            ->get()
            ->map(fn ($res) => [
                'id' => (string) $res->id,
                'guestName' => $res->guest?->name ?? 'Walk-in Guest',
                'guestId' => (string) ($res->guest?->id ?? ''),
                'roomId' => (string) $res->room_id,
                'checkIn' => $res->check_in_date,
                'checkOut' => $res->check_out_date,
                'rateCode' => $res->rate_code ?? 'BAR',
                'totalAmount' => (float) $res->total_price,
                'deposit' => (float) ($res->deposit ?? 0),
                'status' => $res->status,
                'source' => $res->source ?? 'Phone',
                'adults' => (int) (is_array($res->details) ? ($res->details['adults'] ?? 1) : 1),
                'children' => (int) (is_array($res->details) ? ($res->details['children'] ?? 0) : 0),
                'notes' => $res->notes,
            ]);

        $guestRequests = GuestRequest::with('guest')
            ->latest()
            ->get()
            ->map(fn ($req) => [
                'id' => (string) $req->id,
                'title' => $req->title,
                'details' => $req->details,
                'priority' => ucfirst($req->priority->value ?? 'medium'),
                'status' => ucfirst($req->status->value ?? 'pending'),
                'roomNumber' => $req->room_number ?? '',
                'assignedRoom' => (string) ($req->assigned_room_id ?? ''),
                'createdAt' => $req->created_at->diffForHumans(),
            ]);

        $stats = [
            'available' => Room::where('status', 'available')->count(),
            'occupied' => Room::where('status', 'occupied')->count(),
            'reserved' => Room::where('status', 'booked')->count(),
            'maintenance' => Room::where('status', 'maintenance')->count(),
            'dirty' => 0,
        ];

        return Inertia::render('frontdesk/index', [
            'rooms' => $rooms,
            'reservations' => $reservations,
            'guestRequests' => $guestRequests,
            'stats' => $stats,
        ]);
    }

    public function checkIn(Request $request, Reservation $reservation, CheckInAction $checkIn): RedirectResponse
    {
        $this->authorize('checkIn', $reservation);

        try {
            $checkIn->handle($reservation);
        } catch (\RuntimeException $e) {
            return back()->withErrors(['checkin' => $e->getMessage()]);
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Guest checked in successfully.',
        ]);

        return back();
    }

    public function checkOut(
        Request $request,
        Reservation $reservation,
        CheckOutAction $checkOut,
        GenerateReceiptAction $generateReceipt,
        CalculateProRatedPriceAction $calculator,
    ): RedirectResponse {
        $this->authorize('checkOut', $reservation);

        $validated = $request->validate([
            'actual_check_out' => ['required', 'date'],
        ]);

        try {
            $receipt = $checkOut->handle($reservation, $validated['actual_check_out'], $generateReceipt, $calculator);
            Inertia::flash('receipt', [
                'id' => (string) $receipt->id,
                'guestName' => $reservation->guest?->name ?? 'Guest',
                'roomNumber' => $receipt->room->number,
                'checkIn' => Carbon::parse($receipt->check_in_date)->format('M d, Y'),
                'checkOut' => Carbon::parse($receipt->check_out_date)->format('M d, Y'),
                'actualCheckOut' => Carbon::parse($receipt->actual_check_out_date)->format('M d, Y'),
                'nightsBooked' => $receipt->nights_booked,
                'nightsActual' => $receipt->nights_actual,
                'ratePerNight' => number_format((float) $receipt->rate_per_night, 2),
                'subtotal' => number_format((float) $receipt->subtotal, 2),
                'adjustment' => number_format((float) $receipt->adjustment, 2),
                'tax' => number_format((float) $receipt->tax, 2),
                'total' => number_format((float) $receipt->total, 2),
                'status' => $receipt->status,
            ]);

            Inertia::flash('toast', [
                'type' => 'success',
                'message' => 'Check-out processed successfully.',
            ]);
        } catch (\RuntimeException $e) {
            return back()->withErrors(['checkout' => $e->getMessage()]);
        }

        return back();
    }

    public function confirmBooking(Request $request, Reservation $reservation, ConfirmBookingAction $confirmBooking): RedirectResponse
    {
        $this->authorize('update', $reservation);

        try {
            $confirmBooking->handle($reservation);
        } catch (\RuntimeException $e) {
            return back()->withErrors(['confirm' => $e->getMessage()]);
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Booking confirmed.',
        ]);

        return back();
    }

    public function updateStatus(Request $request, Reservation $reservation): RedirectResponse
    {
        $this->authorize('update', $reservation);

        $validated = $request->validate([
            'status' => ['required', 'string', 'in:pending,confirmed,checked_in,checked_out,cancelled'],
        ]);

        $reservation->update(['status' => $validated['status']]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Reservation status updated.',
        ]);

        return back();
    }

    public function updateRoomStatus(Request $request, Room $room, UpdateRoomStatusAction $updateRoomStatus): RedirectResponse
    {
        $this->authorize('updateRoomStatus', $room);

        $validated = $request->validate([
            'status' => ['required', 'string', 'in:available,occupied,booked,maintenance'],
        ]);

        try {
            $updateRoomStatus->handle($room, $validated['status']);
        } catch (\RuntimeException $e) {
            return back()->withErrors(['room_status' => $e->getMessage()]);
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Room status updated.',
        ]);

        return back();
    }

    public function storeReservation(
        Request $request,
        CreateWalkInGuestAction $createGuest,
        CreateWalkInReservationAction $createWalkIn,
    ): RedirectResponse {
        $this->authorize('create', Reservation::class);

        $validated = $request->validate([
            'guest_name' => ['required', 'string', 'max:255'],
            'room_id' => ['required', 'exists:rooms,id'],
            'check_in_date' => ['required', 'date'],
            'check_out_date' => ['required', 'date', 'after:check_in_date'],
            'adults' => ['nullable', 'integer', 'min:1', 'max:50'],
            'children' => ['nullable', 'integer', 'min:0', 'max:50'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        try {
            $user = $createGuest->handle($validated['guest_name']);
            $createWalkIn->handle($validated, $user->id);
        } catch (\RuntimeException $e) {
            return back()->withErrors(['reservation' => $e->getMessage()]);
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Walk-in booked and checked in successfully.',
        ]);

        return back();
    }

    public function cancelReservation(Request $request, Reservation $reservation): RedirectResponse
    {
        $this->authorize('cancel', $reservation);

        $currentStatus = $reservation->status instanceof ReservationStatusEnum
            ? $reservation->status->value
            : $reservation->status;

        if (! in_array($currentStatus, ['pending', 'confirmed'])) {
            return back()->withErrors(['cancel' => 'This reservation cannot be cancelled.']);
        }

        $reservation->update(['status' => 'cancelled']);
        $reservation->room->update(['status' => 'available']);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Reservation cancelled.',
        ]);

        return back();
    }

    private function parseAmenities(mixed $value): array
    {
        if (is_array($value)) {
            return $value;
        }

        $decoded = json_decode((string) $value, true);

        return is_array($decoded) ? $decoded : (json_decode((string) $decoded, true) ?: []);
    }
}
