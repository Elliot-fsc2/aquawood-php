import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { MessageSquare, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { updateStatus } from '@/routes/admin/requests';
import { dashboard } from '@/routes';

interface GuestRequest {
    id: number;
    title: string;
    details: string | null;
    priority: string;
    status: string;
    resolved_at: string | null;
    created_at: string;
    guest: {
        id: number;
        name: string;
        email: string;
    };
}

interface Props {
    requests: GuestRequest[];
}

const priorityConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
    low: { variant: 'secondary', label: 'Low' },
    medium: { variant: 'default', label: 'Medium' },
    high: { variant: 'destructive', label: 'High' },
};

const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
    pending: { variant: 'outline', label: 'Pending' },
    in_progress: { variant: 'default', label: 'In Progress' },
    resolved: { variant: 'secondary', label: 'Resolved' },
    cancelled: { variant: 'destructive', label: 'Cancelled' },
};

const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'cancelled', label: 'Cancelled' },
];

export default function AdminRequestsIndex({ requests }: Props) {
    const [selectedRequest, setSelectedRequest] = useState<GuestRequest | null>(null);
    const [updating, setUpdating] = useState(false);

    const handleStatusChange = (status: string) => {
        if (!selectedRequest) return;

        setUpdating(true);

        router.patch(
            updateStatus.url(selectedRequest.id),
            { status },
            {
                onSuccess: () => {
                    setSelectedRequest(null);
                    setUpdating(false);
                },
                onError: () => setUpdating(false),
            },
        );
    };

    return (
        <>
            <Head title="Guest Requests" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Guest Requests</h1>
                    <p className="text-sm text-muted-foreground">
                        View and manage requests from checked-in guests
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {requests.length > 0 ? (
                            <div className="space-y-3">
                                {requests.map((req) => (
                                    <div
                                        key={req.id}
                                        className="flex items-center justify-between rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                                        onClick={() => setSelectedRequest(req)}
                                    >
                                        <div className="space-y-1.5 min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold truncate">{req.title}</span>
                                                <Badge variant={priorityConfig[req.priority]?.variant ?? 'outline'}>
                                                    {priorityConfig[req.priority]?.label ?? req.priority}
                                                </Badge>
                                                <Badge variant={statusConfig[req.status]?.variant ?? 'outline'}>
                                                    {statusConfig[req.status]?.label ?? req.status}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                <span>{req.guest.name}</span>
                                                <span>Room {req.guest.email}</span>
                                                <span>{new Date(req.created_at).toLocaleDateString('en-US', {
                                                    month: 'short', day: 'numeric', year: 'numeric',
                                                })}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
                                <MessageSquare className="h-12 w-12 opacity-40" />
                                <p className="text-base">No requests yet.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Request Detail Modal */}
            <Dialog open={!!selectedRequest} onOpenChange={(open) => { if (!open) { setSelectedRequest(null); } }}>
                <DialogContent className="sm:max-w-lg">
                    {selectedRequest && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    {selectedRequest.title}
                                    <Badge variant={priorityConfig[selectedRequest.priority]?.variant ?? 'outline'}>
                                        {priorityConfig[selectedRequest.priority]?.label ?? selectedRequest.priority}
                                    </Badge>
                                    <Badge variant={statusConfig[selectedRequest.status]?.variant ?? 'outline'}>
                                        {statusConfig[selectedRequest.status]?.label ?? selectedRequest.status}
                                    </Badge>
                                </DialogTitle>
                                <DialogDescription>
                                    From {selectedRequest.guest.name}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                                <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                                    <div className="text-xs text-muted-foreground mb-1">Guest</div>
                                    <p className="font-medium">{selectedRequest.guest.name}</p>
                                    <p className="text-xs text-muted-foreground">{selectedRequest.guest.email}</p>
                                </div>

                                {selectedRequest.details && (
                                    <div>
                                        <div className="text-xs text-muted-foreground mb-1">Details</div>
                                        <p className="text-sm">{selectedRequest.details}</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                                    <div>
                                        <span>Submitted</span>
                                        <p className="font-medium text-foreground">
                                            {new Date(selectedRequest.created_at).toLocaleDateString('en-US', {
                                                month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                    {selectedRequest.resolved_at && (
                                        <div>
                                            <span>Resolved</span>
                                            <p className="font-medium text-foreground">
                                                {new Date(selectedRequest.resolved_at).toLocaleDateString('en-US', {
                                                    month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
                                                })}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <p className="text-sm font-medium">Update Status</p>
                                <div className="flex flex-wrap gap-2">
                                    {statusOptions.map((opt) => (
                                        <Button
                                            key={opt.value}
                                            variant={selectedRequest.status === opt.value ? 'default' : 'outline'}
                                            size="sm"
                                            disabled={updating || selectedRequest.status === opt.value}
                                            onClick={() => handleStatusChange(opt.value)}
                                        >
                                            {updating && <LoaderCircle className="mr-1 h-3 w-3 animate-spin" />}
                                            {opt.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                                    Close
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

AdminRequestsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Guest Requests',
            href: dashboard(),
        },
    ],
};
