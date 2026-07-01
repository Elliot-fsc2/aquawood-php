<?php

namespace App\Actions\Food;

use App\Models\FoodItem;
use App\Models\FoodOrder;
use App\Models\FoodOrderItem;

class CreateFoodOrderAction
{
    public function handle(array $data, int $userId): FoodOrder
    {
        $order = FoodOrder::create([
            'reservation_id' => $data['reservation_id'] ?? null,
            'room_id' => $data['room_id'] ?? null,
            'guest_id' => $data['guest_id'] ?? $userId,
            'order_type' => $data['order_type'],
            'notes' => $data['notes'] ?? null,
        ]);

        foreach ($data['items'] as $itemData) {
            $foodItem = FoodItem::findOrFail($itemData['food_item_id']);
            $subtotal = $foodItem->price * $itemData['quantity'];

            FoodOrderItem::create([
                'food_order_id' => $order->id,
                'food_item_id' => $foodItem->id,
                'quantity' => $itemData['quantity'],
                'unit_price' => $foodItem->price,
                'subtotal' => $subtotal,
            ]);
        }

        return $order->load(['items.foodItem', 'room', 'guest']);
    }
}
