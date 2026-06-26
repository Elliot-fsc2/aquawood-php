<?php

use App\Http\Controllers\BookingController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Bookings
    Route::get('bookings', [BookingController::class, 'index'])->name('bookings.index');
    Route::get('bookings/create', [BookingController::class, 'create'])->name('bookings.create');
    Route::get('bookings/confirm', [BookingController::class, 'confirm'])->name('bookings.confirm');
    Route::post('bookings', [BookingController::class, 'store'])->name('bookings.store');
    Route::get('bookings/categories/{category}/check-availability', [BookingController::class, 'checkAvailability'])->name('bookings.check-availability');
    Route::post('bookings/{reservation}/cancel', [BookingController::class, 'cancel'])->name('bookings.cancel');
});

require __DIR__.'/settings.php';
require __DIR__.'/admin.php';
