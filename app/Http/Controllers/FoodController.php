<?php

namespace App\Http\Controllers;

use App\Actions\Food\CreateFoodItemAction;
use App\Actions\Food\DeleteFoodItemAction;
use App\Actions\Food\ToggleFoodItemAvailabilityAction;
use App\Actions\Food\UpdateFoodItemAction;
use App\Enums\ReservationStatusEnum;
use App\Enums\RoleEnum;
use App\Models\FoodItem;
use App\Models\FoodOrder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class FoodController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', FoodItem::class);

        $foodItems = FoodItem::orderBy('name')->get()->map(fn ($item) => [
            'id' => (string) $item->id,
            'name' => $item->name,
            'category' => $item->category,
            'price' => (float) $item->price,
            'description' => $item->description ?? '',
            'available' => $item->available,
            'prepTime' => $item->prep_time,
            'image' => $item->image ?? '',
        ]);

        $user = $request->user();
        $isGuest = $user->hasRole(RoleEnum::Guest->value);
        $ordersQuery = FoodOrder::with(['items.foodItem', 'room', 'guest']);

        if ($isGuest) {
            $ordersQuery->where('guest_id', $user->id);
        }

        $orders = $ordersQuery->latest()->get()->map(fn ($order) => [
            'id' => (string) $order->id,
            'orderType' => $order->order_type,
            'tableOrRoom' => $order->room?->number ?? 'N/A',
            'guestName' => $order->guest?->name ?? 'Walk-in',
            'items' => $order->items->map(fn ($item) => [
                'menuItemId' => (string) $item->food_item_id,
                'name' => $item->foodItem?->name ?? 'Deleted Item',
                'price' => (float) $item->unit_price,
                'quantity' => $item->quantity,
            ]),
            'subtotal' => $order->subtotal,
            'tax' => $order->tax,
            'total' => $order->total,
            'status' => $order->status,
            'payment' => 'Unpaid',
            'createdAt' => $order->created_at->format('h:i A'),
            'createdAtIso' => $order->created_at->toISOString(),
            'notes' => $order->notes ?? '',
        ]);

        $activeReservation = $isGuest
            ? $user->reservations()
                ->where('status', ReservationStatusEnum::CheckedIn->value)
                ->whereHas('room')
                ->with('room')
                ->first()
            : null;

        return Inertia::render('food/index', [
            'foodItems' => $foodItems,
            'orders' => $orders,
            'activeRoomNumber' => $activeReservation?->room?->number,
            'activeRoomId' => $activeReservation?->room?->id ? (int) $activeReservation->room->id : null,
        ]);
    }

    public function store(Request $request, CreateFoodItemAction $createFoodItem): RedirectResponse
    {
        $this->authorize('create', FoodItem::class);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'description' => ['nullable', 'string'],
            'available' => ['boolean'],
            'prep_time' => ['nullable', 'integer', 'min:1'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('images/food', 'public');
        }

        $createFoodItem->handle($validated);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Menu item added successfully.',
        ]);

        return back();
    }

    public function update(Request $request, FoodItem $foodItem, UpdateFoodItemAction $updateFoodItem): RedirectResponse
    {
        $this->authorize('update', $foodItem);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'description' => ['nullable', 'string'],
            'available' => ['boolean'],
            'prep_time' => ['nullable', 'integer', 'min:1'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ]);

        if ($request->hasFile('image')) {
            if ($foodItem->image) {
                Storage::disk('public')->delete($foodItem->image);
            }
            $validated['image'] = $request->file('image')->store('images/food', 'public');
        } elseif ($request->boolean('remove_image')) {
            if ($foodItem->image) {
                Storage::disk('public')->delete($foodItem->image);
            }
            $validated['image'] = null;
        } else {
            unset($validated['image']);
        }

        $updateFoodItem->handle($foodItem, $validated);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Menu item updated successfully.',
        ]);

        return back();
    }

    public function destroy(FoodItem $foodItem, DeleteFoodItemAction $deleteFoodItem): RedirectResponse
    {
        $this->authorize('delete', $foodItem);

        if ($foodItem->image) {
            Storage::disk('public')->delete($foodItem->image);
        }

        $deleteFoodItem->handle($foodItem);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Menu item deleted.',
        ]);

        return back();
    }

    public function toggleAvailability(FoodItem $foodItem, ToggleFoodItemAvailabilityAction $toggleAvailability): RedirectResponse
    {
        $this->authorize('update', $foodItem);

        $toggleAvailability->handle($foodItem);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Menu item availability toggled.',
        ]);

        return back();
    }
}
