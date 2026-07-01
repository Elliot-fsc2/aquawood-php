<?php

namespace App\Actions\Food;

use App\Models\FoodItem;

class CreateFoodItemAction
{
    public function handle(array $data): FoodItem
    {
        return FoodItem::create([
            'name' => $data['name'],
            'category' => $data['category'],
            'price' => $data['price'],
            'description' => $data['description'] ?? null,
            'available' => $data['available'] ?? true,
            'prep_time' => $data['prep_time'] ?? null,
            'image' => $data['image'] ?? null,
        ]);
    }
}
