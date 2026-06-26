import { useMemo } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { store as bookingsStore } from '@/routes/bookings';
import { ArrowLeft, BedDouble, CalendarDays, LoaderCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import InputError from '@/components/input-error';
import BookingSteps from '@/components/booking-steps';
import { create as bookingsCreate, index as bookingsIndex } from '@/routes/bookings';
import { dashboard } from '@/routes';

interface Floor {
    id: number;
    name: string;
}

interface Category {
    id: number;
    name: string;
    base_price: string;
    capacity: number;
    amenities: string[] | null;
    image: string | null;
    floor: Floor | null;
}

interface Props {
    category: Category;
    check_in: string;
    check_out: string;
    notes: string | null;
}

export default function BookingsConfirm({ category, check_in, check_out, notes }: Props) {
    const { post, processing, errors } = useForm({
        room_category_id: category.id,
        check_in_date: check_in,
        check_out_date: check_out,
        notes: notes ?? '',
    });

    const totalPreview = useMemo(() => {
        const checkIn = new Date(check_in);
        const checkOut = new Date(check_out);
        const diffTime = checkOut.getTime() - checkIn.getTime();
        const nights = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        if (nights <= 0) return null;
        return {
            nights,
            total: nights * parseFloat(category.base_price),
        };
    }, [category.base_price, check_in, check_out]);

    const handleConfirm = (e: React.FormEvent) => {
        e.preventDefault();
        post(bookingsStore().url, {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Confirm Booking" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Link href={bookingsCreate()}>
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Confirm Booking</h1>
                        <p className="text-sm text-muted-foreground">
                            Review your reservation details before confirming
                        </p>
                    </div>
                </div>

                {/* Step Indicator */}
                <BookingSteps currentStep="confirm" categorySelected datesSelected />

                <form onSubmit={handleConfirm}>
                    <div className="grid gap-6 md:grid-cols-3">
                        {/* Category Preview */}
                        <div className="md:col-span-1">
                            <Card>
                                <CardHeader>
                                    <CardTitle>{category.name}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {category.image ? (
                                        <div className="overflow-hidden rounded-lg border bg-muted">
                                            <img
                                                src={'/storage/' + category.image}
                                                alt={category.name}
                                                className="h-48 w-full object-cover md:h-56"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex h-48 items-center justify-center rounded-lg border bg-muted text-muted-foreground/40 md:h-56">
                                            <BedDouble className="h-12 w-12" />
                                        </div>
                                    )}

                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Floor</span>
                                            <span>{category.floor?.name ?? '—'}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Capacity</span>
                                            <span className="flex items-center gap-1">
                                                <Users className="h-3.5 w-3.5" />
                                                {category.capacity} guests
                                            </span>
                                        </div>
                                        {category.amenities && category.amenities.length > 0 && (
                                            <div className="flex flex-wrap gap-1 pt-1">
                                                {category.amenities.map((amenity, i) => (
                                                    <Badge key={i} variant="secondary" className="text-xs">
                                                        {amenity}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Booking Details */}
                        <div className="md:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Reservation Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    {/* Dates */}
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="rounded-lg border bg-muted/30 p-4">
                                            <div className="text-xs text-muted-foreground">Check-in</div>
                                            <div className="mt-1 flex items-center gap-2 text-lg font-semibold">
                                                <CalendarDays className="h-5 w-5 text-primary" />
                                                {new Date(check_in).toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })}
                                            </div>
                                        </div>
                                        <div className="rounded-lg border bg-muted/30 p-4">
                                            <div className="text-xs text-muted-foreground">Check-out</div>
                                            <div className="mt-1 flex items-center gap-2 text-lg font-semibold">
                                                <CalendarDays className="h-5 w-5 text-primary" />
                                                {new Date(check_out).toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Room assignment note */}
                                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
                                        <p className="font-medium text-primary">Room assigned on confirmation</p>
                                        <p className="mt-1 text-muted-foreground">
                                            A random available room from the {category.name} category will be
                                            assigned to your reservation.
                                        </p>
                                    </div>

                                    {/* Price Summary */}
                                    {totalPreview && (
                                        <div className="rounded-lg border p-4">
                                            <h4 className="mb-3 text-sm font-medium">Price Summary</h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-muted-foreground">
                                                        ${parseFloat(category.base_price).toFixed(2)} x {totalPreview.nights} night{totalPreview.nights !== 1 ? 's' : ''}
                                                    </span>
                                                    <span>${totalPreview.total.toFixed(2)}</span>
                                                </div>
                                                <Separator />
                                                <div className="flex items-center justify-between font-semibold text-base">
                                                    <span>Total</span>
                                                    <span>${totalPreview.total.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Notes */}
                                    {notes && (
                                        <div>
                                            <div className="text-xs text-muted-foreground">Notes</div>
                                            <p className="mt-1 text-sm">{notes}</p>
                                        </div>
                                    )}

                                    <InputError message={errors.room_category_id} />

                                    <Button type="submit" disabled={processing} className="w-full" size="lg">
                                        {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                        Confirm Booking
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}

BookingsConfirm.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Bookings',
            href: bookingsIndex(),
        },
        {
            title: 'Confirm Booking',
            href: dashboard(),
        },
    ],
};
