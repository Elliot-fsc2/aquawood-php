<?php

namespace Database\Seeders;

use App\Models\Room;
use App\Models\RoomCategory;
use Illuminate\Database\Seeder;

class RoomSeeder extends Seeder
{
    public function run(): void
    {
        $config = [
            'Standard' => ['count' => 8],
            'Deluxe Garden' => ['count' => 6],
            'Lagoon Suite' => ['count' => 4],
            'Family Villa' => ['count' => 3],
            'Presidential Suite' => ['count' => 2],
        ];

        $categories = RoomCategory::with('floor')->get();

        foreach ($categories as $category) {
            $count = $config[$category->name]['count'] ?? 4;
            $floorLevel = $category->floor->level;

            for ($i = 1; $i <= $count; $i++) {
                Room::create([
                    'number' => $floorLevel * 100 + $i,
                    'floor_id' => $category->floor_id,
                    'room_category_id' => $category->id,
                    'base_rate' => $category->base_price,
                    'capacity' => $category->capacity,
                    'status' => 'available',
                    'amenities' => json_encode($category->amenities),
                ]);
            }
        }
    }
}
