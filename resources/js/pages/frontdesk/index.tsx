import { useEffect, useState } from 'react';
import { Head, router, usePoll } from '@inertiajs/react';
import {
    Bed, Sparkles, CheckCircle2, DoorClosed, Search, Plus, ArrowRight,
    Receipt, Coffee, Shuffle, Check, X, AlertTriangle, Shield,
    MoveHorizontal, AlertCircle, Bell, Bug, Siren,
} from 'lucide-react';
import {
    index as frontdeskIndex, checkIn as frontdeskCheckIn, checkOut as frontdeskCheckOut,
    confirm as frontdeskConfirm, cancel as frontdeskCancel,
    roomStatus as frontdeskRoomStatus, store as frontdeskStore,
    changeRoom as frontdeskChangeRoom,
} from '@/routes/frontdesk';
import { acknowledge as emergencyAcknowledge, resolve as emergencyResolve } from '@/routes/emergency';
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

interface EmergencyAlert {
    id: string;
    guestName: string;
    roomNumber: string;
    type: string;
    details: string | null;
    status: string;
    acknowledgedByName: string | null;
    acknowledgedAt: string | null;
    createdAt: string;
}

interface RoomTransfer {
    id: string;
    reservationId: string;
    fromRoom: string;
    toRoom: string;
    performedBy: string;
    reason: string | null;
    rateAdjustment: number;
    notes: string | null;
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
    emergencyAlerts: EmergencyAlert[];
    emergencyStats: {
        active: number;
        acknowledged: number;
        resolved: number;
    };
    roomTransfers: RoomTransfer[];
    stats: Stats;
}

const statusStyle: Record<string, { bg: string; text: string; label: string }> = {
    available: { bg: "bg-emerald-100", text: "text-emerald-800", label: "Available" },
    occupied: { bg: "bg-brand-900", text: "text-cream-50", label: "Occupied" },
    booked: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Reserved" },
    maintenance: { bg: "bg-slate-200", text: "text-slate-700", label: "Maintenance" },
};

const emergencyIcons: Record<string, React.ReactNode> = {
    general: <Bell className="w-5 h-5" />,
    medical: <AlertCircle className="w-5 h-5" />,
    fire: <FlameIcon className="w-5 h-5" />,
    security: <Shield className="w-5 h-5" />,
    other: <Bug className="w-5 h-5" />,
};

const emergencyLabels: Record<string, string> = {
    general: 'General',
    medical: '🚨 Medical',
    fire: '🔥 Fire',
    security: '⚠️ Security',
    other: 'Other',
};

const emergencyTypeConfig: Record<string, { label: string; emoji: string; color: string }> = {
    general: { label: 'General', emoji: '🔔', color: 'bg-slate-100 text-slate-700' },
    medical: { label: 'Medical', emoji: '🚨', color: 'bg-red-100 text-red-800' },
    fire: { label: 'Fire', emoji: '🔥', color: 'bg-orange-100 text-orange-800' },
    security: { label: 'Security', emoji: '⚠️', color: 'bg-amber-100 text-amber-800' },
    other: { label: 'Other', emoji: '📢', color: 'bg-purple-100 text-purple-800' },
};

const emergencyStatusConfig: Record<string, { label: string; color: string }> = {
    active: { label: 'Active', color: 'bg-red-100 text-red-800' },
    acknowledged: { label: 'Acknowledged', color: 'bg-amber-100 text-amber-800' },
    resolved: { label: 'Resolved', color: 'bg-emerald-100 text-emerald-800' },
};

function FlameIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
        </svg>
    );
}

export default function FrontDesk({ rooms, reservations, guestRequests, emergencyAlerts, emergencyStats, roomTransfers, stats }: Props) {
    const [filter, setFilter] = useState<string>("all");
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<string | null>(null);
    const [walkInOpen, setWalkInOpen] = useState(false);
    const [walkForm, setWalkForm] = useState({
        guestName: "", roomId: "", nights: 1, adults: 1, children: 0, notes: "",
    });
    const [receiptData, setReceiptData] = useState<Record<string, unknown> | null>(null);
    const [changeRoomOpen, setChangeRoomOpen] = useState(false);
    const [changeRoomForm, setChangeRoomForm] = useState({ newRoomId: '', reason: '', notes: '' });
    const [showTransferHistory, setShowTransferHistory] = useState(false);
    const [showEmergencySection, setShowEmergencySection] = useState(emergencyAlerts.filter(a => a.status === 'active').length > 0);
    const [emergencyFilter, setEmergencyFilter] = useState<string>('active');
    const [emergencySearch, setEmergencySearch] = useState('');

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

    usePoll(15000, {
        only: ['emergencyAlerts', 'emergencyStats'],
    });

    const filtered = rooms.filter(
        (r) =>
            (filter === "all" || r.status === filter) &&
            (r.number.includes(search) || r.type.toLowerCase().includes(search.toLowerCase())),
    );

    const selectedRoom = rooms.find((r) => r.id === selected);
    const selectedReservation = reservations.find(
        (r) => r.roomId === selected && (r.status === "checked_in" || r.status === "confirmed" || r.status === "pending"),
    );

    const selectedTransfers = roomTransfers.filter((t) => t.reservationId === selectedReservation?.id);

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

    const availableRooms = rooms.filter((r) => r.status === 'available' && r.id !== selected);

    return (
        <>
            <Head title="Front Desk" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* EMERGENCY ALERTS BANNER */}
                {emergencyStats.active > 0 && (
                    <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-4 shadow-lg animate-pulse">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="w-6 h-6 text-white" />
                                <div className="text-white font-semibold">
                                    {emergencyStats.active} Active Emergency{emergencyStats.active > 1 ? 'ies' : ''}
                                </div>
                            </div>
                            <button
                                onClick={() => setShowEmergencySection(true)}
                                className="text-xs text-white/80 hover:text-white underline underline-offset-2"
                            >
                                Manage
                            </button>
                        </div>
                        <div className="space-y-2">
                            {emergencyAlerts.filter((a) => a.status === 'active').map((alert) => (
                                <div key={alert.id} className="bg-white/10 rounded-lg px-3 py-2 flex items-center justify-between text-white text-sm">
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg">{emergencyIcons[alert.type] || <Bell className="w-4 h-4" />}</span>
                                        <div>
                                            <div className="font-medium">{emergencyLabels[alert.type] || alert.type} — {alert.guestName}</div>
                                            <div className="text-xs text-red-100">
                                                Room {alert.roomNumber} · {alert.createdAt}
                                                {alert.details && ` · ${alert.details}`}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

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

                {/* EMERGENCY SECTION */}
                {showEmergencySection && (
                    <div className="rounded-xl border border-red-200 bg-red-50/30 p-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                                <span className="font-semibold text-red-800">Emergency Alerts</span>
                                {emergencyStats.active > 0 && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-600 text-white font-medium">
                                        {emergencyStats.active} active
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={() => setShowEmergencySection(false)}
                                className="text-red-400 hover:text-red-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Emergency Stats */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            {[
                                { label: 'Active', count: emergencyStats.active, color: 'bg-red-100 border-red-300 text-red-800' },
                                { label: 'Acknowledged', count: emergencyStats.acknowledged, color: 'bg-amber-100 border-amber-300 text-amber-800' },
                                { label: 'Resolved', count: emergencyStats.resolved, color: 'bg-emerald-100 border-emerald-300 text-emerald-800' },
                            ].map((s) => (
                                <button
                                    key={s.label}
                                    onClick={() => setEmergencyFilter(s.label.toLowerCase())}
                                    className={`p-3 rounded-lg border text-left transition ${emergencyFilter === s.label.toLowerCase() ? 'ring-2 ring-brand-500 ' + s.color : s.color + ' hover:opacity-80'}`}
                                >
                                    <div className="text-xs uppercase tracking-wider opacity-70">{s.label}</div>
                                    <div className="text-xl font-bold mt-0.5">{s.count}</div>
                                </button>
                            ))}
                        </div>

                        {/* Emergency Filter & Search */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="relative flex-1 max-w-xs">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-red-400" />
                                <input
                                    value={emergencySearch}
                                    onChange={(e) => setEmergencySearch(e.target.value)}
                                    placeholder="Search by guest, room, type..."
                                    className="w-full pl-9 pr-4 py-2 text-sm border border-red-200 rounded-md bg-white focus:outline-none focus:border-red-500"
                                />
                            </div>
                            <select
                                value={emergencyFilter}
                                onChange={(e) => setEmergencyFilter(e.target.value)}
                                className="px-3 py-2 text-sm border border-red-200 rounded-md bg-white"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="acknowledged">Acknowledged</option>
                                <option value="resolved">Resolved</option>
                            </select>
                        </div>

                        {/* Emergency Alerts List */}
                        <div className="space-y-2">
                            {emergencyAlerts
                                .filter((a) => {
                                    if (emergencyFilter !== 'all' && a.status !== emergencyFilter) return false;
                                    if (emergencySearch) {
                                        const q = emergencySearch.toLowerCase();
                                        return (
                                            a.guestName.toLowerCase().includes(q) ||
                                            a.roomNumber.includes(q) ||
                                            a.type.toLowerCase().includes(q) ||
                                            (a.details ?? '').toLowerCase().includes(q)
                                        );
                                    }
                                    return true;
                                })
                                .length === 0 ? (
                                <div className="flex flex-col items-center gap-2 py-8 text-center text-red-400">
                                    <Bell className="h-8 w-8 opacity-40" />
                                    <p className="text-sm font-medium">No emergency alerts</p>
                                    <p className="text-xs">All clear — no alerts match your filters.</p>
                                </div>
                            ) : (
                                emergencyAlerts
                                    .filter((a) => {
                                        if (emergencyFilter !== 'all' && a.status !== emergencyFilter) return false;
                                        if (emergencySearch) {
                                            const q = emergencySearch.toLowerCase();
                                            return (
                                                a.guestName.toLowerCase().includes(q) ||
                                                a.roomNumber.includes(q) ||
                                                a.type.toLowerCase().includes(q) ||
                                                (a.details ?? '').toLowerCase().includes(q)
                                            );
                                        }
                                        return true;
                                    })
                                    .map((alert) => {
                                        const typeCfg = emergencyTypeConfig[alert.type] ?? emergencyTypeConfig.general;
                                        const statusCfg = emergencyStatusConfig[alert.status] ?? emergencyStatusConfig.active;
                                        return (
                                            <div
                                                key={alert.id}
                                                className={`rounded-lg border p-4 transition ${
                                                    alert.status === 'active'
                                                        ? 'border-red-200 bg-red-50/80 shadow-sm'
                                                        : alert.status === 'acknowledged'
                                                            ? 'border-amber-200 bg-amber-50/50'
                                                            : 'border-gray-200 bg-white'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl shadow-sm flex-shrink-0">
                                                            {typeCfg.emoji}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="font-semibold text-sm text-gray-900">{alert.guestName}</span>
                                                                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                                                                    Room {alert.roomNumber}
                                                                </span>
                                                                <span className={`text-xs px-2 py-0.5 rounded-full ${typeCfg.color}`}>
                                                                    {typeCfg.label}
                                                                </span>
                                                                <span className={`text-xs px-2 py-0.5 rounded-full ${statusCfg.color}`}>
                                                                    {statusCfg.label}
                                                                </span>
                                                            </div>
                                                            {alert.details && (
                                                                <p className="text-sm text-gray-600 mt-1.5">{alert.details}</p>
                                                            )}
                                                            <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                                                                <span>{alert.createdAt}</span>
                                                                {alert.acknowledgedByName && (
                                                                    <span>Acknowledged by {alert.acknowledgedByName} {alert.acknowledgedAt}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1.5 flex-shrink-0">
                                                        {alert.status === 'active' && (
                                                            <button
                                                                onClick={() => exec(emergencyAcknowledge({ emergencyAlert: Number(alert.id) }).url, 'patch')}
                                                                className="px-3 py-1.5 bg-amber-600 text-white rounded-md text-xs hover:bg-amber-700 flex items-center gap-1"
                                                            >
                                                                <CheckCircle2 className="w-3 h-3" /> Acknowledge
                                                            </button>
                                                        )}
                                                        {(alert.status === 'active' || alert.status === 'acknowledged') && (
                                                            <button
                                                                onClick={() => exec(emergencyResolve({ emergencyAlert: Number(alert.id) }).url, 'patch')}
                                                                className="px-3 py-1.5 bg-emerald-600 text-white rounded-md text-xs hover:bg-emerald-700 flex items-center gap-1"
                                                            >
                                                                <CheckCircle2 className="w-3 h-3" /> Resolve
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                            )}
                        </div>
                    </div>
                )}

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

                                {/* TRANSFER HISTORY */}
                                {selectedTransfers.length > 0 && (
                                    <div className="border-t border-brand-100 pt-3 mb-4">
                                        <button
                                            onClick={() => setShowTransferHistory(!showTransferHistory)}
                                            className="text-xs uppercase tracking-wider text-brand-600 flex items-center gap-1 hover:text-brand-800"
                                        >
                                            <MoveHorizontal className="w-3 h-3" />
                                            Transfer History ({selectedTransfers.length})
                                            <span className="ml-1">{showTransferHistory ? '▲' : '▼'}</span>
                                        </button>
                                        {showTransferHistory && (
                                            <div className="mt-2 space-y-1.5">
                                                {selectedTransfers.map((t) => (
                                                    <div key={t.id} className="text-xs bg-brand-50 rounded p-2 text-brand-700">
                                                        <div className="font-medium">{t.fromRoom} → {t.toRoom}</div>
                                                        <div className="text-brand-500">
                                                            {t.reason && <span>Reason: {t.reason} · </span>}
                                                            by {t.performedBy} · {t.createdAt}
                                                        </div>
                                                        {t.rateAdjustment !== 0 && (
                                                            <div className="text-amber-700">
                                                                Rate adjustment: ₱{t.rateAdjustment > 0 ? '+' : ''}{t.rateAdjustment.toFixed(2)}/night
                                                            </div>
                                                        )}
                                                        {t.notes && <div className="italic text-brand-500">{t.notes}</div>}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
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
                                        <>
                                            <button
                                                onClick={() => exec(frontdeskCheckOut({ reservation: Number(selectedReservation.id) }).url, 'patch', {
                                                    actual_check_out: today,
                                                })}
                                                className="w-full py-2.5 bg-brand-700 text-cream-50 rounded-md hover:bg-brand-800 flex items-center justify-center gap-2 text-sm"
                                            >
                                                <ArrowRight className="w-4 h-4" /> Process Check-Out
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setChangeRoomForm({ newRoomId: '', reason: '', notes: '' });
                                                    setChangeRoomOpen(true);
                                                }}
                                                className="w-full py-2.5 bg-amber-600 text-white rounded-md hover:bg-amber-700 flex items-center justify-center gap-2 text-sm"
                                            >
                                                <MoveHorizontal className="w-4 h-4" /> Change Room
                                            </button>
                                        </>
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

            {/* CHANGE ROOM MODAL */}
            {changeRoomOpen && selectedReservation && (
                <div
                    className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
                    onClick={() => setChangeRoomOpen(false)}
                >
                    <div
                        className="bg-white rounded-xl max-w-lg w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-brand-100 flex items-center justify-between">
                            <div>
                                <div className="text-xs uppercase tracking-wider text-gold-500">Front Desk</div>
                                <h3 className="font-serif text-2xl text-brand-900">Change Room</h3>
                                <div className="text-xs text-brand-600 mt-1">
                                    Moving {selectedReservation.guestName} from Room {selectedRoom?.number}
                                </div>
                            </div>
                            <button onClick={() => setChangeRoomOpen(false)} className="text-brand-600 hover:text-brand-900">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="bg-brand-50 rounded-lg p-3 text-sm">
                                <div className="flex justify-between text-brand-700">
                                    <span>Current room</span>
                                    <span className="font-medium">Room {selectedRoom?.number} · ₱{selectedRoom?.base_rate}/night</span>
                                </div>
                            </div>

                            <label className="block text-xs uppercase tracking-wider text-brand-700">
                                Select New Room
                                <select
                                    value={changeRoomForm.newRoomId}
                                    onChange={(e) => setChangeRoomForm({ ...changeRoomForm, newRoomId: e.target.value })}
                                    className="mt-1 w-full px-3 py-2.5 border border-brand-200 rounded-md text-sm bg-white"
                                >
                                    <option value="">Choose an available room...</option>
                                    {availableRooms.map((r) => {
                                        const rateDiff = r.base_rate - (selectedRoom?.base_rate ?? 0);
                                        return (
                                            <option key={r.id} value={r.id}>
                                                Room {r.number} · {r.type} · ₱{r.base_rate}/night{rateDiff !== 0 ? ` (${rateDiff > 0 ? '+' : ''}₱${rateDiff.toFixed(2)})` : ''}
                                            </option>
                                        );
                                    })}
                                </select>
                            </label>

                            {changeRoomForm.newRoomId && (
                                <div className="bg-amber-50 rounded-lg p-3 text-sm">
                                    {(() => {
                                        const newRoom = rooms.find((r) => r.id === changeRoomForm.newRoomId);
                                        if (!newRoom) return null;
                                        const diff = newRoom.base_rate - (selectedRoom?.base_rate ?? 0);
                                        return (
                                            <div className="space-y-1 text-amber-800">
                                                <div className="font-medium">Rate Preview</div>
                                                <div className="flex justify-between">
                                                    <span>Current rate</span>
                                                    <span>₱{selectedRoom?.base_rate.toFixed(2)}/night</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>New rate</span>
                                                    <span>₱{newRoom.base_rate.toFixed(2)}/night</span>
                                                </div>
                                                <div className="flex justify-between font-medium border-t border-amber-200 pt-1 mt-1">
                                                    <span>Adjustment</span>
                                                    <span className={diff > 0 ? 'text-red-700' : diff < 0 ? 'text-green-700' : ''}>
                                                        {diff > 0 ? '+' : ''}{diff.toFixed(2)}/night
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}

                            <label className="block text-xs uppercase tracking-wider text-brand-700">
                                Reason
                                <select
                                    value={changeRoomForm.reason}
                                    onChange={(e) => setChangeRoomForm({ ...changeRoomForm, reason: e.target.value })}
                                    className="mt-1 w-full px-3 py-2.5 border border-brand-200 rounded-md text-sm bg-white"
                                >
                                    <option value="">Select reason...</option>
                                    <option value="Guest Request">Guest Request</option>
                                    <option value="Maintenance Issue">Maintenance Issue</option>
                                    <option value="Upgrade">Upgrade</option>
                                    <option value="Downgrade">Downgrade</option>
                                    <option value="Other">Other</option>
                                </select>
                            </label>

                            <label className="block text-xs uppercase tracking-wider text-brand-700">
                                Notes (optional)
                                <textarea
                                    rows={2}
                                    value={changeRoomForm.notes}
                                    onChange={(e) => setChangeRoomForm({ ...changeRoomForm, notes: e.target.value })}
                                    className="mt-1 w-full px-3 py-2 border border-brand-200 rounded-md text-sm resize-none"
                                />
                            </label>

                            <div className="flex justify-end gap-2 pt-2 border-t border-brand-100">
                                <button
                                    onClick={() => setChangeRoomOpen(false)}
                                    className="px-4 py-2 border border-brand-200 rounded-md text-sm hover:bg-brand-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if (!changeRoomForm.newRoomId) return;
                                        exec(frontdeskChangeRoom({ reservation: Number(selectedReservation.id) }).url, 'patch', {
                                            new_room_id: changeRoomForm.newRoomId,
                                            reason: changeRoomForm.reason,
                                            notes: changeRoomForm.notes,
                                        });
                                        setChangeRoomOpen(false);
                                    }}
                                    disabled={!changeRoomForm.newRoomId}
                                    className="px-4 py-2 bg-amber-600 text-white rounded-md text-sm hover:bg-amber-700 disabled:opacity-40 flex items-center gap-1"
                                >
                                    <MoveHorizontal className="w-4 h-4" /> Confirm Change Room
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
