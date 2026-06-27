import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    BookOpen,
    CalendarDays,
    CheckCircle2,
    Clock,
    Eye,
    XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { index as adminBookingsIndex, updateStatus as adminUpdateStatus } from '@/routes/admin/bookings';
import { dashboard } from '@/routes';
import type { User } from '@/types/auth';

interface Floor {
    id: number;
    name: string;
}

interface Category {
    id: number;
    name: string;
}

interface Room {
    id: number;
    number: string;
    base_rate: string;
    floor: Floor | null;
    category: Category | null;
}

interface Booking {
    id: number;
    guest: User;
    room: Room;
    check_in_date: string;
    check_out_date: string;
    total_price: string;
    status: string;
    notes: string | null;
    created_at: string;
}

interface Stats {
    total: number;
    pending: number;
    confirmed: number;
    checked_in: number;
    checked_out: number;
    cancelled: number;
}

interface Props {
    bookings: Booking[];
    stats: Stats;
    selectedStatus: string | null;
}

const statusConfig: Record<
    string,
    { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
    pending: { label: 'Pending', variant: 'secondary' },
    confirmed: { label: 'Confirmed', variant: 'default' },
    checked_in: { label: 'Checked In', variant: 'default' },
    checked_out: { label: 'Checked Out', variant: 'outline' },
    cancelled: { label: 'Cancelled', variant: 'destructive' },
};

const statusTransitions: Record<string, string[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['checked_in', 'cancelled'],
    checked_in: ['checked_out'],
    checked_out: [],
    cancelled: [],
};

export default function AdminBookingsIndex({ bookings, stats, selectedStatus }: Props) {
    const [detailModal, setDetailModal] = useState<{
        open: boolean;
        booking: Booking | null;
    }>({ open: false, booking: null });
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const handleStatusFilter = (status: string) => {
        if (status === 'all') {
            router.get(adminBookingsIndex().url);
        } else {
            router.get(adminBookingsIndex().url + '?status=' + status);
        }
    };

    const handleViewDetails = (booking: Booking) => {
        setDetailModal({ open: true, booking });
    };

    const handleStatusChange = (newStatus: string) => {
        if (!detailModal.booking) return;

        const oldStatus = detailModal.booking.status;

        setUpdatingStatus(true);

        router.patch(
            adminUpdateStatus({ reservation: detailModal.booking.id }).url,
            { status: newStatus },
            {
                preserveScroll: true,
                optimistic: (props) => ({
                    bookings: props.bookings.map((b: Booking) =>
                        b.id === detailModal.booking!.id ? { ...b, status: newStatus } : b,
                    ),
                    stats: {
                        ...props.stats,
                        [oldStatus]: Math.max(0, (props.stats as Record<string, number>)[oldStatus] - 1),
                        [newStatus]: ((props.stats as Record<string, number>)[newStatus] ?? 0) + 1,
                    },
                }),
                onFinish: () => {
                    setUpdatingStatus(false);
                    setDetailModal((prev) => ({ ...prev, open: false, booking: null }));
                },
            },
        );
    };

    const statCards = [
        { label: 'Total Reservations', value: stats.total, icon: BookOpen, color: 'text-primary' },
        { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-600 dark:text-amber-400' },
        { label: 'Confirmed', value: stats.confirmed, icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400' },
        { label: 'Checked In', value: stats.checked_in, icon: CalendarDays, color: 'text-blue-600 dark:text-blue-400' },
        { label: 'Checked Out', value: stats.checked_out, icon: CalendarDays, color: 'text-muted-foreground' },
        { label: 'Cancelled', value: stats.cancelled, icon: XCircle, color: 'text-destructive' },
    ];

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });

    const formatTime = (dateStr: string) =>
        new Date(dateStr).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });

    return (
        <>
            <Head title="Reservations" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Reservations</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage all guest reservations
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    {statCards.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <Card key={stat.label}>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        {stat.label}
                                    </CardTitle>
                                    <Icon className={`h-4 w-4 ${stat.color}`} />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Bookings Table */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>All Reservations</CardTitle>
                            <div className="w-48">
                                <Select
                                    value={selectedStatus ?? 'all'}
                                    onValueChange={handleStatusFilter}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                        <SelectItem value="checked_in">Checked In</SelectItem>
                                        <SelectItem value="checked_out">Checked Out</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="hidden md:block rounded-md border">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="py-3 px-4 text-left font-medium">Guest</th>
                                        <th className="py-3 px-4 text-left font-medium">Room</th>
                                        <th className="py-3 px-4 text-left font-medium">Check-in</th>
                                        <th className="py-3 px-4 text-left font-medium">Check-out</th>
                                        <th className="py-3 px-4 text-center font-medium">Status</th>
                                        <th className="py-3 px-4 text-right font-medium">Total</th>
                                        <th className="py-3 px-4 text-center font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map((booking) => {
                                        const config = statusConfig[booking.status] ?? {
                                            label: booking.status,
                                            variant: 'outline' as const,
                                        };

                                        return (
                                            <tr
                                                key={booking.id}
                                                className="border-b last:border-0 hover:bg-muted/30"
                                            >
                                                <td className="py-3 px-4">
                                                    <div className="font-medium">
                                                        {booking.guest.name}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {booking.guest.email}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="font-medium">
                                                        Room {booking.room?.number ?? '—'}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {booking.room?.category?.name ?? ''}
                                                        {booking.room?.floor?.name
                                                            ? ` · ${booking.room.floor.name}`
                                                            : ''}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    {formatDate(booking.check_in_date)}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {formatDate(booking.check_out_date)}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <Badge
                                                        variant={config.variant}
                                                        className="text-xs"
                                                    >
                                                        {config.label}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-4 text-right font-mono font-medium">
                                                    ₱{parseFloat(booking.total_price).toFixed(2)}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 text-xs"
                                                        onClick={() => handleViewDetails(booking)}
                                                    >
                                                        <Eye className="mr-1 h-3.5 w-3.5" />
                                                        View
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {bookings.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="py-8 text-center text-muted-foreground"
                                            >
                                                No reservations found.
                                                {!selectedStatus &&
                                                    ' Create a booking to get started.'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {bookings.length > 0 && (
                            <div className="md:hidden space-y-3">
                                {bookings.map((booking) => {
                                    const config = statusConfig[booking.status] ?? { label: booking.status, variant: 'outline' as const };
                                    return (
                                        <div key={booking.id} className="rounded-lg border p-4 space-y-3">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="font-semibold">{booking.guest.name}</div>
                                                    <div className="text-xs text-muted-foreground">{booking.guest.email}</div>
                                                </div>
                                                <Badge variant={config.variant} className="text-xs">{config.label}</Badge>
                                            </div>
                                            <div className="text-sm">
                                                <span className="text-muted-foreground">Room {booking.room?.number ?? '—'}</span>
                                                {booking.room?.category?.name && <span> · {booking.room.category.name}</span>}
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Check-in</span>
                                                <span>{formatDate(booking.check_in_date)}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Check-out</span>
                                                <span>{formatDate(booking.check_out_date)}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Total</span>
                                                <span className="font-mono font-semibold">₱{parseFloat(booking.total_price).toFixed(2)}</span>
                                            </div>
                                            <Button variant="outline" size="sm" className="w-full" onClick={() => handleViewDetails(booking)}>
                                                <Eye className="mr-1 h-3.5 w-3.5" /> View Details
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        {bookings.length === 0 && (
                            <div className="md:hidden py-8 text-center text-muted-foreground">
                                No reservations found.
                                {!selectedStatus && ' Create a booking to get started.'}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Detail Modal */}
            <Dialog
                open={detailModal.open}
                onOpenChange={(open) =>
                    setDetailModal((prev) => ({ ...prev, open, booking: open ? prev.booking : null }))
                }
            >
                <DialogContent className="sm:max-w-2xl">
                    {detailModal.booking && (
                        <>
                            <DialogHeader>
                                <div className="flex items-center justify-between">
                                    <DialogTitle>
                                        Reservation #{detailModal.booking.id}
                                    </DialogTitle>
                                    <Badge
                                        variant={
                                            statusConfig[detailModal.booking.status]?.variant ?? 'outline'
                                        }
                                        className="text-xs"
                                    >
                                        {statusConfig[detailModal.booking.status]?.label ??
                                            detailModal.booking.status}
                                    </Badge>
                                </div>
                                <DialogDescription>
                                    Booked on{' '}
                                    {formatDate(detailModal.booking.created_at)} at{' '}
                                    {formatTime(detailModal.booking.created_at)}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-6 sm:grid-cols-2">
                                {/* Guest Info */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-muted-foreground">
                                        Guest Information
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Name</span>
                                            <span className="font-medium">
                                                {detailModal.booking.guest.name}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Email</span>
                                            <span className="font-medium">
                                                {detailModal.booking.guest.email}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Room Info */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-muted-foreground">
                                        Room Information
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Room</span>
                                            <span className="font-medium">
                                                {detailModal.booking.room?.number ?? '—'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Category</span>
                                            <span className="font-medium">
                                                {detailModal.booking.room?.category?.name ?? '—'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Floor</span>
                                            <span className="font-medium">
                                                {detailModal.booking.room?.floor?.name ?? '—'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Rate</span>
                                            <span className="font-medium">
                                                ₱{parseFloat(detailModal.booking.room?.base_rate ?? '0').toFixed(2)}{' '}
                                                /night
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Date & Pricing */}
                            <div className="grid gap-6 sm:grid-cols-2">
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-muted-foreground">
                                        Dates
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Check-in</span>
                                            <span className="font-medium">
                                                {formatDate(detailModal.booking.check_in_date)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Check-out</span>
                                            <span className="font-medium">
                                                {formatDate(detailModal.booking.check_out_date)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-muted-foreground">
                                        Pricing
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Total</span>
                                            <span className="font-mono font-semibold text-base">
                                                ₱{parseFloat(detailModal.booking.total_price).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            {detailModal.booking.notes && (
                                <>
                                    <Separator />
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-semibold text-muted-foreground">
                                            Notes
                                        </h4>
                                        <p className="text-sm">{detailModal.booking.notes}</p>
                                    </div>
                                </>
                            )}

                            <Separator />

                            {/* Status Management */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-muted-foreground">
                                    Update Status
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {statusTransitions[detailModal.booking.status]?.length > 0 ? (
                                        statusTransitions[detailModal.booking.status].map(
                                            (nextStatus) => {
                                                const isCancelling = nextStatus === 'cancelled';
                                                return (
                                                    <Button
                                                        key={nextStatus}
                                                        variant={
                                                            isCancelling ? 'destructive' : 'default'
                                                        }
                                                        size="sm"
                                                        onClick={() =>
                                                            handleStatusChange(nextStatus)
                                                        }
                                                        disabled={updatingStatus}
                                                    >
                                                        {statusConfig[nextStatus]?.label ??
                                                            nextStatus}
                                                    </Button>
                                                );
                                            },
                                        )
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            This reservation has reached its final state and cannot
                                            be updated further.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

AdminBookingsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Reservations',
            href: adminBookingsIndex(),
        },
    ],
};
