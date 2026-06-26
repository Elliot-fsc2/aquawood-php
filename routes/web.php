<?php

use App\Enums\RoomStatusEnum;
use App\Http\Controllers\BookingController;
use App\Models\RoomCategory;
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
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Bookings
    Route::get('bookings', [BookingController::class, 'index'])->name('bookings.index');
    Route::get('bookings/create', [BookingController::class, 'create'])->name('bookings.create');
    Route::get('bookings/confirm', [BookingController::class, 'confirm'])->name('bookings.confirm');
    Route::post('bookings', [BookingController::class, 'store'])->name('bookings.store');
    Route::post('bookings/{reservation}/cancel', [BookingController::class, 'cancel'])->name('bookings.cancel');
});

require __DIR__.'/settings.php';
require __DIR__.'/admin.php';
