import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, MessageSquare, Clock, CheckCircle2, XCircle, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { index as requestsIndex, store } from '@/routes/requests';
import { dashboard } from '@/routes';

interface GuestRequest {
    id: number;
    title: string;
    details: string | null;
    priority: string;
    status: string;
    resolved_at: string | null;
    created_at: string;
}

interface Props {
    requests: GuestRequest[];
    canMakeRequest: boolean;
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

export default function RequestsIndex({ requests, canMakeRequest }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ title: '', details: '', priority: 'medium' });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = () => {
        setSubmitting(true);
        setErrors({});

        router.post(
            store(),
            form,
            {
                onSuccess: () => {
                    setShowForm(false);
                    setForm({ title: '', details: '', priority: 'medium' });
                    setSubmitting(false);
                },
                onError: (err) => {
                    setErrors(err);
                    setSubmitting(false);
                },
            },
        );
    };

    return (
        <>
            <Head title="My Requests" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">My Requests</h1>
                        <p className="text-sm text-muted-foreground">
                            Submit and track requests to the front desk
                        </p>
                    </div>
                    <Button onClick={() => setShowForm(true)} disabled={!canMakeRequest}>
                        <Plus className="mr-2 h-4 w-4" />
                        Make Request
                    </Button>
                </div>

                {!canMakeRequest && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                        You need to be checked in to a room before you can make requests.
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Request History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {requests.length > 0 ? (
                            <div className="space-y-3">
                                {requests.map((req) => (
                                    <div
                                        key={req.id}
                                        className="rounded-lg border p-4"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-1.5 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold truncate">{req.title}</span>
                                                    <Badge variant={priorityConfig[req.priority]?.variant ?? 'outline'}>
                                                        {priorityConfig[req.priority]?.label ?? req.priority}
                                                    </Badge>
                                                    <Badge variant={statusConfig[req.status]?.variant ?? 'outline'}>
                                                        {statusConfig[req.status]?.label ?? req.status}
                                                    </Badge>
                                                </div>
                                                {req.details && (
                                                    <p className="text-sm text-muted-foreground">{req.details}</p>
                                                )}
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                    <span>Submitted {new Date(req.created_at).toLocaleDateString('en-US', {
                                                        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
                                                    })}</span>
                                                    {req.resolved_at && (
                                                        <span>Resolved {new Date(req.resolved_at).toLocaleDateString('en-US', {
                                                            month: 'short', day: 'numeric', year: 'numeric',
                                                        })}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
                                <MessageSquare className="h-12 w-12 opacity-40" />
                                <p className="text-base">No requests yet.</p>
                                <p className="text-sm">Click "Make Request" to contact the front desk.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* New Request Dialog */}
            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>New Request</DialogTitle>
                        <DialogDescription>
                            Submit a request to the front desk.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                placeholder="e.g., Extra towels"
                            />
                            {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="details">Details</Label>
                            <Textarea
                                id="details"
                                value={form.details}
                                onChange={(e) => setForm({ ...form, details: e.target.value })}
                                placeholder="Describe your request..."
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={submitting}>
                            {submitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Submit Request
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

RequestsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Requests',
            href: requestsIndex(),
        },
    ],
};
