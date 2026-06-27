import { Head, Link } from '@inertiajs/react';
import {
    BedDouble,
    BookOpen,
    Building2,
    CalendarCheck,
    Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { index as adminBookingsIndex } from '@/routes/admin/bookings';
import { index as adminGuestsIndex } from '@/routes/admin/guests';
import { index as adminRoomsIndex } from '@/routes/admin/rooms';
import { index as adminCategoriesIndex } from '@/routes/admin/categories';
import { dashboard } from '@/routes';

interface DashboardProps {
    stats: {
        total_bookings: number;
        pending_bookings: number;
        confirmed_bookings: number;
        checked_in: number;
        checked_out: number;
        cancelled: number;
        total_guests: number;
        active_guests: number;
        available_rooms: number;
        occupied_rooms: number;
        maintenance_rooms: number;
        booked_rooms: number;
        total_categories: number;
    };
}

export default function AdminDashboard({ stats }: DashboardProps) {
    const statCards = [
        {
            title: 'Bookings',
            total: stats.total_bookings,
            href: adminBookingsIndex(),
            icon: BookOpen,
            color: 'text-blue-600',
            bg: 'bg-blue-100',
            breakdown: [
                {
                    label: 'Pending',
                    value: stats.pending_bookings,
                    color: 'text-yellow-600',
                },
                {
                    label: 'Confirmed',
                    value: stats.confirmed_bookings,
                    color: 'text-green-600',
                },
                {
                    label: 'Checked In',
                    value: stats.checked_in,
                    color: 'text-indigo-600',
                },
                {
                    label: 'Checked Out',
                    value: stats.checked_out,
                    color: 'text-gray-600',
                },
                {
                    label: 'Cancelled',
                    value: stats.cancelled,
                    color: 'text-red-600',
                },
            ],
        },
        {
            title: 'Guests',
            total: stats.total_guests,
            href: adminGuestsIndex(),
            icon: Users,
            color: 'text-emerald-600',
            bg: 'bg-emerald-100',
            breakdown: [
                {
                    label: 'Active',
                    value: stats.active_guests,
                    color: 'text-emerald-600',
                },
            ],
        },
        {
            title: 'Rooms',
            total:
                stats.available_rooms +
                stats.occupied_rooms +
                stats.maintenance_rooms +
                stats.booked_rooms,
            href: adminRoomsIndex(),
            icon: BedDouble,
            color: 'text-amber-600',
            bg: 'bg-amber-100',
            breakdown: [
                {
                    label: 'Available',
                    value: stats.available_rooms,
                    color: 'text-green-600',
                },
                {
                    label: 'Occupied',
                    value: stats.occupied_rooms,
                    color: 'text-red-600',
                },
                {
                    label: 'Maintenance',
                    value: stats.maintenance_rooms,
                    color: 'text-yellow-600',
                },
                {
                    label: 'Booked',
                    value: stats.booked_rooms,
                    color: 'text-blue-600',
                },
            ],
        },
        {
            title: 'Categories',
            total: stats.total_categories,
            href: adminCategoriesIndex(),
            icon: Building2,
            color: 'text-purple-600',
            bg: 'bg-purple-100',
        },
    ];

    return (
        <>
            <Head title="Admin Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Admin Dashboard
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Overview of your resort operations
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((stat) => (
                        <Link
                            key={stat.title}
                            href={stat.href}
                            className="flex"
                        >
                            <Card className="flex w-full flex-col transition-shadow hover:shadow-md">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {stat.title}
                                    </CardTitle>
                                    <div
                                        className={`rounded-lg p-2 ${stat.bg}`}
                                    >
                                        <stat.icon
                                            className={`h-4 w-4 ${stat.color}`}
                                        />
                                    </div>
                                </CardHeader>
                                <CardContent className="flex flex-1 flex-col">
                                    <div className="text-2xl font-bold">
                                        {stat.total}
                                    </div>
                                    {stat.breakdown && (
                                        <div className="mt-auto space-y-1 pt-3">
                                            {stat.breakdown.map((b) => (
                                                <div
                                                    key={b.label}
                                                    className="flex items-center justify-between text-xs"
                                                >
                                                    <span className="text-muted-foreground">
                                                        {b.label}
                                                    </span>
                                                    <span
                                                        className={`font-medium ${b.color}`}
                                                    >
                                                        {b.value}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

                <div className="rounded-xl border bg-card p-6">
                    <h2 className="mb-4 text-lg font-semibold">Quick Links</h2>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <Link
                            href={adminBookingsIndex()}
                            className="flex items-center gap-3 rounded-lg border p-3 text-sm transition-colors hover:bg-muted"
                        >
                            <CalendarCheck className="h-5 w-5 text-blue-600" />
                            <span>Manage Reservations</span>
                        </Link>
                        <Link
                            href={adminRoomsIndex()}
                            className="flex items-center gap-3 rounded-lg border p-3 text-sm transition-colors hover:bg-muted"
                        >
                            <BedDouble className="h-5 w-5 text-amber-600" />
                            <span>Manage Rooms</span>
                        </Link>
                        <Link
                            href={adminGuestsIndex()}
                            className="flex items-center gap-3 rounded-lg border p-3 text-sm transition-colors hover:bg-muted"
                        >
                            <Users className="h-5 w-5 text-emerald-600" />
                            <span>Manage Guests</span>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

AdminDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
