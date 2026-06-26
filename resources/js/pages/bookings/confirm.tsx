import { useMemo, useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { store as bookingsStore, index as bookingsIndex } from '@/routes/bookings';
import { create as bookingsCreate } from '@/routes/bookings';
import { dashboard } from '@/routes';
import { ArrowLeft, BedDouble, CalendarDays, CheckCircle2, LoaderCircle, Mail, Phone, User, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import InputError from '@/components/input-error';
import BookingSteps from '@/components/booking-steps';

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

interface Pricing {
    nights: number;
    base_rate: number;
    subtotal: number;
    tax_rate: number;
    tax: number;
    grand_total: number;
}

interface GuestInfo {
    name: string;
    email: string;
    phone: string | null;
}

interface Props {
    category: Category;
    check_in: string;
    check_out: string;
    notes: string | null;
    adults: number;
    children: number;
    pricing: Pricing;
    guest: GuestInfo;
}

export default function BookingsConfirm({ category, check_in, check_out, notes, adults, children, pricing, guest }: Props) {
    const [showSuccess, setShowSuccess] = useState(false);

    const { post, processing, errors } = useForm({
        room_category_id: category.id,
        check_in_date: check_in,
        check_out_date: check_out,
        notes: notes ?? '',
    });

    const handleConfirm = (e: React.FormEvent) => {
        e.preventDefault();
        post(bookingsStore().url, {
            preserveScroll: true,
            onSuccess: () => {
                setShowSuccess(true);
            },
        });
    };

    const handleViewBookings = () => {
        router.visit(bookingsIndex().url);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const totalGuests = adults + children;

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
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Left Column: Category + Guest Info */}
                        <div className="space-y-6 lg:col-span-1">
                            {/* Category Card */}
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
                                                className="h-48 w-full object-cover md:h-48"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex h-48 items-center justify-center rounded-lg border bg-muted text-muted-foreground/40">
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
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Guests</span>
                                            <span>{totalGuests} ({adults} Adult{adults !== 1 ? 's' : ''}{children > 0 ? `, ${children} Child${children !== 1 ? 'ren' : ''}` : ''})</span>
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

                            {/* Guest Information Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Guest Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            <User className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted-foreground">Name</div>
                                            <div className="font-medium">{guest.name}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            <Mail className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted-foreground">Email</div>
                                            <div className="font-medium">{guest.email}</div>
                                        </div>
                                    </div>
                                    {guest.phone && (
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                <Phone className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <div className="text-xs text-muted-foreground">Phone</div>
                                                <div className="font-medium">{guest.phone}</div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column: Dates + Pricing */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Dates */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Reservation Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="rounded-lg border bg-muted/30 p-4">
                                            <div className="text-xs text-muted-foreground">Check-in</div>
                                            <div className="mt-1 flex items-center gap-2 text-lg font-semibold">
                                                <CalendarDays className="h-5 w-5 text-primary" />
                                                {formatDate(check_in)}
                                            </div>
                                        </div>
                                        <div className="rounded-lg border bg-muted/30 p-4">
                                            <div className="text-xs text-muted-foreground">Check-out</div>
                                            <div className="mt-1 flex items-center gap-2 text-lg font-semibold">
                                                <CalendarDays className="h-5 w-5 text-primary" />
                                                {formatDate(check_out)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
                                        <p className="font-medium text-primary">Room assigned on confirmation</p>
                                        <p className="mt-1 text-muted-foreground">
                                            A random available room from the {category.name} category will be
                                            assigned to your reservation.
                                        </p>
                                    </div>

                                    {/* Price Breakdown */}
                                    <div className="rounded-lg border p-4">
                                        <h4 className="mb-3 text-sm font-medium">Price Breakdown</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">
                                                    ₱{pricing.base_rate.toFixed(2)} x {pricing.nights} night{pricing.nights !== 1 ? 's' : ''}
                                                </span>
                                                <span>₱{pricing.subtotal.toFixed(2)}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">
                                                    VAT ({(pricing.tax_rate * 100).toFixed(0)}%)
                                                </span>
                                                <span>₱{pricing.tax.toFixed(2)}</span>
                                            </div>
                                            <Separator />
                                            <div className="flex items-center justify-between font-semibold text-base">
                                                <span>Grand Total</span>
                                                <span className="text-lg text-primary">₱{pricing.grand_total.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>

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
                                        Confirm & Book
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>

            {/* Success Dialog */}
            <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                            <CheckCircle2 className="h-8 w-8 text-green-600" />
                        </div>
                        <DialogTitle className="text-center text-xl">Booking Successful!</DialogTitle>
                        <DialogDescription className="text-center">
                            Your reservation has been created successfully. You'll receive a confirmation
                            email with your booking details.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Category</span>
                                <span className="font-medium">{category.name}</span>
                            </div>
                            <div className="mt-1 flex items-center justify-between">
                                <span className="text-muted-foreground">Check-in</span>
                                <span className="font-medium">{formatDate(check_in)}</span>
                            </div>
                            <div className="mt-1 flex items-center justify-between">
                                <span className="text-muted-foreground">Check-out</span>
                                <span className="font-medium">{formatDate(check_out)}</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex items-center justify-between font-semibold">
                                <span>Total Paid</span>
                                <span className="text-primary">₱{pricing.grand_total.toFixed(2)}</span>
                            </div>
                        </div>
                        <Button onClick={handleViewBookings} className="w-full">
                            View My Bookings
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
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
        },
    ],
};
