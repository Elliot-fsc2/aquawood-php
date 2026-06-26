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
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
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
     * Show the category selection page for a new booking (authenticated).
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
     * Show the category selection page (public, no auth required).
     */
    public function publicCreate(): Response
    {
        $categories = RoomCategory::with('floor')
            ->withCount(['rooms as available_rooms_count' => fn ($q) => $q->where('status', RoomStatusEnum::Available->value)])
            ->get()
            ->filter(fn ($category) => $category->available_rooms_count > 0)
            ->values();

        return Inertia::render('bookings/public-create', [
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
            'adults' => ['nullable', 'integer', 'min:1', 'max:20'],
            'children' => ['nullable', 'integer', 'min:0', 'max:20'],
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

        $checkIn = Carbon::parse($validated['check_in']);
        $checkOut = Carbon::parse($validated['check_out']);
        $nights = $checkIn->diffInDays($checkOut);
        $baseRate = (float) $category->base_price;
        $subtotal = $baseRate * $nights;
        $taxRate = 0.12;
        $tax = $subtotal * $taxRate;
        $grandTotal = $subtotal + $tax;

        $user = $request->user();
        $guest = $user?->guest;

        return Inertia::render('bookings/confirm', [
            'category' => $category,
            'check_in' => $validated['check_in'],
            'check_out' => $validated['check_out'],
            'notes' => $validated['notes'] ?? null,
            'adults' => (int) ($validated['adults'] ?? 1),
            'children' => (int) ($validated['children'] ?? 0),
            'pricing' => [
                'nights' => $nights,
                'base_rate' => $baseRate,
                'subtotal' => round($subtotal, 2),
                'tax_rate' => $taxRate,
                'tax' => round($tax, 2),
                'grand_total' => round($grandTotal, 2),
            ],
            'guest' => $guest ? [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $guest->phone,
            ] : [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => null,
            ],
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
     * The allowed status transitions for reservations.
     *
     * @var array<string, list<string>>
     */
    protected array $statusTransitions = [
        'pending' => ['confirmed', 'cancelled'],
        'confirmed' => ['checked_in', 'cancelled'],
        'checked_in' => ['checked_out'],
        'checked_out' => [],
        'cancelled' => [],
    ];

    /**
     * Update the status of a reservation (admin only).
     */
    public function adminUpdateStatus(Request $request, Reservation $reservation): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', Rule::in(array_map(fn ($case) => $case->value, ReservationStatusEnum::cases()))],
        ]);

        $newStatus = ReservationStatusEnum::tryFrom($validated['status']);
        $currentStatusValue = $reservation->status instanceof ReservationStatusEnum
            ? $reservation->status->value
            : $reservation->status;

        // Validate the transition is allowed
        $allowed = $this->statusTransitions[$currentStatusValue] ?? [];
        if (! in_array($newStatus->value, $allowed)) {
            return back()->withErrors([
                'status' => 'Cannot change status from '.($reservation->status->label() ?? $currentStatusValue).' to '.$newStatus->label().'.',
            ]);
        }

        // If cancelling, use the CancelBookingAction for proper room cleanup
        if ($newStatus === ReservationStatusEnum::Cancelled && $reservation->status !== ReservationStatusEnum::Cancelled) {
            try {
                app(CancelBookingAction::class)->cancel($reservation);
            } catch (\RuntimeException $e) {
                return back()->withErrors(['status' => $e->getMessage()]);
            }

            Inertia::flash('toast', ['type' => 'success', 'message' => __('Reservation cancelled.')]);

            return back();
        }

        // For other status changes, just update
        $reservation->update(['status' => $newStatus]);

        // If the reservation is reaching a terminal state, free the room
        if (! $newStatus->canBeCancelled()) {
            $reservation->room->update(['status' => RoomStatusEnum::Available->value]);
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Reservation status updated to :status.', ['status' => $newStatus->label()]),
        ]);

        return back();
    }

    /**
     * Display a listing of all bookings for admin.
     */
    public function adminIndex(Request $request): Response
    {
        $bookings = Reservation::with('guest', 'room.floor', 'room.category')
            ->when($request->filled('status'), fn (Builder $q) => $q->where('status', $request->status))
            ->latest()
            ->get();

        $stats = [
            'total' => Reservation::count(),
            'pending' => Reservation::where('status', ReservationStatusEnum::Pending)->count(),
            'confirmed' => Reservation::where('status', ReservationStatusEnum::Confirmed)->count(),
            'checked_in' => Reservation::where('status', ReservationStatusEnum::CheckedIn)->count(),
            'checked_out' => Reservation::where('status', ReservationStatusEnum::CheckedOut)->count(),
            'cancelled' => Reservation::where('status', ReservationStatusEnum::Cancelled)->count(),
        ];

        return Inertia::render('admin/bookings/index', [
            'bookings' => $bookings,
            'stats' => $stats,
            'selectedStatus' => $request->status,
        ]);
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
