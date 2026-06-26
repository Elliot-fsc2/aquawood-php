<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreFloorRequest;
use App\Http\Requests\Admin\UpdateFloorRequest;
use App\Models\Floor;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class FloorController extends Controller
{
    /**
     * Display a listing of floors.
     */
    public function index(): Response
    {
        $floors = Floor::withCount(['room', 'roomCategories'])->orderBy('level')->get();

        return Inertia::render('admin/floors/index', [
            'floors' => $floors,
        ]);
    }

    /**
     * Show the form for creating a new floor.
     */
    public function create(): Response
    {
        return Inertia::render('admin/floors/form', [
            'floor' => null,
        ]);
    }

    /**
     * Store a newly created floor in storage.
     */
    public function store(StoreFloorRequest $request): RedirectResponse
    {
        Floor::create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Floor created.')]);

        return to_route('admin.floors.index');
    }

    /**
     * Show the form for editing the specified floor.
     */
    public function edit(Floor $floor): Response
    {
        return Inertia::render('admin/floors/form', [
            'floor' => $floor,
        ]);
    }

    /**
     * Update the specified floor in storage.
     */
    public function update(UpdateFloorRequest $request, Floor $floor): RedirectResponse
    {
        $floor->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Floor updated.')]);

        return to_route('admin.floors.index');
    }

    /**
     * Remove the specified floor from storage.
     */
    public function destroy(Floor $floor): RedirectResponse
    {
        $floor->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Floor deleted.')]);

        return to_route('admin.floors.index');
    }
}
