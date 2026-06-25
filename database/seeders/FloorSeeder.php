<?php

namespace Database\Seeders;

use App\Models\Floor;
use Illuminate\Database\Seeder;

class FloorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Floor::create([
            'name' => 'Ground Floor',
            'level' => 1,
            'description' => 'Lobby, reception & accessible rooms',
        ]);

        Floor::create([
            'name' => 'Garden Level',
            'level' => 2,
            'description' => 'Garden-view deluxe rooms',
        ]);

        Floor::create([
            'name' => 'Lagoon Level',
            'level' => 3,
            'description' => 'Lagoon-view suites & villas',
        ]);

        Floor::create([
            'name' => 'Sky Level',
            'level' => 4,
            'description' => 'Presidential suites & penthouse',
        ]);
    }
}
