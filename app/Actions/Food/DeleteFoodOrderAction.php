<?php

namespace App\Actions\Food;

use App\Models\FoodOrder;

class DeleteFoodOrderAction
{
    public function handle(FoodOrder $foodOrder): void
    {
        $foodOrder->delete();
    }
}
