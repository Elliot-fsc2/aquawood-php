<?php

use App\Enums\ReservationStatusEnum;
use App\Enums\RoleEnum;
use App\Enums\RoomStatusEnum;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\GuestRequestController;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\RoomCategory;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    $roomCategories = RoomCategory::with('floor')
        ->withCount(['rooms as available_rooms_count' => fn ($q) => $q->where('status', RoomStatusEnum::Available->value)])
        ->get()
        ->filter(fn ($category) => $category->available_rooms_count > 0)
        ->values();

    return Inertia::render('welcome', [
        'roomCategories' => $roomCategories,
    ]);
})->name('home');

Route::get('browse-rooms', [BookingController::class, 'publicCreate'])->name('bookings.public-create');
Route::get('bookings/categories/{category}/check-availability', [BookingController::class, 'checkAvailability'])->name('bookings.check-availability');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function (Request $request) {
        $user = $request->user();
        $isAdmin = $user->hasRole(RoleEnum::Admin->value);

        if ($isAdmin) {
            $bookingsByStatus = Reservation::selectRaw('status, count(*) as count')
                ->groupBy('status')
                ->pluck('count', 'status');

            $dateFormat = match (DB::connection()->getDriverName()) {
                'mysql' => "DATE_FORMAT(created_at, '%Y-%m')",
                default => "strftime('%Y-%m', created_at)",
            };

            $rawMonthly = Reservation::selectRaw("{$dateFormat} as month, count(*) as count")
                ->whereYear('created_at', now()->year)
                ->groupBy('month')
                ->orderBy('month')
                ->pluck('count', 'month');

            $monthlyReservations = collect(range(1, 12))->map(fn ($m) => [
                'month' => now()->month($m)->format('M'),
                'reservations' => (int) ($rawMonthly[now()->month($m)->format('Y-m')] ?? 0),
            ]);

            return Inertia::render('admin/dashboard', [
                'stats' => [
                    'total_bookings' => array_sum($bookingsByStatus->toArray()),
                    'pending_bookings' => $bookingsByStatus[ReservationStatusEnum::Pending->value] ?? 0,
                    'confirmed_bookings' => $bookingsByStatus[ReservationStatusEnum::Confirmed->value] ?? 0,
                    'checked_in' => $bookingsByStatus[ReservationStatusEnum::CheckedIn->value] ?? 0,
                    'checked_out' => $bookingsByStatus[ReservationStatusEnum::CheckedOut->value] ?? 0,
                    'cancelled' => $bookingsByStatus[ReservationStatusEnum::Cancelled->value] ?? 0,
                    'total_guests' => User::role(RoleEnum::Guest->value)->count(),
                    'active_guests' => User::role(RoleEnum::Guest->value)->whereNull('suspended_at')->count(),
                    'available_rooms' => Room::where('status', RoomStatusEnum::Available->value)->count(),
                    'occupied_rooms' => Room::where('status', RoomStatusEnum::Occupied->value)->count(),
                    'maintenance_rooms' => Room::where('status', RoomStatusEnum::Maintenance->value)->count(),
                    'booked_rooms' => Room::where('status', RoomStatusEnum::Booked->value)->count(),
                    'total_categories' => RoomCategory::count(),
                    'monthly_reservations' => $monthlyReservations,
                ],
            ]);
        }

        $bookings = Reservation::with('room.category')
            ->where('user_id', $user->id)
            ->latest()
            ->get();

        return Inertia::render('dashboard', [
            'stats' => [
                'total' => $bookings->count(),
                'upcoming' => $bookings->whereIn('status', [ReservationStatusEnum::Pending->value, ReservationStatusEnum::Confirmed->value])->count(),
                'completed' => $bookings->whereIn('status', [ReservationStatusEnum::CheckedOut->value])->count(),
                'cancelled' => $bookings->where('status', ReservationStatusEnum::Cancelled->value)->count(),
            ],
            'recentBookings' => $bookings->take(5)->values(),
        ]);
    })->name('dashboard');

    // Bookings
    Route::get('bookings', [BookingController::class, 'index'])->name('bookings.index');
    Route::get('bookings/create', [BookingController::class, 'create'])->name('bookings.create');
    Route::get('bookings/confirm', [BookingController::class, 'confirm'])->name('bookings.confirm');
    Route::post('bookings', [BookingController::class, 'store'])->name('bookings.store');
    Route::post('bookings/{reservation}/cancel', [BookingController::class, 'cancel'])->name('bookings.cancel');

    // Guest Requests
    Route::get('requests', [GuestRequestController::class, 'index'])->name('requests.index');
    Route::post('requests', [GuestRequestController::class, 'store'])->name('requests.store');
});

require __DIR__.'/settings.php';
require __DIR__.'/admin.php';
