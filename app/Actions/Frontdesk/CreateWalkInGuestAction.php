<?php

namespace App\Actions\Frontdesk;

use App\Enums\RoleEnum;
use App\Models\Guest;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class CreateWalkInGuestAction
{
    public function handle(string $name): User
    {
        $email = 'walkin-'.Str::random(8).'@aquawood.com';

        $user = User::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make(Str::password(16)),
        ]);

        Guest::create([
            'user_id' => $user->id,
        ]);

        $user->assignRole(RoleEnum::Guest->value);

        return $user;
    }
}
