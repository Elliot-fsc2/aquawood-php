import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Search, SlidersHorizontal, UserRound, UserRoundX, UserRoundCheck, Mail, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    index as adminGuestsIndex,
    suspend as adminGuestsSuspend,
    reinstate as adminGuestsReinstate,
} from '@/routes/admin/guests';
import { dashboard } from '@/routes';

interface GuestProfile {
    id: number;
    phone: string | null;
    country: string | null;
    loyalty_tier: string;
    points: number;
    total_stays: number;
    total_spent: string;
    last_stay: string | null;
}

interface GuestUser {
    id: number;
    name: string;
    email: string;
    is_suspended: boolean;
    suspended_at: string | null;
    guest: GuestProfile | null;
    reservations_count: number;
    total_spent: string;
    created_at: string;
}

interface Props {
    guests: GuestUser[];
    filters: {
        search?: string;
        status?: string;
    };
}

export default function AdminGuestsIndex({ guests, filters }: Props) {
    const [searchValue, setSearchValue] = useState(filters.search ?? '');
    const [statusFilter, setStatusFilter] = useState(filters.status ?? 'all');

    const [actionDialog, setActionDialog] = useState<{
        open: boolean;
        type: 'suspend' | 'reinstate';
        guest: GuestUser | null;
        processing: boolean;
    }>({ open: false, type: 'suspend', guest: null, processing: false });

    const handleSearch = (value: string) => {
        setSearchValue(value);
        const params = new URLSearchParams();
        if (value) params.set('search', value);
        if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
        router.get(adminGuestsIndex().url + (params.toString() ? '?' + params.toString() : ''));
    };

    const handleStatusFilter = (value: string) => {
        setStatusFilter(value);
        const params = new URLSearchParams();
        if (searchValue) params.set('search', searchValue);
        if (value && value !== 'all') params.set('status', value);
        router.get(adminGuestsIndex().url + (params.toString() ? '?' + params.toString() : ''));
    };

    const promptSuspend = (guest: GuestUser) => {
        setActionDialog({ open: true, type: 'suspend', guest, processing: false });
    };

    const promptReinstate = (guest: GuestUser) => {
        setActionDialog({ open: true, type: 'reinstate', guest, processing: false });
    };

    const confirmAction = () => {
        if (!actionDialog.guest) return;
        const guestId = actionDialog.guest.id;
        const isSuspend = actionDialog.type === 'suspend';
        setActionDialog((prev) => ({ ...prev, processing: true }));

        const url = isSuspend
            ? adminGuestsSuspend({ user: guestId }).url
            : adminGuestsReinstate({ user: guestId }).url;

        router.post(
            url,
            {},
            {
                preserveScroll: true,
                optimistic: (props) => ({
                    guests: props.guests.map((g: GuestUser) =>
                        g.id === guestId
                            ? { ...g, is_suspended: isSuspend, suspended_at: isSuspend ? new Date().toISOString() : null }
                            : g,
                    ),
                }),
                onFinish: () =>
                    setActionDialog({ open: false, type: 'suspend', guest: null, processing: false }),
            },
        );
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const totalGuests = guests.length;
    const suspendedCount = guests.filter((g) => g.is_suspended).length;
    const activeCount = totalGuests - suspendedCount;

    return (
        <>
            <Head title="Guests" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Guests</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage guest accounts and access
                    </p>
                </div>

                {/* Mini Stats */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Guests
                            </CardTitle>
                            <UserRound className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalGuests}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Active
                            </CardTitle>
                            <UserRoundCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{activeCount}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Suspended
                            </CardTitle>
                            <UserRoundX className="h-4 w-4 text-destructive" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{suspendedCount}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Guests Table */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <CardTitle>All Guests</CardTitle>
                            <div className="flex items-center gap-3">
                                <div className="relative w-56">
                                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search guests..."
                                        value={searchValue}
                                        onChange={(e) => {
                                            setSearchValue(e.target.value);
                                            if (e.target.value === '') {
                                                handleSearch('');
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSearch(searchValue);
                                        }}
                                        className="pl-8 h-9"
                                    />
                                </div>
                                <div className="w-40">
                                    <Select
                                        value={statusFilter}
                                        onValueChange={handleStatusFilter}
                                    >
                                        <SelectTrigger className="h-9">
                                            <SlidersHorizontal className="mr-2 h-3.5 w-3.5" />
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All</SelectItem>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="suspended">Suspended</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="hidden md:block rounded-md border">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="py-3 px-4 text-left font-medium">Guest</th>
                                        <th className="py-3 px-4 text-left font-medium">Contact</th>
                                        <th className="py-3 px-4 text-center font-medium">Status</th>
                                        <th className="py-3 px-4 text-center font-medium">Stays</th>
                                        <th className="py-3 px-4 text-right font-medium">Total Spent</th>
                                        <th className="py-3 px-4 text-center font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {guests.map((guest) => (
                                        <tr
                                            key={guest.id}
                                            className="border-b last:border-0 hover:bg-muted/30"
                                        >
                                            <td className="py-3 px-4">
                                                <div className="font-medium">{guest.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    Joined {formatDate(guest.created_at)}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                                    <Mail className="h-3.5 w-3.5" />
                                                    {guest.email}
                                                </div>
                                                {guest.guest?.phone && (
                                                    <div className="text-xs text-muted-foreground mt-0.5">
                                                        {guest.guest.phone}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                {guest.is_suspended ? (
                                                    <Badge variant="destructive" className="text-xs">
                                                        Suspended
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="default" className="text-xs">
                                                        Active
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className="font-medium">
                                                    {guest.reservations_count}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right font-mono">
                                                ₱{parseFloat(guest.total_spent || '0').toFixed(2)}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                {guest.is_suspended ? (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 text-xs"
                                                        onClick={() => promptReinstate(guest)}
                                                    >
                                                        <UserRoundCheck className="mr-1 h-3.5 w-3.5" />
                                                        Reinstate
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        className="h-8 text-xs"
                                                        onClick={() => promptSuspend(guest)}
                                                    >
                                                        <UserRoundX className="mr-1 h-3.5 w-3.5" />
                                                        Suspend
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {guests.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="py-8 text-center text-muted-foreground"
                                            >
                                                No guests found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {guests.length > 0 && (
                            <div className="md:hidden space-y-3">
                                {guests.map((guest) => (
                                    <div key={guest.id} className="rounded-lg border p-4 space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="font-semibold">{guest.name}</div>
                                                <div className="text-xs text-muted-foreground">Joined {formatDate(guest.created_at)}</div>
                                            </div>
                                            {guest.is_suspended ? (
                                                <Badge variant="destructive" className="text-xs">Suspended</Badge>
                                            ) : (
                                                <Badge variant="default" className="text-xs">Active</Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                            <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                                            <span className="truncate">{guest.email}</span>
                                        </div>
                                        {guest.guest?.phone && <div className="text-xs text-muted-foreground">{guest.guest.phone}</div>}
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Stays</span>
                                            <span className="font-medium">{guest.reservations_count}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Total Spent</span>
                                            <span className="font-mono font-medium">₱{parseFloat(guest.total_spent || '0').toFixed(2)}</span>
                                        </div>
                                        <div className="pt-1">
                                            {guest.is_suspended ? (
                                                <Button variant="outline" size="sm" className="w-full" onClick={() => promptReinstate(guest)}>
                                                    <UserRoundCheck className="mr-1 h-3.5 w-3.5" /> Reinstate
                                                </Button>
                                            ) : (
                                                <Button variant="destructive" size="sm" className="w-full" onClick={() => promptSuspend(guest)}>
                                                    <UserRoundX className="mr-1 h-3.5 w-3.5" /> Suspend
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {guests.length === 0 && (
                            <div className="md:hidden py-8 text-center text-muted-foreground">
                                No guests found.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Confirmation Dialog */}
            <Dialog
                open={actionDialog.open}
                onOpenChange={(open) =>
                    setActionDialog((prev) => ({
                        ...prev,
                        open,
                        guest: open ? prev.guest : null,
                    }))
                }
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {actionDialog.type === 'suspend' ? 'Suspend Guest' : 'Reinstate Guest'}
                        </DialogTitle>
                        <DialogDescription>
                            {actionDialog.type === 'suspend'
                                ? `Are you sure you want to suspend ${actionDialog.guest?.name}? They will not be able to make new bookings.`
                                : `Are you sure you want to reinstate ${actionDialog.guest?.name}? They will be able to make new bookings again.`}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() =>
                                setActionDialog((prev) => ({
                                    ...prev,
                                    open: false,
                                    guest: null,
                                }))
                            }
                            disabled={actionDialog.processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant={actionDialog.type === 'suspend' ? 'destructive' : 'default'}
                            onClick={confirmAction}
                            disabled={actionDialog.processing}
                        >
                            {actionDialog.type === 'suspend' ? 'Suspend' : 'Reinstate'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

AdminGuestsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Guests',
            href: adminGuestsIndex(),
        },
    ],
};
