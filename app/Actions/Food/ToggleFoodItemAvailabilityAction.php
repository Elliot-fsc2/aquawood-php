<?php

namespace App\Actions\Food;

use App\Models\FoodItem;

class ToggleFoodItemAvailabilityAction
{
    public function handle(FoodItem $foodItem): FoodItem
    {
        $foodItem->update(['available' => ! $foodItem->available]);

        return $foodItem->fresh();
    }
}
