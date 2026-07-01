<?php

namespace App\Policies;

use App\Enums\PermissionEnum;
use App\Models\FoodItem;
use App\Models\User;

class FoodItemPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo(PermissionEnum::ViewFoodItems->value);
    }

    public function view(User $user, FoodItem $foodItem): bool
    {
        return $user->hasPermissionTo(PermissionEnum::ViewFoodItems->value);
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo(PermissionEnum::CreateFoodItems->value);
    }

    public function update(User $user, FoodItem $foodItem): bool
    {
        return $user->hasPermissionTo(PermissionEnum::EditFoodItems->value);
    }

    public function delete(User $user, FoodItem $foodItem): bool
    {
        return $user->hasPermissionTo(PermissionEnum::DeleteFoodItems->value);
    }
}
