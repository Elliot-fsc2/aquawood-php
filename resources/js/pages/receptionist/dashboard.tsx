import { Head, Link } from '@inertiajs/react';
import {
    BedDouble,
    CalendarCheck,
    DoorClosed,
    LogIn,
    LogOut,
    Monitor,
    Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { index as frontdeskIndex } from '@/routes/frontdesk';
import { dashboard } from '@/routes';

interface DashboardProps {
    stats: {
        available_rooms: number;
        occupied_rooms: number;
        maintenance_rooms: number;
        booked_rooms: number;
        total_rooms: number;
        today_check_ins: number;
        today_check_outs: number;
        active_guests: number;
        pending_bookings: number;
    };
}

export default function ReceptionistDashboard({ stats }: DashboardProps) {
    const occupancyRate = stats.total_rooms > 0
        ? Math.round(((stats.occupied_rooms + stats.booked_rooms) / stats.total_rooms) * 100)
        : 0;

    const statCards = [
        {
            title: 'Room Occupancy',
            total: `${occupancyRate}%`,
            href: frontdeskIndex(),
            icon: BedDouble,
            color: 'text-indigo-600',
            bg: 'bg-indigo-100',
            breakdown: [
                { label: 'Available', value: stats.available_rooms, color: 'text-green-600' },
                { label: 'Occupied', value: stats.occupied_rooms, color: 'text-red-600' },
                { label: 'Booked', value: stats.booked_rooms, color: 'text-blue-600' },
                { label: 'Maintenance', value: stats.maintenance_rooms, color: 'text-yellow-600' },
            ],
        },
        {
            title: 'Today',
            total: stats.today_check_ins + stats.today_check_outs,
            href: frontdeskIndex(),
            icon: CalendarCheck,
            color: 'text-amber-600',
            bg: 'bg-amber-100',
            breakdown: [
                { label: 'Check-ins', value: stats.today_check_ins, color: 'text-green-600' },
                { label: 'Check-outs', value: stats.today_check_outs, color: 'text-orange-600' },
            ],
        },
        {
            title: 'Active Guests',
            total: stats.active_guests,
            href: frontdeskIndex(),
            icon: Users,
            color: 'text-emerald-600',
            bg: 'bg-emerald-100',
        },
        {
            title: 'Pending Bookings',
            total: stats.pending_bookings,
            href: frontdeskIndex(),
            icon: DoorClosed,
            color: 'text-blue-600',
            bg: 'bg-blue-100',
        },
    ];

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Reception Dashboard
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Daily operations overview
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
                                    <div className={`rounded-lg p-2 ${stat.bg}`}>
                                        <stat.icon className={`h-4 w-4 ${stat.color}`} />
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
                                                    <span className={`font-medium ${b.color}`}>
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
                    <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <Link
                            href={frontdeskIndex()}
                            className="flex items-center gap-3 rounded-lg border p-3 text-sm transition-colors hover:bg-muted"
                        >
                            <Monitor className="h-5 w-5 text-indigo-600" />
                            <span>Open Front Desk</span>
                        </Link>
                        <Link
                            href={frontdeskIndex()}
                            className="flex items-center gap-3 rounded-lg border p-3 text-sm transition-colors hover:bg-muted"
                        >
                            <LogOut className="h-5 w-5 text-orange-600" />
                            <span>Process Check-out</span>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

ReceptionistDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
