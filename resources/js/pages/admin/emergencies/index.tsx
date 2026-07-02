import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { AlertTriangle, Bell, Shield, CheckCircle2, X, Search, Filter, Clock } from 'lucide-react';
import { dashboard } from '@/routes';
import { acknowledge as emergenciesAcknowledge, resolve as emergenciesResolve } from '@/routes/admin/emergencies';

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
    createdAtIso: string;
}

interface Props {
    alerts: EmergencyAlert[];
    selectedStatus: string | null;
}

const emergencyTypeConfig: Record<string, { label: string; emoji: string; color: string }> = {
    general: { label: 'General', emoji: '🔔', color: 'bg-slate-100 text-slate-700' },
    medical: { label: 'Medical', emoji: '🚨', color: 'bg-red-100 text-red-800' },
    fire: { label: 'Fire', emoji: '🔥', color: 'bg-orange-100 text-orange-800' },
    security: { label: 'Security', emoji: '⚠️', color: 'bg-amber-100 text-amber-800' },
    other: { label: 'Other', emoji: '📢', color: 'bg-purple-100 text-purple-800' },
};

const statusConfig: Record<string, { label: string; color: string }> = {
    active: { label: 'Active', color: 'bg-red-100 text-red-800' },
    acknowledged: { label: 'Acknowledged', color: 'bg-amber-100 text-amber-800' },
    resolved: { label: 'Resolved', color: 'bg-emerald-100 text-emerald-800' },
};

export default function AdminEmergencies({ alerts, selectedStatus }: Props) {
    const [statusFilter, setStatusFilter] = useState<string>(selectedStatus ?? 'all');
    const [searchQuery, setSearchQuery] = useState('');

    const exec = (url: string, method: 'get' | 'post' | 'patch' | 'delete', data?: Record<string, string>) => {
        router.visit(url, { method, data, preserveScroll: true, preserveState: true });
    };

    const filtered = alerts.filter((a) => {
        if (statusFilter !== 'all' && a.status !== statusFilter) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return (
                a.guestName.toLowerCase().includes(q) ||
                a.roomNumber.includes(q) ||
                a.type.toLowerCase().includes(q) ||
                (a.details ?? '').toLowerCase().includes(q)
            );
        }
        return true;
    });

    const activeCount = alerts.filter((a) => a.status === 'active').length;
    const acknowledgedCount = alerts.filter((a) => a.status === 'acknowledged').length;
    const resolvedCount = alerts.filter((a) => a.status === 'resolved').length;

    return (
        <>
            <Head title="Emergency Alerts" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                            Emergency Alerts
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Monitor and manage all guest emergency alerts
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: 'Active', count: activeCount, color: 'bg-red-50 border-red-200 text-red-800' },
                        { label: 'Acknowledged', count: acknowledgedCount, color: 'bg-amber-50 border-amber-200 text-amber-800' },
                        { label: 'Resolved', count: resolvedCount, color: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
                    ].map((s) => (
                        <button
                            key={s.label}
                            onClick={() => setStatusFilter(s.label.toLowerCase())}
                            className={`p-4 rounded-lg border text-left transition ${statusFilter === s.label.toLowerCase() ? 'ring-2 ring-brand-500 ' + s.color : s.color + ' hover:opacity-80'}`}
                        >
                            <div className="text-xs uppercase tracking-wider opacity-70">{s.label}</div>
                            <div className="text-3xl font-bold mt-1">{s.count}</div>
                        </button>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative flex-1 max-w-xs">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by guest, room, type..."
                            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:border-brand-500"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 text-sm border border-gray-200 rounded-md bg-white"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="acknowledged">Acknowledged</option>
                        <option value="resolved">Resolved</option>
                    </select>
                </div>

                {/* Alerts List */}
                <div className="space-y-3">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
                            <Bell className="h-12 w-12 opacity-40" />
                            <p className="text-base font-medium">No emergency alerts</p>
                            <p className="text-sm">All clear — no alerts match your filters.</p>
                        </div>
                    ) : (
                        filtered.map((alert) => {
                            const typeCfg = emergencyTypeConfig[alert.type] ?? emergencyTypeConfig.general;
                            const statusCfg = statusConfig[alert.status] ?? statusConfig.active;
                            return (
                                <div
                                    key={alert.id}
                                    className={`rounded-xl border p-5 transition ${
                                        alert.status === 'active'
                                            ? 'border-red-200 bg-red-50/50 shadow-sm'
                                            : alert.status === 'acknowledged'
                                                ? 'border-amber-200 bg-amber-50/30'
                                                : 'border-gray-100 bg-white'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-4 flex-1 min-w-0">
                                            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-2xl shadow-sm flex-shrink-0">
                                                {typeCfg.emoji}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-semibold text-gray-900">{alert.guestName}</span>
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
                                                    <p className="text-sm text-gray-600 mt-2">{alert.details}</p>
                                                )}
                                                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                                    <span>Created {alert.createdAt}</span>
                                                    {alert.acknowledgedByName && (
                                                        <span>Acknowledged by {alert.acknowledgedByName} {alert.acknowledgedAt}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 flex-shrink-0">
                                            {alert.status === 'active' && (
                                                <button
                                                    onClick={() => exec(emergenciesAcknowledge({ emergencyAlert: Number(alert.id) }).url, 'patch')}
                                                    className="px-3 py-1.5 bg-amber-600 text-white rounded-md text-xs hover:bg-amber-700 flex items-center gap-1"
                                                >
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Acknowledge
                                                </button>
                                            )}
                                            {(alert.status === 'active' || alert.status === 'acknowledged') && (
                                                <button
                                                    onClick={() => exec(emergenciesResolve({ emergencyAlert: Number(alert.id) }).url, 'patch')}
                                                    className="px-3 py-1.5 bg-emerald-600 text-white rounded-md text-xs hover:bg-emerald-700 flex items-center gap-1"
                                                >
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Resolve
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
        </>
    );
}

AdminEmergencies.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Emergency Alerts', href: '' },
    ],
};
