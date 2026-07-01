<?php

namespace App\Http\Controllers;

use App\Actions\Food\CreateFoodOrderAction;
use App\Actions\Food\DeleteFoodOrderAction;
use App\Actions\Food\UpdateFoodOrderStatusAction;
use App\Models\FoodOrder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FoodOrderController extends Controller
{
    public function store(Request $request, CreateFoodOrderAction $createFoodOrder): RedirectResponse
    {
        $this->authorize('create', FoodOrder::class);

        $validated = $request->validate([
            'reservation_id' => ['nullable', 'exists:reservations,id'],
            'room_id' => ['nullable', 'exists:rooms,id'],
            'guest_id' => ['nullable', 'exists:users,id'],
            'order_type' => ['required', 'string'],
            'notes' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.food_item_id' => ['required', 'exists:food_items,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        $createFoodOrder->handle($validated, $request->user()->id);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Order placed successfully.',
        ]);

        return back();
    }

    public function updateStatus(Request $request, FoodOrder $foodOrder, UpdateFoodOrderStatusAction $updateStatus): RedirectResponse
    {
        $this->authorize('update', $foodOrder);

        $validated = $request->validate([
            'status' => ['required', 'string'],
        ]);

        $updateStatus->handle($foodOrder, $validated['status']);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Order status updated.',
        ]);

        return back();
    }

    public function destroy(FoodOrder $foodOrder, DeleteFoodOrderAction $deleteFoodOrder): RedirectResponse
    {
        $this->authorize('delete', $foodOrder);

        $deleteFoodOrder->handle($foodOrder);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Order deleted.',
        ]);

        return back();
    }
}
