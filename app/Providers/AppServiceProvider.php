<?php

namespace App\Providers;

use App\Models\EmergencyAlert;
use App\Models\FoodItem;
use App\Models\FoodOrder;
use App\Models\Reservation;
use App\Models\Room;
use App\Policies\EmergencyAlertPolicy;
use App\Policies\FoodItemPolicy;
use App\Policies\FoodOrderPolicy;
use App\Policies\ReservationPolicy;
use App\Policies\RoomPolicy;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->registerPolicies();
    }

    protected function registerPolicies(): void
    {
        Gate::policy(Reservation::class, ReservationPolicy::class);
        Gate::policy(Room::class, RoomPolicy::class);
        Gate::policy(FoodItem::class, FoodItemPolicy::class);
        Gate::policy(FoodOrder::class, FoodOrderPolicy::class);
        Gate::policy(EmergencyAlert::class, EmergencyAlertPolicy::class);
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
