<?php

use App\Enums\RoleEnum;
use App\Http\Controllers\EmergencyController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])
    ->prefix('emergency')
    ->name('emergency.')
    ->group(function () {
        // Guest routes
        Route::post('/', [EmergencyController::class, 'store'])->name('store');

        // Staff/Front desk routes
        Route::middleware('role:'.RoleEnum::Admin->value.'|'.RoleEnum::Staff->value.'|'.RoleEnum::Receptionist->value)->group(function () {
            Route::get('active', [EmergencyController::class, 'activeEmergencies'])->name('active');
            Route::patch('{emergencyAlert}/acknowledge', [EmergencyController::class, 'acknowledge'])->name('acknowledge');
            Route::patch('{emergencyAlert}/resolve', [EmergencyController::class, 'resolve'])->name('resolve');
        });
    });
