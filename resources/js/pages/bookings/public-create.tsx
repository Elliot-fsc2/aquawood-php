import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { confirm as bookingsConfirm, checkAvailability } from '@/routes/bookings';
import { login, register } from '@/routes';
import { ArrowLeft, BedDouble, CheckCircle2, LoaderCircle, TriangleAlert, Users, XCircle, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import InputError from '@/components/input-error';
import BookingSteps from '@/components/booking-steps';
import { home } from '@/routes';

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
    available_rooms_count: number;
    floor: Floor | null;
}

interface Props {
    categories: Category[];
}

export default function BookingsPublicCreate({ categories }: Props) {
    const { auth } = usePage().props;
    const isAuthenticated = !!auth?.user;
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
    const [availabilityResult, setAvailabilityResult] = useState<{
        available: boolean;
        available_rooms: number;
    } | null>(null);
    const availabilityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const datePanelRef = useRef<HTMLDivElement | null>(null);

    const { data, setData, get, processing, errors } = useForm({
        check_in_date: '',
        check_out_date: '',
        notes: '',
        dates: '',
    });

    const [guestCount, setGuestCount] = useState({ adults: 1, children: 0 });

    const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

    useEffect(() => {
        setAvailabilityResult(null);
    }, [selectedCategoryId]);

    const checkDateAvailability = useCallback(
        async (categoryId: number, checkIn: string, checkOut: string) => {
            if (!checkIn || !checkOut) return;
            if (new Date(checkIn) >= new Date(checkOut)) return;

            try {
                const url = checkAvailability({ category: categoryId }).url;
                const params = new URLSearchParams({ check_in: checkIn, check_out: checkOut });
                const response = await fetch(`${url}?${params}`, {
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });
                const result = await response.json();
                setAvailabilityResult(result);
            } catch {
                setAvailabilityResult(null);
            } finally {
                setIsCheckingAvailability(false);
            }
        },
        [],
    );

    const handleDateChange = useCallback(
        (field: 'check_in_date' | 'check_out_date', value: string) => {
            if (field === 'check_in_date') {
                setData('check_out_date', '');
            }

            setData(field, value);

            setAvailabilityResult(null);
            setIsCheckingAvailability(true);

            if (availabilityTimer.current) {
                clearTimeout(availabilityTimer.current);
            }

            availabilityTimer.current = setTimeout(() => {
                const checkIn = field === 'check_in_date' ? value : data.check_in_date;
                const checkOut = field === 'check_out_date' ? value : data.check_out_date;

                if (selectedCategoryId && checkIn && checkOut && new Date(checkIn) < new Date(checkOut)) {
                    checkDateAvailability(selectedCategoryId, checkIn, checkOut);
                } else {
                    setIsCheckingAvailability(false);
                }
            }, 500);
        },
        [selectedCategoryId, data.check_in_date, data.check_out_date, setData, checkDateAvailability],
    );

    useEffect(() => {
        return () => {
            if (availabilityTimer.current) {
                clearTimeout(availabilityTimer.current);
            }
        };
    }, []);

    const totalPreview = useMemo(() => {
        if (!selectedCategory || !data.check_in_date || !data.check_out_date) return null;
        const checkIn = new Date(data.check_in_date);
        const checkOut = new Date(data.check_out_date);
        const diffTime = checkOut.getTime() - checkIn.getTime();
        const nights = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        if (nights <= 0) return null;
        return {
            nights,
            total: nights * parseFloat(selectedCategory.base_price),
        };
    }, [selectedCategory, data.check_in_date, data.check_out_date]);

    const areDatesValid = !!(
        data.check_in_date &&
        data.check_out_date &&
        new Date(data.check_in_date) < new Date(data.check_out_date)
    );

    const canContinue =
        selectedCategoryId &&
        areDatesValid &&
        availabilityResult?.available === true;

    const handleContinue = () => {
        if (!canContinue) return;

        if (!isAuthenticated) {
            const confirmUrl = bookingsConfirm({
                query: {
                    category_id: String(selectedCategoryId),
                    check_in: data.check_in_date,
                    check_out: data.check_out_date,
                    notes: data.notes,
                    adults: String(guestCount.adults),
                    children: String(guestCount.children),
                },
            }).url;

            router.visit(login({ query: { redirectTo: confirmUrl } }).url);

            return;
        }

        get(
            bookingsConfirm({
                query: {
                    category_id: String(selectedCategoryId),
                    check_in: data.check_in_date,
                    check_out: data.check_out_date,
                    notes: data.notes,
                    adults: String(guestCount.adults),
                    children: String(guestCount.children),
                },
            }).url,
        );
    };

    const handleCategoryClick = (categoryId: number) => {
        setSelectedCategoryId(categoryId);

        if (data.check_in_date && data.check_out_date && new Date(data.check_in_date) < new Date(data.check_out_date)) {
            setAvailabilityResult(null);
            setIsCheckingAvailability(true);
            checkDateAvailability(categoryId, data.check_in_date, data.check_out_date);
        }

        setTimeout(() => {
            datePanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    return (
        <>
            <Head title="Browse Rooms" />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 flex items-center gap-4">
                    <Link href={home()}>
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Browse Rooms</h1>
                        <p className="text-sm text-muted-foreground">
                            Select a room category and your preferred dates
                        </p>
                    </div>
                </div>

                {/* Step Indicator */}
                <BookingSteps
                    currentStep={selectedCategoryId ? 'dates' : 'category'}
                    categorySelected={!!selectedCategoryId}
                    datesSelected={areDatesValid && availabilityResult?.available === true}
                />

                {/* Category Grid */}
                <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {categories.map((cat) => {
                        const isSelected = selectedCategoryId === cat.id;

                        return (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => handleCategoryClick(cat.id)}
                                className={`group relative overflow-hidden rounded-xl border text-left transition-all ${
                                    isSelected
                                        ? 'border-primary ring-2 ring-primary/30 shadow-md'
                                        : 'border-border hover:border-primary/50 hover:shadow-sm'
                                }`}
                            >
                                <div className="aspect-[4/3] overflow-hidden bg-muted">
                                    {cat.image ? (
                                        <img
                                            src={'/storage/' + cat.image}
                                            alt={cat.name}
                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-muted-foreground/40">
                                            <BedDouble className="h-10 w-10" />
                                        </div>
                                    )}
                                </div>

                                <div className="absolute right-2 top-2">
                                    <Badge
                                        variant={cat.available_rooms_count > 0 ? 'default' : 'destructive'}
                                        className="text-xs shadow-sm"
                                    >
                                        {cat.available_rooms_count > 0
                                            ? `${cat.available_rooms_count} available`
                                            : 'Sold out'}
                                    </Badge>
                                </div>

                                <div className="space-y-1.5 p-3">
                                    <h3 className="font-semibold leading-tight">{cat.name}</h3>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Users className="h-3 w-3" />
                                            {cat.capacity}
                                        </span>
                                        <span>{cat.floor?.name ?? ''}</span>
                                    </div>
                                    <div className="flex items-center justify-between pt-1">
                                        <span className="text-lg font-bold">
                                            ₱{parseFloat(cat.base_price).toFixed(2)}
                                        </span>
                                        <span className="text-xs text-muted-foreground">/night</span>
                                    </div>
                                    {Array.isArray(cat.amenities) && cat.amenities.length > 0 && (
                                        <div className="flex flex-wrap gap-1 pt-1">
                                            {cat.amenities.slice(0, 3).map((amenity, i) => (
                                                <Badge key={i} variant="secondary" className="text-[10px]">
                                                    {amenity}
                                                </Badge>
                                            ))}
                                            {cat.amenities.length > 3 && (
                                                <span className="text-[10px] text-muted-foreground">
                                                    +{cat.amenities.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}

                    {categories.length === 0 && (
                        <div className="col-span-full flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
                            <BedDouble className="h-12 w-12 opacity-40" />
                            <p>No room categories available at this time.</p>
                        </div>
                    )}
                </div>

                {/* Date Selection Panel */}
                {selectedCategory && (
                    <div ref={datePanelRef} className="mt-8 rounded-xl border bg-card p-5">
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Left: Selected category summary */}
                            <div className="space-y-3">
                                <h3 className="font-semibold">
                                    {selectedCategory.name}
                                </h3>
                                {selectedCategory.image && (
                                    <div className="h-32 w-full overflow-hidden rounded-lg border bg-muted md:h-40">
                                        <img
                                            src={'/storage/' + selectedCategory.image}
                                            alt={selectedCategory.name}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                )}
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Price per night</span>
                                    <span className="font-semibold">
                                        ₱{parseFloat(selectedCategory.base_price).toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Capacity</span>
                                    <span>{selectedCategory.capacity} guests</span>
                                </div>
                            </div>

                            {/* Right: Dates + Guests + Notes */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="check_in_date">Check-in</Label>
                                        <Input
                                            id="check_in_date"
                                            type="date"
                                            value={data.check_in_date}
                                            onChange={(e) => handleDateChange('check_in_date', e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                        <InputError message={errors.check_in_date} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="check_out_date">Check-out</Label>
                                        <Input
                                            id="check_out_date"
                                            type="date"
                                            value={data.check_out_date}
                                            onChange={(e) => handleDateChange('check_out_date', e.target.value)}
                                            min={data.check_in_date || new Date().toISOString().split('T')[0]}
                                        />
                                        <InputError message={errors.check_out_date} />
                                    </div>

                                    {/* Availability Indicator */}
                                    {selectedCategoryId && areDatesValid && (
                                        <div className="min-h-[2rem] col-span-2">
                                            {isCheckingAvailability ? (
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                                    Checking availability...
                                                </div>
                                            ) : availabilityResult ? (
                                                availabilityResult.available ? (
                                                    <Alert className="border-accent-foreground/20 bg-accent py-3">
                                                        <CheckCircle2 className="h-4 w-4 text-accent-foreground" />
                                                        <AlertTitle className="text-sm font-medium text-accent-foreground">
                                                            Available
                                                        </AlertTitle>
                                                        <AlertDescription className="text-xs text-accent-foreground/80">
                                                            {availabilityResult.available_rooms} room{availabilityResult.available_rooms !== 1 ? 's' : ''} available for these dates
                                                        </AlertDescription>
                                                    </Alert>
                                                ) : (
                                                    <Alert className="border-destructive/50 bg-destructive/10 py-3">
                                                        <XCircle className="h-4 w-4 text-destructive" />
                                                        <AlertTitle className="text-sm font-medium text-destructive">
                                                            Not Available
                                                        </AlertTitle>
                                                        <AlertDescription className="text-xs text-destructive/85">
                                                            No rooms are available for the selected dates. Try different dates or another category.
                                                        </AlertDescription>
                                                    </Alert>
                                                )
                                            ) : (
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <TriangleAlert className="h-4 w-4" />
                                                    Select dates to check availability
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Guest Count */}
                                <div className="space-y-3">
                                    <Label>Guests</Label>
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm">Adults</span>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => setGuestCount((g) => ({ ...g, adults: Math.max(1, g.adults - 1) }))}
                                                    disabled={guestCount.adults <= 1}
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <span className="w-6 text-center text-sm font-medium">{guestCount.adults}</span>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => setGuestCount((g) => ({ ...g, adults: Math.min(g.adults + 1, selectedCategory?.capacity ?? 10) }))}
                                                    disabled={guestCount.adults >= (selectedCategory?.capacity ?? 10)}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm">Children</span>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => setGuestCount((g) => ({ ...g, children: Math.max(0, g.children - 1) }))}
                                                    disabled={guestCount.children <= 0}
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <span className="w-6 text-center text-sm font-medium">{guestCount.children}</span>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => setGuestCount((g) => ({ ...g, children: Math.min(g.children + 1, 10) }))}
                                                    disabled={guestCount.children >= 10}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        placeholder="Any special requests..."
                                        rows={3}
                                    />
                                </div>

                                {/* Price Preview */}
                                {totalPreview && (
                                    <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">
                                                {totalPreview.nights} night{totalPreview.nights !== 1 ? 's' : ''}
                                            </span>
                                            <span>₱{totalPreview.total.toFixed(2)}</span>
                                        </div>
                                        <Separator className="my-2" />
                                        <div className="flex items-center justify-between font-semibold">
                                            <span>Total</span>
                                            <span>₱{totalPreview.total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                )}

                                {errors.dates && (
                                    <p className="text-sm text-destructive">{errors.dates}</p>
                                )}

                                <Button
                                    type="button"
                                    onClick={handleContinue}
                                    disabled={!canContinue || processing}
                                    className="w-full"
                                >
                                    {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                    {isAuthenticated ? 'Continue to Confirmation' : 'Proceed to Booking'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
