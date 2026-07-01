<?php

namespace App\Actions\Food;

use App\Models\FoodItem;

class UpdateFoodItemAction
{
    public function handle(FoodItem $foodItem, array $data): FoodItem
    {
        $foodItem->update([
            'name' => $data['name'],
            'category' => $data['category'],
            'price' => $data['price'],
            'description' => $data['description'] ?? null,
            'available' => $data['available'] ?? true,
            'prep_time' => $data['prep_time'] ?? null,
            'image' => $data['image'] ?? null,
        ]);

        return $foodItem->fresh();
    }
}
