import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Tag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DeleteConfirmationDialog from '@/components/delete-confirmation-dialog';
import { index as adminCategoriesIndex } from '@/routes/admin/categories';
import { create as adminFloorsCreate, edit as adminFloorsEdit, index as adminFloorsIndex } from '@/routes/admin/floors';
import { dashboard } from '@/routes';

interface Floor {
    id: number;
    name: string;
    level: number;
    description: string | null;
    room_count: number;
    room_categories_count?: number;
}

interface Props {
    floors: Floor[];
}

export default function FloorsIndex({ floors }: Props) {
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; floor: Floor | null; processing: boolean }>({
        open: false,
        floor: null,
        processing: false,
    });

    const handleDelete = (floor: Floor) => {
        setDeleteDialog({ open: true, floor, processing: false });
    };

    const confirmDelete = () => {
        if (!deleteDialog.floor) return;

        setDeleteDialog((prev) => ({ ...prev, processing: true }));

        router.delete(adminFloorsIndex().url + '/' + deleteDialog.floor.id, {
            preserveScroll: true,
            optimistic: (props) => ({
                floors: props.floors.filter((f: Floor) => f.id !== deleteDialog.floor!.id),
            }),
            onFinish: () => setDeleteDialog({ open: false, floor: null, processing: false }),
        });
    };

    const handleEdit = (floor: Floor) => {
        router.get(adminFloorsEdit({ floor: floor.id }).url);
    };

    return (
        <>
            <Head title="Floors" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Floors</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage resort floors and levels
                        </p>
                    </div>
                    <Link href={adminFloorsCreate()}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Floor
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Floors</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="hidden md:block rounded-md border">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="py-3 px-4 text-left font-medium">Level</th>
                                        <th className="py-3 px-4 text-left font-medium">Name</th>
                                        <th className="py-3 px-4 text-left font-medium">Description</th>
                                        <th className="py-3 px-4 text-center font-medium">Rooms</th>
                                        <th className="py-3 px-4 text-center font-medium">Categories</th>
                                        <th className="py-3 px-4 text-center font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {floors.map((floor) => (
                                        <tr key={floor.id} className="border-b last:border-0 hover:bg-muted/30">
                                            <td className="py-3 px-4 font-mono text-sm">
                                                {floor.level}
                                            </td>
                                            <td className="py-3 px-4 font-medium">
                                                {floor.name}
                                            </td>
                                            <td className="py-3 px-4 text-muted-foreground">
                                                {floor.description ?? '—'}
                                            </td>
                                            <td className="py-3 px-4 text-center font-mono text-sm">
                                                {floor.room_count}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <Link href={adminCategoriesIndex().url + '?floor_id=' + floor.id}>
                                                    <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                                                        <Tag className="mr-1 h-3 w-3" />
                                                        {floor.room_categories_count ?? 0}
                                                    </Badge>
                                                </Link>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => handleEdit(floor)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                                        onClick={() => handleDelete(floor)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {floors.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-8 text-center text-muted-foreground">
                                                No floors yet. Create your first floor to get started.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {floors.length > 0 && (
                            <div className="md:hidden space-y-3">
                                {floors.map((floor) => (
                                    <div key={floor.id} className="rounded-lg border p-4 space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="font-semibold text-lg">{floor.name}</div>
                                                <div className="text-sm text-muted-foreground">Level {floor.level}</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Link href={adminCategoriesIndex().url + '?floor_id=' + floor.id}>
                                                    <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                                                        <Tag className="mr-1 h-3 w-3" />
                                                        {floor.room_categories_count ?? 0}
                                                    </Badge>
                                                </Link>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Description</span>
                                            <span>{floor.description ?? '—'}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Rooms</span>
                                            <span className="font-mono">{floor.room_count}</span>
                                        </div>
                                        <div className="flex gap-2 pt-1">
                                            <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(floor)}>
                                                <Pencil className="mr-1 h-4 w-4" /> Edit
                                            </Button>
                                            <Button variant="destructive" size="sm" className="flex-1" onClick={() => handleDelete(floor)}>
                                                <Trash2 className="mr-1 h-4 w-4" /> Delete
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {floors.length === 0 && (
                            <div className="md:hidden py-8 text-center text-muted-foreground">
                                No floors yet. Create your first floor to get started.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <DeleteConfirmationDialog
                open={deleteDialog.open}
                onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open, processing: false }))}
                onConfirm={confirmDelete}
                title="Delete Floor"
                description={`Are you sure you want to delete "${deleteDialog.floor?.name ?? ''}"? This will also remove all rooms on this floor. This action cannot be undone.`}
                processing={deleteDialog.processing}
            />
        </>
    );
}

FloorsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Floors',
            href: adminFloorsIndex(),
        },
    ],
};
