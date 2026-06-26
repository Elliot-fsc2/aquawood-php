import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import DeleteConfirmationDialog from '@/components/delete-confirmation-dialog';
import { index as adminCategoriesIndex, create as adminCategoriesCreate, edit as adminCategoriesEdit } from '@/routes/admin/categories';
import { dashboard } from '@/routes';

interface Floor {
    id: number;
    name: string;
    level: number;
}

interface Category {
    id: number;
    name: string;
    floor_id: number;
    base_price: string;
    capacity: number;
    amenities: string[] | null;
    image: string | null;
    floor: Floor | null;
}

interface Props {
    categories: Category[];
    floors: Floor[];
    selectedFloor: number | null;
}

export default function CategoriesIndex({ categories, floors, selectedFloor }: Props) {
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; category: Category | null; processing: boolean }>({
        open: false,
        category: null,
        processing: false,
    });

    const handleDelete = (category: Category) => {
        setDeleteDialog({ open: true, category, processing: false });
    };

    const confirmDelete = () => {
        if (!deleteDialog.category) return;

        setDeleteDialog((prev) => ({ ...prev, processing: true }));

        router.delete(adminCategoriesIndex().url + '/' + deleteDialog.category.id, {
            onFinish: () => setDeleteDialog({ open: false, category: null, processing: false }),
        });
    };

    const handleEdit = (category: Category) => {
        router.get(adminCategoriesEdit({ category: category.id }).url);
    };

    const handleFloorFilter = (floorId: string) => {
        if (floorId === 'all') {
            router.get(adminCategoriesIndex().url);
        } else {
            router.get(adminCategoriesIndex().url + '?floor_id=' + floorId);
        }
    };

    return (
        <>
            <Head title="Room Categories" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Room Categories</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage room categories and pricing
                        </p>
                    </div>
                    <Link href={adminCategoriesCreate()}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Category
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>All Categories</CardTitle>
                            <div className="w-56">
                                <Select
                                    value={selectedFloor ? String(selectedFloor) : 'all'}
                                    onValueChange={handleFloorFilter}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by floor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Floors</SelectItem>
                                        {floors.map((floor) => (
                                            <SelectItem key={floor.id} value={String(floor.id)}>
                                                {floor.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="hidden md:block rounded-md border">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="py-3 px-4 text-left font-medium">Name</th>
                                        <th className="py-3 px-4 text-left font-medium">Floor</th>
                                        <th className="py-3 px-4 text-right font-medium">Base Price</th>
                                        <th className="py-3 px-4 text-center font-medium">Capacity</th>
                                        <th className="py-3 px-4 text-center font-medium">Image</th>
                                        <th className="py-3 px-4 text-center font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.map((category) => (
                                        <tr key={category.id} className="border-b last:border-0 hover:bg-muted/30">
                                            <td className="py-3 px-4 font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Tag className="h-4 w-4 text-muted-foreground" />
                                                    {category.name}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-muted-foreground">
                                                {category.floor?.name ?? '—'}
                                            </td>
                                            <td className="py-3 px-4 text-right font-mono">
                                                ₱{parseFloat(category.base_price).toFixed(2)}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                {category.capacity}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                {category.image ? (
                                                    <div className="flex justify-center">
                                                        <div className="h-10 w-14 overflow-hidden rounded border bg-muted">
                                                            <img
                                                                src={'/storage/' + category.image}
                                                                alt={category.name}
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
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => handleEdit(category)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                                        onClick={() => handleDelete(category)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {categories.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-8 text-center text-muted-foreground">
                                                No categories yet. Create your first category to get started.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {categories.length > 0 && (
                            <div className="md:hidden space-y-3">
                                {categories.map((category) => (
                                    <div key={category.id} className="rounded-lg border p-4 space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2">
                                                <Tag className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-semibold text-lg">{category.name}</span>
                                            </div>
                                            <span className="font-mono font-medium">₱{parseFloat(category.base_price).toFixed(2)}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Floor</span>
                                            <span>{category.floor?.name ?? '—'}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Capacity</span>
                                            <span>{category.capacity} guest{category.capacity !== 1 ? 's' : ''}</span>
                                        </div>
                                        <div className="flex gap-2 pt-1">
                                            <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(category)}>
                                                <Pencil className="mr-1 h-4 w-4" /> Edit
                                            </Button>
                                            <Button variant="destructive" size="sm" className="flex-1" onClick={() => handleDelete(category)}>
                                                <Trash2 className="mr-1 h-4 w-4" /> Delete
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {categories.length === 0 && (
                            <div className="md:hidden py-8 text-center text-muted-foreground">
                                No categories yet. Create your first category to get started.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <DeleteConfirmationDialog
                open={deleteDialog.open}
                onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open, processing: false }))}
                onConfirm={confirmDelete}
                title="Delete Category"
                description={`Are you sure you want to delete "${deleteDialog.category?.name ?? ''}"? This action cannot be undone.`}
                processing={deleteDialog.processing}
            />
        </>
    );
}

CategoriesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Categories',
            href: adminCategoriesIndex(),
        },
    ],
};
