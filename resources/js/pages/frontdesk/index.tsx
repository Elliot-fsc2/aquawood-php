import { useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    Bed, Sparkles, CheckCircle2, DoorClosed, Search, Plus, ArrowRight,
    Receipt, Coffee, Shuffle, Check, X, AlertTriangle, Shield,
} from 'lucide-react';
import {
    index as frontdeskIndex, checkIn as frontdeskCheckIn, checkOut as frontdeskCheckOut,
    confirm as frontdeskConfirm, cancel as frontdeskCancel,
    roomStatus as frontdeskRoomStatus, store as frontdeskStore,
} from '@/routes/frontdesk';
import { dashboard } from '@/routes';

interface Room {
    id: string;
    number: string;
    type: string;
    floor: string;
    status: string;
    base_rate: number;
    beds: string;
    capacity: number;
    amenities: string[];
    image: string;
}

interface Reservation {
    id: string;
    guestName: string;
    guestId: string;
    roomId: string;
    checkIn: string;
    checkOut: string;
    rateCode: string;
    totalAmount: number;
    deposit: number;
    status: string;
    source: string;
    adults: number;
    children: number;
    notes: string | null;
}

interface GuestRequest {
    id: string;
    title: string;
    details: string | null;
    priority: string;
    status: string;
    roomNumber: string;
    assignedRoom: string;
    createdAt: string;
}

interface Stats {
    available: number;
    occupied: number;
    reserved: number;
    maintenance: number;
    dirty: number;
}

interface Props {
    rooms: Room[];
    reservations: Reservation[];
    guestRequests: GuestRequest[];
    stats: Stats;
}

const statusStyle: Record<string, { bg: string; text: string; label: string }> = {
    available: { bg: "bg-emerald-100", text: "text-emerald-800", label: "Available" },
    occupied: { bg: "bg-brand-900", text: "text-cream-50", label: "Occupied" },
    booked: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Reserved" },
    maintenance: { bg: "bg-slate-200", text: "text-slate-700", label: "Maintenance" },
};

export default function FrontDesk({ rooms, reservations, guestRequests, stats }: Props) {
    const [filter, setFilter] = useState<string>("all");
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<string | null>(null);
    const [walkInOpen, setWalkInOpen] = useState(false);
    const [walkForm, setWalkForm] = useState({
        guestName: "", roomId: "", nights: 1, adults: 1, children: 0, notes: "",
    });
    const [receiptData, setReceiptData] = useState<Record<string, unknown> | null>(null);

    const today = new Date().toISOString().slice(0, 10);

    useEffect(() => {
        const off = router.on('flash', (event) => {
            const flash = (event as CustomEvent).detail?.flash;
            const data = flash?.receipt as Record<string, unknown> | undefined;
            if (data) {
                setReceiptData(data);
            }
        });
        return () => off();
    }, []);

    const filtered = rooms.filter(
        (r) =>
            (filter === "all" || r.status === filter) &&
            (r.number.includes(search) || r.type.toLowerCase().includes(search.toLowerCase())),
    );

    const selectedRoom = rooms.find((r) => r.id === selected);
    const selectedReservation = reservations.find(
        (r) => r.roomId === selected && (r.status === "checked_in" || r.status === "confirmed" || r.status === "pending"),
    );

    const exec = (url: string, method: 'get' | 'post' | 'patch' | 'put' | 'delete', data?: Record<string, string | number>) => {
        router.visit(url, { method, data: data as Record<string, string>, preserveScroll: true, preserveState: true });
    };

    const counts: Record<string, number> = {
        all: rooms.length,
        available: stats.available,
        occupied: stats.occupied,
        reserved: stats.reserved,
        dirty: stats.dirty,
        maintenance: stats.maintenance,
    };

    return (
        <>
            <Head title="Front Desk" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <div className="text-xs uppercase tracking-[0.25em] text-gold-500 font-medium mb-1">
                            Front Desk
                        </div>
                        <h1 className="font-serif text-4xl text-brand-900">Rooms & Check-in/out</h1>
                        <p className="text-brand-700 mt-1">
                            Live inventory, check-in/out, and booking confirmation.
                        </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => setWalkInOpen(true)}
                            className="px-4 py-2 bg-white border border-brand-200 rounded-md text-sm hover:bg-brand-50 flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> Walk-in Sale
                        </button>
                    </div>
                </div>

                {/* STATS */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                    {Object.keys(counts).map((key) => (
                        <button
                            key={key}
                            onClick={() => setFilter(key)}
                            className={`p-3 rounded-lg border transition text-left ${filter === key ? "border-brand-600 bg-brand-50" : "border-brand-100 bg-white hover:border-brand-300"}`}
                        >
                            <div className="text-xs uppercase tracking-wider text-brand-600 capitalize">{key}</div>
                            <div className="font-serif text-2xl text-brand-900">{counts[key]}</div>
                        </button>
                    ))}
                </div>

                {/* SEARCH */}
                <div className="relative max-w-md">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by room number or type..."
                        className="w-full pl-9 pr-4 py-2.5 text-sm border border-brand-200 rounded-md bg-white focus:outline-none focus:border-brand-500"
                    />
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* ROOM GRID */}
                    <div className="lg:col-span-2 grid grid-cols-4 md:grid-cols-6 gap-3">
                        {filtered.map((room) => {
                            const st = statusStyle[room.status] ?? statusStyle.available;
                            const isSelected = selected === room.id;
                            const hasReservation = reservations.some(
                                (r) => r.roomId === room.id && (r.status === "confirmed" || r.status === "pending"),
                            );
                            return (
                                <button
                                    key={room.id}
                                    onClick={() => setSelected(room.id)}
                                    className={`relative aspect-square rounded-lg p-2 text-left transition border-2 ${isSelected ? "border-brand-700 scale-[1.02] shadow-lg" : "border-transparent hover:border-brand-300"} ${st.bg}`}
                                >
                                    <div className={`font-mono font-bold text-sm ${st.text}`}>{room.number}</div>
                                    <div className={`text-[10px] mt-1 ${st.text} opacity-80 leading-tight`}>{room.type}</div>
                                    {hasReservation && room.status !== "occupied" && (
                                        <span className="absolute top-1 right-1 text-[8px] font-bold px-1.5 py-0.5 rounded bg-blue-600 text-white tracking-wider shadow">RES</span>
                                    )}
                                    <div className={`absolute bottom-2 left-2 right-2 text-[9px] uppercase tracking-wider ${st.text} opacity-70`}>
                                        ₱{room.base_rate}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* ROOM DETAIL */}
                    <div className="bg-white rounded-xl border border-brand-100 p-6 h-fit">
                        {selectedRoom ? (
                            <>
                                <img
                                    src={selectedRoom.image}
                                    alt={selectedRoom.type}
                                    className="w-full aspect-video object-cover rounded-md mb-4"
                                />
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <div className="font-serif text-2xl text-brand-900">Room {selectedRoom.number}</div>
                                        <div className="text-sm text-brand-600">
                                            {selectedRoom.type} · {selectedRoom.floor}
                                        </div>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full ${statusStyle[selectedRoom.status]?.bg} ${statusStyle[selectedRoom.status]?.text}`}>
                                        {statusStyle[selectedRoom.status]?.label ?? selectedRoom.status}
                                    </span>
                                </div>
                                <div className="font-serif text-xl text-brand-900 mb-3">
                                    ₱{selectedRoom.base_rate}
                                    <span className="text-sm text-brand-600 font-sans"> / night</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-sm text-brand-700 mb-4">
                                    <div><Bed className="inline w-4 h-4 mr-1" />{selectedRoom.beds}</div>
                                    <div>👥 Up to {selectedRoom.capacity}</div>
                                </div>
                                <div className="flex flex-wrap gap-1.5 mb-5">
                                    {selectedRoom.amenities.map((a) => (
                                        <span key={a} className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">{a}</span>
                                    ))}
                                </div>

                                {selectedReservation && (
                                    <div className="border-t border-brand-100 pt-4 mb-4">
                                        <div className="text-xs uppercase tracking-wider text-brand-600 mb-2">Current Guest</div>
                                        <div className="font-medium text-brand-900">{selectedReservation.guestName}</div>
                                        <div className="text-xs text-brand-600">
                                            {selectedReservation.id} · {selectedReservation.rateCode}
                                        </div>
                                        <div className="text-xs text-brand-600">
                                            {new Date(selectedReservation.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} → {new Date(selectedReservation.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    {selectedReservation?.status === "pending" && (
                                        <button
                                            onClick={() => exec(frontdeskConfirm({ reservation: Number(selectedReservation.id) }).url, 'patch')}
                                            className="w-full py-2.5 bg-brand-700 text-cream-50 rounded-md hover:bg-brand-800 flex items-center justify-center gap-2 text-sm"
                                        >
                                            <CheckCircle2 className="w-4 h-4" /> Confirm Booking
                                        </button>
                                    )}
                                    {selectedReservation?.status === "confirmed" && (
                                        <button
                                            onClick={() => exec(frontdeskCheckIn({ reservation: Number(selectedReservation.id) }).url, 'patch')}
                                            className="w-full py-2.5 bg-brand-700 text-cream-50 rounded-md hover:bg-brand-800 flex items-center justify-center gap-2 text-sm"
                                        >
                                            <CheckCircle2 className="w-4 h-4" /> Check-In Guest
                                        </button>
                                    )}
                                    {selectedReservation?.status === "checked_in" && (
                                        <button
                                            onClick={() => exec(frontdeskCheckOut({ reservation: Number(selectedReservation.id) }).url, 'patch', {
                                                actual_check_out: today,
                                            })}
                                            className="w-full py-2.5 bg-brand-700 text-cream-50 rounded-md hover:bg-brand-800 flex items-center justify-center gap-2 text-sm"
                                        >
                                            <ArrowRight className="w-4 h-4" /> Process Check-Out
                                        </button>
                                    )}
                                    <div className="mt-4 pt-4 border-t border-brand-100">
                                        <div className="text-xs uppercase tracking-wider text-brand-600 mb-2">Quick Status</div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {["available", "occupied", "booked", "maintenance"].map((s) => (
                                                <button
                                                    key={s}
                                                    onClick={() => exec(frontdeskRoomStatus({ room: Number(selectedRoom.id) }).url, 'patch', { status: s })}
                                                    className={`text-xs px-2 py-1.5 rounded ${selectedRoom.status === s ? (statusStyle[s]?.bg ?? 'bg-brand-100') + ' ' + (statusStyle[s]?.text ?? 'text-brand-700') + ' font-medium' : 'bg-brand-50 text-brand-700 hover:bg-brand-100'}`}
                                                >
                                                    {statusStyle[s]?.label ?? s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12 text-brand-500">
                                <DoorClosed className="w-10 h-10 mx-auto mb-3 opacity-40" />
                                <p className="text-sm">Select a room to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* WALK-IN MODAL */}
            {walkInOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
                    onClick={() => setWalkInOpen(false)}
                >
                    <div
                        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-brand-100 flex items-center justify-between">
                            <div>
                                <div className="text-xs uppercase tracking-wider text-gold-500">Front Desk</div>
                                <h3 className="font-serif text-2xl text-brand-900">Walk-in Sale</h3>
                                <div className="text-xs text-brand-600 mt-1">
                                    Books and checks in the guest immediately.
                                </div>
                            </div>
                            <button onClick={() => setWalkInOpen(false)} className="text-brand-600 hover:text-brand-900">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <label className="md:col-span-2 block text-xs uppercase tracking-wider text-brand-700">
                                Guest Name
                                <input
                                    value={walkForm.guestName}
                                    onChange={(e) => setWalkForm({ ...walkForm, guestName: e.target.value })}
                                    className="mt-1 w-full px-3 py-2 border border-brand-200 rounded-md text-sm normal-case"
                                />
                            </label>
                            <label className="md:col-span-2 block text-xs uppercase tracking-wider text-brand-700">
                                Room
                                <select
                                    value={walkForm.roomId}
                                    onChange={(e) => setWalkForm({ ...walkForm, roomId: e.target.value })}
                                    className="mt-1 w-full px-3 py-2 border border-brand-200 rounded-md text-sm bg-white"
                                >
                                    <option value="">Select room</option>
                                    {rooms.filter((r) => r.status === "available").map((r) => (
                                        <option key={r.id} value={r.id}>
                                            Room {r.number} · {r.type} · ₱{r.base_rate}/night ✓ Available
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="block text-xs uppercase tracking-wider text-brand-700">
                                Nights
                                <input
                                    type="number" min={1}
                                    value={walkForm.nights}
                                    onChange={(e) => setWalkForm({ ...walkForm, nights: parseInt(e.target.value) || 1 })}
                                    className="mt-1 w-full px-3 py-2 border border-brand-200 rounded-md text-sm"
                                />
                            </label>
                            <label className="block text-xs uppercase tracking-wider text-brand-700">
                                Adults
                                <input
                                    type="number" min={1}
                                    value={walkForm.adults}
                                    onChange={(e) => setWalkForm({ ...walkForm, adults: parseInt(e.target.value) || 1 })}
                                    className="mt-1 w-full px-3 py-2 border border-brand-200 rounded-md text-sm"
                                />
                            </label>
                            <label className="block text-xs uppercase tracking-wider text-brand-700">
                                Children
                                <input
                                    type="number" min={0}
                                    value={walkForm.children}
                                    onChange={(e) => setWalkForm({ ...walkForm, children: parseInt(e.target.value) || 0 })}
                                    className="mt-1 w-full px-3 py-2 border border-brand-200 rounded-md text-sm"
                                />
                            </label>
                            <label className="md:col-span-2 block text-xs uppercase tracking-wider text-brand-700">
                                Notes
                                <textarea
                                    rows={2}
                                    value={walkForm.notes}
                                    onChange={(e) => setWalkForm({ ...walkForm, notes: e.target.value })}
                                    className="mt-1 w-full px-3 py-2 border border-brand-200 rounded-md text-sm resize-none normal-case"
                                />
                            </label>
                            <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                                <button
                                    onClick={() => setWalkInOpen(false)}
                                    className="px-4 py-2 border border-brand-200 rounded-md text-sm hover:bg-brand-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if (!walkForm.guestName.trim() || !walkForm.roomId) return;
                                        const co = new Date(Date.now() + walkForm.nights * 86400000).toISOString().slice(0, 10);
                                        exec(frontdeskStore().url, 'post', {
                                            guest_name: walkForm.guestName.trim(),
                                            room_id: walkForm.roomId,
                                            check_in_date: today,
                                            check_out_date: co,
                                            adults: walkForm.adults,
                                            children: walkForm.children,
                                            notes: walkForm.notes,
                                        });
                                        setWalkInOpen(false);
                                        setWalkForm({ guestName: "", roomId: "", nights: 1, adults: 1, children: 0, notes: "" });
                                    }}
                                    disabled={!walkForm.guestName.trim() || !walkForm.roomId}
                                    className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm hover:bg-emerald-700 disabled:opacity-40 flex items-center gap-1"
                                >
                                    <CheckCircle2 className="w-4 h-4" /> Book & Check-in
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* RECEIPT MODAL */}
            {receiptData && (
                <div
                    className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
                    onClick={() => setReceiptData(null)}
                >
                    <div
                        className="bg-white rounded-xl max-w-lg w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-brand-100">
                            <div className="text-xs uppercase tracking-[0.25em] text-gold-500 font-medium mb-1">Receipt</div>
                            <h3 className="font-serif text-2xl text-brand-900">
                                Room {receiptData.roomNumber as string}
                            </h3>
                            <p className="text-sm text-brand-600 mt-1">{receiptData.guestName as string}</p>
                        </div>
                        <div className="p-6 space-y-3 text-sm">
                            <div className="grid grid-cols-2 gap-2 text-brand-700">
                                <div>Check-in</div>
                                <div className="text-right font-medium">{receiptData.checkIn as string}</div>
                                <div>Original check-out</div>
                                <div className="text-right font-medium">{receiptData.checkOut as string}</div>
                                <div>Actual check-out</div>
                                <div className="text-right font-medium">{receiptData.actualCheckOut as string}</div>
                                <div>Nights booked</div>
                                <div className="text-right font-medium">{receiptData.nightsBooked as number}</div>
                                <div>Nights stayed</div>
                                <div className="text-right font-medium">{receiptData.nightsActual as number}</div>
                            </div>
                            <div className="border-t border-brand-100 pt-3 mt-3 space-y-1.5">
                                <div className="flex justify-between text-brand-700">
                                    <span>Rate per night</span>
                                    <span className="font-mono">₱{receiptData.ratePerNight as string}</span>
                                </div>
                                <div className="flex justify-between text-brand-700">
                                    <span>Subtotal</span>
                                    <span className="font-mono">₱{receiptData.subtotal as string}</span>
                                </div>
                                {parseFloat(receiptData.adjustment as string) !== 0 && (
                                    <div className="flex justify-between text-amber-700">
                                        <span>Adjustment (early check-out)</span>
                                        <span className="font-mono">₱{receiptData.adjustment as string}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-brand-700">
                                    <span>Tax (12%)</span>
                                    <span className="font-mono">₱{receiptData.tax as string}</span>
                                </div>
                                <div className="flex justify-between text-lg font-serif text-brand-900 border-t border-brand-100 pt-2 mt-2">
                                    <span>Total</span>
                                    <span className="font-mono font-bold">₱{receiptData.total as string}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setReceiptData(null)}
                                className="w-full mt-4 py-2.5 bg-brand-800 text-cream-50 rounded-md hover:bg-brand-900 text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

FrontDesk.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Front Desk', href: frontdeskIndex() },
    ],
};
