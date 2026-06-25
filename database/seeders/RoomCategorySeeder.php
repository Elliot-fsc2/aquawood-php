<?php

namespace Database\Seeders;

use App\Enums\FloorEnum;
use App\Models\Floor;
use App\Models\RoomCategory;
use Illuminate\Database\Seeder;

class RoomCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Standard',
                'floor_code' => 'FL-1',
                'base_price' => 145,
                'capacity' => 2,
                'quantity' => 6,
                'amenities' => ['WiFi', 'Smart TV', 'Mini Bar'],
            ],
            [
                'name' => 'Deluxe Garden',
                'floor_code' => 'FL-2',
                'base_price' => 225,
                'capacity' => 2,
                'quantity' => 7,
                'amenities' => ['WiFi', 'Garden View', 'Balcony'],
            ],
            [
                'name' => 'Lagoon Suite',
                'floor_code' => 'FL-3',
                'base_price' => 385,
                'capacity' => 3,
                'quantity' => 5,
                'amenities' => ['Lagoon View', 'Jacuzzi', 'Living Area'],
            ],
            [
                'name' => 'Family Villa',
                'floor_code' => 'FL-3',
                'base_price' => 495,
                'capacity' => 5,
                'quantity' => 4,
                'amenities' => ['Private Pool', 'Kitchen', 'Kids Corner'],
            ],
            [
                'name' => 'Presidential Suite',
                'floor_code' => 'FL-4',
                'base_price' => 895,
                'capacity' => 2,
                'quantity' => 2,
                'amenities' => ['Butler Service', 'Private Terrace'],
            ],
        ];

        foreach ($categories as $category) {
            $floorEnum = FloorEnum::fromCode($category['floor_code']);
            $floor = Floor::where('level', $floorEnum->level())->first();

            RoomCategory::create([
                'name' => $category['name'],
                'floor_id' => $floor->id,
                'base_price' => $category['base_price'],
                'capacity' => $category['capacity'],
                'quantity' => $category['quantity'],
                'amenities' => $category['amenities'],
            ]);
        }
    }
}
