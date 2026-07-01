<?php

use App\Enums\RoleEnum;
use App\Http\Controllers\FoodController;
use App\Http\Controllers\FoodOrderController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:'.RoleEnum::Admin->value.'|'.RoleEnum::Staff->value.'|'.RoleEnum::Receptionist->value.'|'.RoleEnum::Guest->value])
    ->prefix('food')
    ->name('food.')
    ->group(function () {
        Route::get('/', [FoodController::class, 'index'])->name('index');
        Route::post('/', [FoodController::class, 'store'])->name('store');
        Route::patch('{foodItem}', [FoodController::class, 'update'])->name('update');
        Route::patch('{foodItem}/toggle-availability', [FoodController::class, 'toggleAvailability'])->name('toggle-availability');
        Route::delete('{foodItem}', [FoodController::class, 'destroy'])->name('destroy');
    });

Route::middleware(['auth', 'role:'.RoleEnum::Admin->value.'|'.RoleEnum::Staff->value.'|'.RoleEnum::Receptionist->value.'|'.RoleEnum::Guest->value])
    ->prefix('food-orders')
    ->name('food-orders.')
    ->group(function () {
        Route::post('/', [FoodOrderController::class, 'store'])->name('store');
        Route::patch('{foodOrder}/status', [FoodOrderController::class, 'updateStatus'])->name('update-status');
        Route::delete('{foodOrder}', [FoodOrderController::class, 'destroy'])->name('destroy');
    });
