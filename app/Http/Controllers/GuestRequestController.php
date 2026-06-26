<?php

namespace App\Http\Controllers;

use App\Actions\GuestRequest\CreateGuestRequestAction;
use App\Actions\GuestRequest\UpdateRequestStatusAction;
use App\Enums\RequestPriorityEnum;
use App\Enums\RequestStatusEnum;
use App\Enums\ReservationStatusEnum;
use App\Models\GuestRequest;
use App\Models\Reservation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GuestRequestController extends Controller
{
    /**
     * Display the authenticated user's requests.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $requests = GuestRequest::where('guest_id', $user->id)
            ->latest()
            ->get();

        $hasActiveStay = Reservation::where('user_id', $user->id)
            ->where('status', ReservationStatusEnum::CheckedIn->value)
            ->exists();

        return Inertia::render('requests/index', [
            'requests' => $requests,
            'canMakeRequest' => $hasActiveStay,
        ]);
    }

    /**
     * Store a new guest request.
     */
    public function store(Request $request, CreateGuestRequestAction $createGuestRequest): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'details' => ['nullable', 'string', 'max:2000'],
            'priority' => ['required', 'in:'.implode(',', RequestPriorityEnum::values())],
        ]);

        try {
            $createGuestRequest->create($request->user(), $validated);
        } catch (\RuntimeException $e) {
            return back()->withErrors(['message' => $e->getMessage()]);
        }

        return to_route('requests.index');
    }

    /**
     * Admin: list all requests.
     */
    public function adminIndex(): Response
    {
        $requests = GuestRequest::with('guest')
            ->latest()
            ->get();

        return Inertia::render('admin/requests/index', [
            'requests' => $requests,
        ]);
    }

    /**
     * Admin: update request status.
     */
    public function adminUpdateStatus(Request $request, GuestRequest $guestRequest, UpdateRequestStatusAction $updateStatus): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:'.implode(',', RequestStatusEnum::values())],
        ]);

        $updateStatus->update($guestRequest, $validated['status']);

        return back();
    }
}
