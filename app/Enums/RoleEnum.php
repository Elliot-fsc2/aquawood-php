<?php

namespace App\Enums;

enum RoleEnum: string
{
    case Admin = 'Admin';
    case Guest = 'Guest';
    case Receptionist = 'Receptionist';
    case Staff = 'Staff';
}
