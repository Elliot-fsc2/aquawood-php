<?php

namespace App\Http\Requests\Admin;

use App\Enums\RoomStatusEnum;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRoomRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'number' => ['required', 'string', 'max:50', 'unique:rooms,number'],
            'floor_id' => ['required', 'exists:floors,id'],
            'room_category_id' => ['required', 'exists:room_categories,id'],
            'base_rate' => ['required', 'numeric', 'min:0'],
            'capacity' => ['required', 'integer', 'min:1'],
            'status' => ['required', 'string', Rule::in(array_map(fn ($case) => $case->value, RoomStatusEnum::cases()))],
            'beds' => ['nullable', 'string', 'max:255'],
            'amenities' => ['nullable', 'json'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ];
    }

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }
}
