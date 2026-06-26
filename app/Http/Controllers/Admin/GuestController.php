<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Guest\SuspendGuestAction;
use App\Enums\ReservationStatusEnum;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GuestController extends Controller
{
    /**
     * Display a listing of guests.
     */
    public function index(Request $request): Response
    {
        $guests = User::with('guest')
            ->role('Guest')
            ->when($request->filled('search'), function ($q) use ($request) {
                $q->where(function ($query) use ($request) {
                    $query->where('name', 'like', '%'.$request->search.'%')
                        ->orWhere('email', 'like', '%'.$request->search.'%');
                });
            })
            ->when($request->filled('status'), function ($q) use ($request) {
                if ($request->status === 'suspended') {
                    $q->whereNotNull('suspended_at');
                } elseif ($request->status === 'active') {
                    $q->whereNull('suspended_at');
                }
            })
            ->latest()
            ->get()
            ->map(fn ($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'is_suspended' => $user->is_suspended,
                'suspended_at' => $user->suspended_at,
                'guest' => $user->guest,
                'reservations_count' => $user->reservations()->count(),
                'total_spent' => $user->reservations()
                    ->where('status', '!=', ReservationStatusEnum::Cancelled->value)
                    ->sum('total_price'),
                'created_at' => $user->created_at,
            ]);

        return Inertia::render('admin/guests/index', [
            'guests' => $guests,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Suspend a guest account.
     */
    public function suspend(Request $request, User $user, SuspendGuestAction $suspendGuest): RedirectResponse
    {
        try {
            $suspendGuest->suspend($user);
        } catch (\RuntimeException $e) {
            return redirect()->route('admin.guests.index', $request->query())->withErrors(['suspend' => $e->getMessage()]);
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __(':name has been suspended.', ['name' => $user->name]),
        ]);

        return redirect()->route('admin.guests.index', $request->query());
    }

    /**
     * Reinstate a suspended guest account.
     */
    public function reinstate(Request $request, User $user, SuspendGuestAction $suspendGuest): RedirectResponse
    {
        try {
            $suspendGuest->reinstate($user);
        } catch (\RuntimeException $e) {
            return redirect()->route('admin.guests.index', $request->query())->withErrors(['reinstate' => $e->getMessage()]);
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __(':name has been reinstated.', ['name' => $user->name]),
        ]);

        return redirect()->route('admin.guests.index', $request->query());
    }
}
