import { Head, Link } from '@inertiajs/react';
import { BookOpen, CalendarDays, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { create as bookingsCreate, index as bookingsIndex } from '@/routes/bookings';
import { dashboard } from '@/routes';

interface Booking {
    id: number;
    status: string;
    check_in_date: string;
    check_out_date: string;
    total_price: string;
    created_at: string;
    room: {
        number: string;
        category: { name: string };
    };
}

interface DashboardProps {
    stats: {
        total: number;
        upcoming: number;
        completed: number;
        cancelled: number;
    };
    recentBookings: Booking[];
}

const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
    pending: { variant: 'outline', label: 'Pending' },
    confirmed: { variant: 'default', label: 'Confirmed' },
    checked_in: { variant: 'secondary', label: 'Checked In' },
    checked_out: { variant: 'secondary', label: 'Checked Out' },
    cancelled: { variant: 'destructive', label: 'Cancelled' },
};

export default function GuestDashboard({ stats, recentBookings }: DashboardProps) {
    const statCards = [
        { title: 'Total Bookings', value: stats.total, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-100' },
        { title: 'Upcoming', value: stats.upcoming, icon: CalendarDays, color: 'text-green-600', bg: 'bg-green-100' },
        { title: 'Completed', value: stats.completed, icon: BookOpen, color: 'text-gray-600', bg: 'bg-gray-100' },
        { title: 'Cancelled', value: stats.cancelled, icon: BookOpen, color: 'text-red-600', bg: 'bg-red-100' },
    ];

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">My Dashboard</h1>
                        <p className="text-sm text-muted-foreground">
                            Welcome back! Here's your booking overview.
                        </p>
                    </div>
                    <Link href={bookingsCreate()}>
                        <Badge variant="default" className="flex cursor-pointer items-center gap-1 px-4 py-2 text-sm">
                            <Plus className="h-4 w-4" />
                            New Booking
                        </Badge>
                    </Link>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((stat) => (
                        <Link key={stat.title} href={bookingsIndex()}>
                            <Card className="transition-shadow hover:shadow-md">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                                    <div className={`rounded-lg p-2 ${stat.bg}`}>
                                        <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Recent Bookings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentBookings.length > 0 ? (
                            <div className="space-y-3">
                                {recentBookings.map((booking) => (
                                    <Link
                                        key={booking.id}
                                        href={bookingsIndex()}
                                        className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="space-y-0.5">
                                                <p className="text-sm font-medium">
                                                    {booking.room.category.name} - Room {booking.room.number}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(booking.check_in_date).toLocaleDateString()} - {new Date(booking.check_out_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant={statusConfig[booking.status]?.variant ?? 'outline'}>
                                            {statusConfig[booking.status]?.label ?? booking.status}
                                        </Badge>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
                                <CalendarDays className="h-8 w-8 opacity-40" />
                                <p className="text-sm">No bookings yet.</p>
                                <Link href={bookingsCreate()} className="text-sm font-medium text-primary hover:underline">
                                    Make your first booking
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

GuestDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
