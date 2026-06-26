<?php

namespace App\Http\Controllers;

use App\Actions\Booking\CancelBookingAction;
use App\Actions\Booking\CreateBookingAction;
use App\Enums\ReservationStatusEnum;
use App\Enums\RoomStatusEnum;
use App\Http\Requests\StoreBookingRequest;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\RoomCategory;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    /**
     * Check availability for a category on given dates.
     */
    public function checkAvailability(Request $request, int $category): JsonResponse
    {
        $validated = $request->validate([
            'check_in' => ['required', 'date', 'after_or_equal:today'],
            'check_out' => ['required', 'date', 'after:check_in'],
        ]);

        $checkIn = Carbon::parse($validated['check_in']);
        $checkOut = Carbon::parse($validated['check_out']);

        $availableRoomCount = Room::where('room_category_id', $category)
            ->where('status', RoomStatusEnum::Available->value)
            ->whereNotIn('id', function ($query) use ($checkIn, $checkOut) {
                $query->select('room_id')
                    ->from('reservations')
                    ->where(function ($q) use ($checkIn, $checkOut) {
                        $q->where('check_in_date', '<', $checkOut->format('Y-m-d'))
                            ->where('check_out_date', '>', $checkIn->format('Y-m-d'));
                    })
                    ->whereNotIn('status', [ReservationStatusEnum::Cancelled->value]);
            })
            ->count();

        return response()->json([
            'available' => $availableRoomCount > 0,
            'available_rooms' => $availableRoomCount,
        ]);
    }

    /**
     * Display a listing of the user's bookings.
     */
    public function index(Request $request): Response
    {
        $bookings = Reservation::with('room.floor', 'room.category')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return Inertia::render('bookings/index', [
            'bookings' => $bookings,
        ]);
    }

    /**
     * Show the category selection page for a new booking.
     */
    public function create(): Response
    {
        $categories = RoomCategory::with('floor')
            ->withCount(['rooms as available_rooms_count' => fn ($q) => $q->where('status', RoomStatusEnum::Available->value)])
            ->get()
            ->filter(fn ($category) => $category->available_rooms_count > 0)
            ->values();

        return Inertia::render('bookings/create', [
            'categories' => $categories,
        ]);
    }

    /**
     * Show the confirmation page before finalizing the booking.
     */
    public function confirm(Request $request): Response|RedirectResponse
    {
        $validated = $request->validate([
            'category_id' => ['required', 'exists:room_categories,id'],
            'check_in' => ['required', 'date', 'after_or_equal:today'],
            'check_out' => ['required', 'date', 'after:check_in'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $checkIn = Carbon::parse($validated['check_in']);
        $checkOut = Carbon::parse($validated['check_out']);

        // Check if any room in this category is available for the selected dates
        $hasAvailability = Room::where('room_category_id', $validated['category_id'])
            ->where('status', RoomStatusEnum::Available->value)
            ->whereNotIn('id', function ($query) use ($checkIn, $checkOut) {
                $query->select('room_id')
                    ->from('reservations')
                    ->where(function ($q) use ($checkIn, $checkOut) {
                        $q->where('check_in_date', '<', $checkOut->format('Y-m-d'))
                            ->where('check_out_date', '>', $checkIn->format('Y-m-d'));
                    })
                    ->whereNotIn('status', [ReservationStatusEnum::Cancelled->value]);
            })
            ->exists();

        if (! $hasAvailability) {
            return back()->withErrors([
                'dates' => 'No rooms are available for the selected dates.',
            ]);
        }

        $category = RoomCategory::with('floor')->findOrFail($validated['category_id']);

        return Inertia::render('bookings/confirm', [
            'category' => $category,
            'check_in' => $validated['check_in'],
            'check_out' => $validated['check_out'],
            'notes' => $validated['notes'] ?? null,
        ]);
    }

    /**
     * Store a newly created booking in storage.
     */
    public function store(StoreBookingRequest $request, CreateBookingAction $createBooking): RedirectResponse
    {
        $data = $request->validated();
        $data['user_id'] = $request->user()->id;

        try {
            $createBooking->create($data);
        } catch (\RuntimeException $e) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => $e->getMessage(),
            ]);

            return back()->withErrors(['room_category_id' => $e->getMessage()]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Booking created.')]);

        return to_route('bookings.index');
    }

    /**
     * Cancel a booking.
     */
    public function cancel(Request $request, Reservation $reservation, CancelBookingAction $cancelBooking): RedirectResponse
    {
        // Ensure the user can only cancel their own bookings
        if ($reservation->user_id !== $request->user()->id) {
            abort(403);
        }

        try {
            $cancelBooking->cancel($reservation);
        } catch (\RuntimeException $e) {
            return back()->withErrors(['cancel' => $e->getMessage()]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Booking cancelled.')]);

        return back();
    }
}
