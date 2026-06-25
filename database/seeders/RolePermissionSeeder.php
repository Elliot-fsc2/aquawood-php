<?php

namespace Database\Seeders;

use App\Enums\PermissionEnum;
use App\Enums\RoleEnum;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $allPermissions = PermissionEnum::values();

        foreach ($allPermissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Clear cache again after creating permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Create Admin role with all permissions
        $admin = Role::firstOrCreate(['name' => RoleEnum::Admin->value]);
        $admin->syncPermissions($allPermissions);

        // Create Guest role with read-only permissions
        $guest = Role::firstOrCreate(['name' => RoleEnum::Guest->value]);
        $guest->syncPermissions([
            PermissionEnum::ViewRooms->value,
            PermissionEnum::ViewFloors->value,
            PermissionEnum::ViewRoomCategories->value,
        ]);
    }
}
