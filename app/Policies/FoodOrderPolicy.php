<?php

namespace App\Policies;

use App\Enums\PermissionEnum;
use App\Models\FoodOrder;
use App\Models\User;

class FoodOrderPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo(PermissionEnum::ViewFoodOrders->value);
    }

    public function view(User $user, FoodOrder $foodOrder): bool
    {
        return $user->hasPermissionTo(PermissionEnum::ViewFoodOrders->value);
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo(PermissionEnum::CreateFoodOrders->value);
    }

    public function update(User $user, FoodOrder $foodOrder): bool
    {
        return $user->hasPermissionTo(PermissionEnum::EditFoodOrders->value);
    }

    public function delete(User $user, FoodOrder $foodOrder): bool
    {
        return $user->hasPermissionTo(PermissionEnum::CancelFoodOrders->value);
    }
}
