<?php

namespace App\Actions\Food;

use App\Models\FoodOrder;

class UpdateFoodOrderStatusAction
{
    public function handle(FoodOrder $foodOrder, string $status): FoodOrder
    {
        $foodOrder->update(['status' => $status]);

        return $foodOrder->fresh();
    }
}
