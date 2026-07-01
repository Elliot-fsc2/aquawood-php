<?php

namespace App\Actions\Food;

use App\Models\FoodItem;

class DeleteFoodItemAction
{
    public function handle(FoodItem $foodItem): void
    {
        $foodItem->delete();
    }
}
