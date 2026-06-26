import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { create as bookingsCreate, cancel as bookingsCancel } from '@/routes/bookings';
import { CalendarDays, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { dashboard } from '@/routes';

interface Room {
    id: number;
    number: string;
    floor: { id: number; name: string };
    category: { id: number; name: string; base_price: string };
}

interface Booking {
    id: number;
    notes: string | null;
    status: string;
    check_in_date: string;
    check_out_date: string;
    total_price: string;
    created_at: string;
    room: Room;
}

interface Props {
    bookings: Booking[];
}

const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
    pending: { variant: 'outline', label: 'Pending' },
    confirmed: { variant: 'default', label: 'Confirmed' },
    checked_in: { variant: 'secondary', label: 'Checked In' },
    checked_out: { variant: 'secondary', label: 'Checked Out' },
    cancelled: { variant: 'destructive', label: 'Cancelled' },
};

const cancellableStatuses = ['pending', 'confirmed'];

export default function BookingsIndex({ bookings }: Props) {
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [cancelling, setCancelling] = useState(false);

    const handleCancel = () => {
        if (!selectedBooking) return;

        setCancelling(true);

        router.post(
            bookingsCancel({ reservation: selectedBooking.id }).url,
            {},
            {
                onFinish: () => {
                    setCancelling(false);
                    setSelectedBooking(null);
                },
            },
        );
    };

    return (
        <>
            <Head title="My Bookings" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">My Bookings</h1>
                        <p className="text-sm text-muted-foreground">
                            View your booking history and manage reservations
                        </p>
                    </div>
                    <Link href={bookingsCreate()}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Reservation
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Booking History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {bookings.length > 0 ? (
                            <div className="space-y-3">
                                {bookings.map((booking) => {
                                    const status = statusConfig[booking.status] ?? { variant: 'outline' as const, label: booking.status };

                                    return (
                                        <button
                                            key={booking.id}
                                            type="button"
                                            onClick={() => setSelectedBooking(booking)}
                                            className="flex w-full items-start justify-between rounded-lg border p-4 text-left transition-colors hover:bg-muted/30"
                                        >
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold">
                                                        Room {booking.room.number}
                                                        <span className="ml-1.5 font-normal text-muted-foreground">
                                                            — {booking.room.category.name}
                                                        </span>
                                                    </span>
                                                    <Badge variant={status.variant}>
                                                        {status.label}
                                                    </Badge>
                                                </div>
                                                {booking.notes && (
                                                    <p className="text-sm text-muted-foreground">{booking.notes}</p>
                                                )}
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <CalendarDays className="h-3.5 w-3.5" />
                                                        {new Date(booking.check_in_date).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                        })}
                                                        {' — '}
                                                        {new Date(booking.check_out_date).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="shrink-0 text-right">
                                                <div className="text-sm font-semibold">
                                                    ₱{parseFloat(booking.total_price).toFixed(2)}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
                                <CalendarDays className="h-12 w-12 opacity-40" />
                                <p className="text-base">No bookings yet.</p>
                                <p className="text-sm">Click "Add Reservation" to book your first stay.</p>
                                <Link href={bookingsCreate()} className="mt-2">
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Reservation
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Booking Detail Modal */}
            <Dialog open={!!selectedBooking} onOpenChange={(open) => { if (!open) { setSelectedBooking(null); } }}>
                <DialogContent className="sm:max-w-lg">
                    {selectedBooking && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    Room {selectedBooking.room.number}
                                    <Badge variant={statusConfig[selectedBooking.status]?.variant ?? 'outline'}>
                                        {statusConfig[selectedBooking.status]?.label ?? selectedBooking.status}
                                    </Badge>
                                </DialogTitle>
                                <DialogDescription>
                                    {selectedBooking.room.category.name}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                                {/* Room Info */}
                                <div className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/30 p-3 text-sm">
                                    <div>
                                        <span className="text-xs text-muted-foreground">Room Number</span>
                                        <p className="font-medium">{selectedBooking.room.number}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-muted-foreground">Floor</span>
                                        <p className="font-medium">{selectedBooking.room.floor.name}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-muted-foreground">Category</span>
                                        <p className="font-medium">{selectedBooking.room.category.name}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-muted-foreground">Category Rate</span>
                                        <p className="font-medium">₱{parseFloat(selectedBooking.room.category.base_price).toFixed(2)}/night</p>
                                    </div>
                                </div>

                                {/* Dates */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-lg border p-3">
                                        <div className="text-xs text-muted-foreground">Check-in</div>
                                        <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold">
                                            <CalendarDays className="h-4 w-4 text-primary" />
                                            {new Date(selectedBooking.check_in_date).toLocaleDateString('en-US', {
                                                weekday: 'short',
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </div>
                                    </div>
                                    <div className="rounded-lg border p-3">
                                        <div className="text-xs text-muted-foreground">Check-out</div>
                                        <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold">
                                            <CalendarDays className="h-4 w-4 text-primary" />
                                            {new Date(selectedBooking.check_out_date).toLocaleDateString('en-US', {
                                                weekday: 'short',
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Notes */}
                                {selectedBooking.notes && (
                                    <div>
                                        <div className="text-xs text-muted-foreground">Notes</div>
                                        <p className="mt-0.5 text-sm">{selectedBooking.notes}</p>
                                    </div>
                                )}

                                {/* Price */}
                                <Separator />
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Total Price</span>
                                    <span className="text-lg font-bold">
                                        ₱{parseFloat(selectedBooking.total_price).toFixed(2)}
                                    </span>
                                </div>

                                {/* Booked on */}
                                <div className="text-xs text-muted-foreground">
                                    Booked on {new Date(selectedBooking.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </div>
                            </div>

                            <DialogFooter className="gap-2 sm:gap-0">
                                <Button variant="outline" onClick={() => setSelectedBooking(null)}>
                                    Close
                                </Button>
                                {cancellableStatuses.includes(selectedBooking.status) && (
                                    <Button
                                        variant="destructive"
                                        disabled={cancelling}
                                        onClick={handleCancel}
                                    >
                                        {cancelling ? 'Cancelling...' : 'Cancel Booking'}
                                    </Button>
                                )}
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

BookingsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Bookings',
            href: bookingsIndex(),
        },
    ],
};
