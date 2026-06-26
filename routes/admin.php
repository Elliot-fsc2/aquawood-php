<?php

use App\Enums\RoleEnum;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\FloorController;
use App\Http\Controllers\Admin\RoomController;
use App\Http\Controllers\BookingController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:'.RoleEnum::Admin->value])->prefix('admin')->name('admin.')->group(function () {
    // Floors
    Route::get('floors', [FloorController::class, 'index'])->name('floors.index');
    Route::get('floors/create', [FloorController::class, 'create'])->name('floors.create');
    Route::post('floors', [FloorController::class, 'store'])->name('floors.store');
    Route::get('floors/{floor}/edit', [FloorController::class, 'edit'])->name('floors.edit');
    Route::patch('floors/{floor}', [FloorController::class, 'update'])->name('floors.update');
    Route::delete('floors/{floor}', [FloorController::class, 'destroy'])->name('floors.destroy');

    // Categories
    Route::get('categories', [CategoryController::class, 'index'])->name('categories.index');
    Route::get('categories/create', [CategoryController::class, 'create'])->name('categories.create');
    Route::post('categories', [CategoryController::class, 'store'])->name('categories.store');
    Route::get('categories/{category}/edit', [CategoryController::class, 'edit'])->name('categories.edit');
    Route::patch('categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
    Route::delete('categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');

    // Rooms
    Route::get('rooms', [RoomController::class, 'index'])->name('rooms.index');
    Route::get('rooms/create', [RoomController::class, 'create'])->name('rooms.create');
    Route::post('rooms', [RoomController::class, 'store'])->name('rooms.store');
    Route::get('rooms/{room}/edit', [RoomController::class, 'edit'])->name('rooms.edit');
    Route::patch('rooms/{room}', [RoomController::class, 'update'])->name('rooms.update');
    Route::delete('rooms/{room}', [RoomController::class, 'destroy'])->name('rooms.destroy');

    // Bookings
    Route::get('bookings', [BookingController::class, 'adminIndex'])->name('bookings.index');
});
