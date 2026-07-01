<?php

namespace Database\Seeders;

use App\Enums\RoleEnum;
use App\Models\User;
use Illuminate\Database\Seeder;

class ReceptionistUserSeeder extends Seeder
{
    public function run(): void
    {
        $receptionist = User::factory()->create([
            'name' => 'Receptionist',
            'email' => 'receptionist@aquawood.com',
            'password' => bcrypt('Aquawood2026!'),
        ]);

        $receptionist->assignRole(RoleEnum::Receptionist->value);
    }
}
