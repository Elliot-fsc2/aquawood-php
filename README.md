# Aquawoods

A resort management application built with [Laravel](https://laravel.com) and [React](https://react.dev) using [Inertia.js](https://inertiajs.com).

## Features

- **Guest-facing** — Browse rooms, check availability, and make reservations
- **Admin dashboard** — Overview of bookings, guests, rooms, and categories with monthly charts
- **Room management** — Manage floors, categories, rooms with CRUD operations
- **Booking management** — View, filter, and update reservation statuses
- **Guest management** — View guests, suspend/reinstate access
- **Guest requests** — Handle guest service requests
- **Authentication** — Login, registration, password reset, email verification, two-factor authentication, passkeys
- **Role-based access** — Admin and guest roles via Spatie permissions

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Laravel 13, PHP 8.3 |
| Frontend | React 19, Inertia.js v3, Tailwind CSS v4, shadcn/ui |
| Database | MySQL / SQLite |
| Auth | Laravel Fortify |
| Roles | Spatie Laravel Permission |
| Testing | Pest 4 |
| Tooling | Vite, ESLint, Prettier, Pint, PHPStan, Larastan |

## Setup

```bash
cp .env.example .env
# Configure your database in .env

composer install
npm install

php artisan key:generate
php artisan migrate:fresh --seed
npm run build
```

Or use the setup script:

```bash
composer setup
```

## Development

```bash
composer run dev
```

This runs the Laravel server, queue listener, and Vite dev server concurrently.

## Scripts

| Command | Description |
|---------|-------------|
| `composer setup` | Full project setup (install deps, migrate, seed, build) |
| `composer run dev` | Start dev servers |
| `composer run lint` | Auto-fix code style with Pint |
| `composer run test` | Run lint, static analysis, and tests |
| `npm run build` | Build frontend assets |
| `npm run dev` | Vite dev server only |

## Structure

```
app/
├── Actions/          # Domain actions (booking, guest, requests)
├── Enums/            # PHP enums (roles, statuses, floors)
├── Http/
│   ├── Controllers/  # Web and admin controllers
│   └── Requests/     # Form requests
├── Models/           # Eloquent models
└── Providers/        # Service providers

resources/js/
├── components/       # React components
│   └── ui/          # shadcn/ui components
├── pages/           # Inertia page components
│   ├── admin/       # Admin panel pages
│   └── ...          # Guest-facing pages
└── lib/             # Utilities

routes/
├── web.php          # Guest routes and dashboard
├── admin.php        # Admin CRUD routes
└── settings.php     # Profile and security settings
```

## Production

Deploy with [Laravel Cloud](https://cloud.laravel.com/).
