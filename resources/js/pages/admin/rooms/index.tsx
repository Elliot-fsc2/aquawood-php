import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DeleteConfirmationDialog from '@/components/delete-confirmation-dialog';
import { create as adminRoomsCreate, edit as adminRoomsEdit, index as adminRoomsIndex } from '@/routes/admin/rooms';
import { dashboard } from '@/routes';

interface Floor {
    id: number;
    name: string;
    level: number;
}

interface RoomCategory {
    id: number;
    name: string;
}

interface Room {
    id: number;
    number: string;
    base_rate: string;
    capacity: number;
    status: string;
    image: string | null;
    floor: Floor;
    category: RoomCategory | null;
}

interface Props {
    rooms: Room[];
}

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    available: 'default',
    occupied: 'secondary',
    maintenance: 'destructive',
};

export default function RoomsIndex({ rooms }: Props) {
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; room: Room | null; processing: boolean }>({
        open: false,
        room: null,
        processing: false,
    });

    const handleDelete = (room: Room) => {
        setDeleteDialog({ open: true, room, processing: false });
    };

    const confirmDelete = () => {
        if (!deleteDialog.room) return;

        setDeleteDialog((prev) => ({ ...prev, processing: true }));

        router.delete(adminRoomsIndex().url + '/' + deleteDialog.room.id, {
            onFinish: () => setDeleteDialog({ open: false, room: null, processing: false }),
        });
    };

    const handleEdit = (room: Room) => {
        router.get(adminRoomsEdit({ room: room.id }).url);
    };

    return (
        <>
            <Head title="Rooms" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Rooms</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage resort rooms and their assignments
                        </p>
                    </div>
                    <Link href={adminRoomsCreate()}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Room
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Rooms</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="py-3 px-4 text-left font-medium">Room</th>
                                        <th className="py-3 px-4 text-left font-medium">Floor</th>
                                        <th className="py-3 px-4 text-left font-medium">Category</th>
                                        <th className="py-3 px-4 text-right font-medium">Rate</th>
                                        <th className="py-3 px-4 text-center font-medium">Capacity</th>
                                        <th className="py-3 px-4 text-center font-medium">Image</th>
                                        <th className="py-3 px-4 text-center font-medium">Status</th>
                                        <th className="py-3 px-4 text-center font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rooms.map((room) => (
                                        <tr key={room.id} className="border-b last:border-0 hover:bg-muted/30">
                                            <td className="py-3 px-4 font-mono font-medium">
                                                {room.number}
                                            </td>
                                            <td className="py-3 px-4">
                                                {room.floor.name}
                                            </td>
                                            <td className="py-3 px-4 text-muted-foreground">
                                                {room.category?.name ?? '—'}
                                            </td>
                                            <td className="py-3 px-4 text-right font-mono">
                                                ₱{parseFloat(room.base_rate).toFixed(2)}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                {room.capacity}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                {room.image ? (
                                                    <div className="flex justify-center">
                                                        <div className="h-10 w-14 overflow-hidden rounded border bg-muted">
                                                            <img
                                                                src={'/storage/' + room.image}
                                                                alt={room.number}
                                                                className="h-full w-full object-cover"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <Badge variant={statusVariants[room.status] ?? 'outline'}>
                                                    {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => handleEdit(room)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                                        onClick={() => handleDelete(room)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {rooms.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="py-8 text-center text-muted-foreground">
                                                No rooms yet. Create your first room to get started.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <DeleteConfirmationDialog
                open={deleteDialog.open}
                onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open, processing: false }))}
                onConfirm={confirmDelete}
                title="Delete Room"
                description={`Are you sure you want to delete room "${deleteDialog.room?.number ?? ''}"? This action cannot be undone.`}
                processing={deleteDialog.processing}
            />
        </>
    );
}

RoomsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Rooms',
            href: adminRoomsIndex(),
        },
    ],
};
