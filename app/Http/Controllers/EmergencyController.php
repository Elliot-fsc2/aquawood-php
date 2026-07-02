<?php

namespace App\Http\Controllers;

use App\Enums\EmergencyTypeEnum;
use App\Models\EmergencyAlert;
use App\Models\Reservation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmergencyController extends Controller
{
    /**
     * Guest: trigger an emergency alert.
     */
    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', EmergencyAlert::class);

        $validated = $request->validate([
            'type' => ['required', 'in:'.implode(',', EmergencyTypeEnum::values())],
            'details' => ['nullable', 'string', 'max:1000'],
        ]);

        $user = $request->user();

        $reservation = Reservation::where('user_id', $user->id)
            ->where('status', ReservationStatusEnum::CheckedIn->value)
            ->latest()
            ->first();

        EmergencyAlert::create([
            'guest_id' => $user->id,
            'reservation_id' => $reservation->id,
            'room_id' => $reservation->room_id,
            'type' => $validated['type'],
            'details' => $validated['details'] ?? null,
            'status' => 'active',
        ]);

        return back();
    }

    /**
     * Front desk / Admin: list active emergencies (JSON endpoint for polling).
     */
    public function activeEmergencies(): JsonResponse
    {
        $alerts = EmergencyAlert::with('guest', 'room', 'reservation')
            ->where('status', 'active')
            ->latest()
            ->get()
            ->map(fn ($alert) => [
                'id' => (string) $alert->id,
                'guestName' => $alert->guest?->name ?? 'Unknown',
                'roomNumber' => $alert->room?->number ?? '',
                'type' => $alert->type,
                'details' => $alert->details,
                'status' => $alert->status,
                'createdAt' => $alert->created_at->diffForHumans(),
                'createdAtIso' => $alert->created_at->toISOString(),
            ]);

        return response()->json(['alerts' => $alerts]);
    }

    /**
     * Front desk / Admin: acknowledge an emergency.
     */
    public function acknowledge(Request $request, EmergencyAlert $emergencyAlert): RedirectResponse
    {
        if ($emergencyAlert->status !== 'active') {
            return back()->withErrors(['acknowledge' => 'This alert has already been handled.']);
        }

        $emergencyAlert->update([
            'status' => 'acknowledged',
            'acknowledged_by' => $request->user()->id,
            'acknowledged_at' => now(),
        ]);

        return back();
    }

    /**
     * Front desk / Admin: resolve an emergency.
     */
    public function resolve(Request $request, EmergencyAlert $emergencyAlert): RedirectResponse
    {
        if ($emergencyAlert->status === 'resolved') {
            return back()->withErrors(['resolve' => 'This alert is already resolved.']);
        }

        $emergencyAlert->update([
            'status' => 'resolved',
            'acknowledged_by' => $emergencyAlert->acknowledged_by ?? $request->user()->id,
            'acknowledged_at' => $emergencyAlert->acknowledged_at ?? now(),
        ]);

        return back();
    }

    /**
     * Admin: list all emergencies.
     */
    public function adminIndex(Request $request): Response
    {
        $status = $request->query('status');

        $alerts = EmergencyAlert::with('guest', 'room', 'reservation')
            ->when($status, fn ($query) => $query->where('status', $status))
            ->latest()
            ->get()
            ->map(fn ($alert) => [
                'id' => (string) $alert->id,
                'guestName' => $alert->guest?->name ?? 'Unknown',
                'roomNumber' => $alert->room?->number ?? '',
                'type' => $alert->type,
                'details' => $alert->details,
                'status' => $alert->status,
                'acknowledgedByName' => $alert->acknowledgedBy?->name ?? null,
                'acknowledgedAt' => $alert->acknowledged_at?->diffForHumans(),
                'createdAt' => $alert->created_at->diffForHumans(),
                'createdAtIso' => $alert->created_at->toISOString(),
            ]);

        return Inertia::render('admin/emergencies/index', [
            'alerts' => $alerts,
            'selectedStatus' => $status,
        ]);
    }
}
