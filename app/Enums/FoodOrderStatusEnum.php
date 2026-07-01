<?php

namespace App\Enums;

enum FoodOrderStatusEnum: string
{
    case Pending = 'Pending';
    case Preparing = 'Preparing';
    case Ready = 'Ready';
    case Served = 'Served';
    case Cancelled = 'Cancelled';
}
