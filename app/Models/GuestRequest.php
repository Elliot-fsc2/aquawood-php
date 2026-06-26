<?php

namespace App\Models;

use App\Enums\RequestPriorityEnum;
use App\Enums\RequestStatusEnum;
use Database\Factories\GuestRequestFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GuestRequest extends Model
{
    /** @use HasFactory<GuestRequestFactory> */
    use HasFactory;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'resolved_at' => 'datetime',
            'priority' => RequestPriorityEnum::class,
            'status' => RequestStatusEnum::class,
        ];
    }

    public function guest(): BelongsTo
    {
        return $this->belongsTo(User::class, 'guest_id');
    }
}
