<?php

use App\Enums\RoleEnum;
use App\Http\Controllers\FrontdeskController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:'.RoleEnum::Receptionist->value.'|'.RoleEnum::Admin->value])
    ->prefix('frontdesk')
    ->name('frontdesk.')
    ->group(function () {
        Route::get('/', [FrontdeskController::class, 'index'])->name('index');
        Route::patch('reservations/{reservation}/check-in', [FrontdeskController::class, 'checkIn'])->name('check-in');
        Route::patch('reservations/{reservation}/check-out', [FrontdeskController::class, 'checkOut'])->name('check-out');
        Route::patch('reservations/{reservation}/confirm', [FrontdeskController::class, 'confirmBooking'])->name('confirm');
        Route::patch('reservations/{reservation}/status', [FrontdeskController::class, 'updateStatus'])->name('update-status');
        Route::patch('reservations/{reservation}/cancel', [FrontdeskController::class, 'cancelReservation'])->name('cancel');
        Route::patch('reservations/{reservation}/change-room', [FrontdeskController::class, 'changeRoom'])->name('change-room');
        Route::post('reservations', [FrontdeskController::class, 'storeReservation'])->name('store');
        Route::patch('rooms/{room}/status', [FrontdeskController::class, 'updateRoomStatus'])->name('room-status');
    });
