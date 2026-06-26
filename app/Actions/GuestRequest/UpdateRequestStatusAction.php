<?php

namespace App\Actions\GuestRequest;

use App\Enums\RequestStatusEnum;
use App\Models\GuestRequest;

class UpdateRequestStatusAction
{
    /**
     * Update the status of a guest request.
     *
     * @throws \RuntimeException
     */
    public function update(GuestRequest $guestRequest, string $status): GuestRequest
    {
        $data = ['status' => $status];

        if ($status === RequestStatusEnum::Resolved->value) {
            $data['resolved_at'] = now();
        }

        $guestRequest->update($data);

        return $guestRequest->fresh();
    }
}
