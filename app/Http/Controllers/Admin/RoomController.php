<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreRoomRequest;
use App\Http\Requests\Admin\UpdateRoomRequest;
use App\Models\Floor;
use App\Models\Room;
use App\Models\RoomCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class RoomController extends Controller
{
    /**
     * Display a listing of rooms.
     */
    public function index(): Response
    {
        $rooms = Room::with(['floor', 'category'])->get();

        return Inertia::render('admin/rooms/index', [
            'rooms' => $rooms,
        ]);
    }

    /**
     * Show the form for creating a new room.
     */
    public function create(): Response
    {
        return Inertia::render('admin/rooms/form', [
            'room' => null,
            'floors' => Floor::orderBy('level')->get(),
            'categories' => RoomCategory::all(),
        ]);
    }

    /**
     * Store a newly created room in storage.
     */
    public function store(StoreRoomRequest $request): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('images/rooms', 'public');
        }

        Room::create($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Room created.')]);

        return to_route('admin.rooms.index');
    }

    /**
     * Show the form for editing the specified room.
     */
    public function edit(Room $room): Response
    {
        return Inertia::render('admin/rooms/form', [
            'room' => $room->load(['floor', 'category']),
            'floors' => Floor::orderBy('level')->get(),
            'categories' => RoomCategory::all(),
        ]);
    }

    /**
     * Update the specified room in storage.
     */
    public function update(UpdateRoomRequest $request, Room $room): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            // Delete old image
            if ($room->image) {
                Storage::disk('public')->delete($room->image);
            }

            $data['image'] = $request->file('image')->store('images/rooms', 'public');
        } elseif ($request->boolean('remove_image')) {
            // User explicitly requested to remove the image
            if ($room->image) {
                Storage::disk('public')->delete($room->image);
            }

            $data['image'] = null;
        } else {
            unset($data['image']);
        }

        $room->update($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Room updated.')]);

        return to_route('admin.rooms.index');
    }

    /**
     * Remove the specified room from storage.
     */
    public function destroy(Room $room): RedirectResponse
    {
        $room->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Room deleted.')]);

        return to_route('admin.rooms.index');
    }
}
