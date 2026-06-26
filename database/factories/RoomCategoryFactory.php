<?php

namespace Database\Factories;

use App\Models\Floor;
use App\Models\RoomCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RoomCategory>
 */
class RoomCategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->randomElement(['Standard Room', 'Deluxe Suite', 'Garden Villa', 'Pool Villa', 'Presidential Suite']),
            'floor_id' => Floor::factory(),
            'base_price' => fake()->randomFloat(2, 100, 1000),
            'capacity' => fake()->numberBetween(2, 6),
            'amenities' => fake()->randomElements(['WiFi', 'Smart TV', 'Mini Bar', 'Jacuzzi', 'Garden View', 'Pool Access'], fake()->numberBetween(1, 4)),
        ];
    }
}
