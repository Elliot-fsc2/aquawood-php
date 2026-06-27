<?php

namespace Database\Seeders;

use App\Enums\RoleEnum;
use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@aquawood.com',
            'password' => bcrypt('Aquawood2026!'),
        ]);

        $admin->assignRole(RoleEnum::Admin->value);
    }
}
