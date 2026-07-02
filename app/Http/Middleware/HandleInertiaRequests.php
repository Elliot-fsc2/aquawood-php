<?php

namespace App\Http\Middleware;

use App\Enums\ReservationStatusEnum;
use App\Models\EmergencyAlert;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        $activeEmergencyCount = $user && ($user->hasRole('Admin') || $user->hasRole('Receptionist'))
            ? EmergencyAlert::where('status', 'active')->count()
            : 0;

        $canTriggerEmergency = $user && $user->hasRole('Guest')
            ? Reservation::where('user_id', $user->id)
                ->where('status', ReservationStatusEnum::CheckedIn->value)
                ->exists()
            : false;

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user,
                'permissions' => $user?->getAllPermissions()->pluck('name'),
                'roles' => $user?->getRoleNames(),
            ],
            'activeEmergencyCount' => $activeEmergencyCount,
            'canTriggerEmergency' => $canTriggerEmergency,
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
