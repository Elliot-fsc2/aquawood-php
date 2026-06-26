<?php

namespace Database\Factories;

use App\Models\Floor;
use App\Models\Room;
use App\Models\RoomCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Room>
 */
class RoomFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'number' => fake()->unique()->numerify('###'),
            'floor_id' => Floor::factory(),
            'room_category_id' => RoomCategory::factory(),
            'base_rate' => fake()->randomFloat(2, 100, 500),
            'capacity' => fake()->numberBetween(2, 6),
            'status' => 'available',
            'beds' => fake()->randomElement(['1 King', '2 Queen', '1 King + Sofa', '1 Queen']),
        ];
    }
}
