import { useRef, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, LoaderCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InputError from '@/components/input-error';
import { index as adminCategoriesIndex, update as adminCategoriesUpdate } from '@/routes/admin/categories';
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
    amenities: string | null;
    image: string | null;
}

interface Props {
    category: Category | null;
    floors: Floor[];
}

export default function CategoryForm({ category, floors }: Props) {
    const isEditing = !!category;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(
        category?.image ? '/storage/' + category.image : null
    );

    const parseAmenities = (raw: string | string[] | null | undefined): string[] => {
        if (!raw) return [];
        if (Array.isArray(raw)) return raw;
        try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    };

    const [amenityItems, setAmenityItems] = useState<string[]>(
        parseAmenities(category?.amenities)
    );
    const [newAmenity, setNewAmenity] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        name: category?.name ?? '',
        floor_id: category?.floor_id ?? (floors.length > 0 ? floors[0].id : 0),
        base_price: category?.base_price ?? '',
        capacity: category?.capacity ?? 2,
        amenities: JSON.stringify(parseAmenities(category?.amenities)),
        image: undefined as File | undefined,
        remove_image: false,
        _method: isEditing ? ('PATCH' as const) : undefined,
    });

    const addAmenity = () => {
        const trimmed = newAmenity.trim();
        if (!trimmed) return;
        const updated = [...amenityItems, trimmed];
        setAmenityItems(updated);
        setData('amenities', JSON.stringify(updated));
        setNewAmenity('');
    };

    const removeAmenity = (index: number) => {
        const updated = amenityItems.filter((_, i) => i !== index);
        setAmenityItems(updated);
        setData('amenities', JSON.stringify(updated));
    };

    const handleAmenityKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addAmenity();
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setImageFile(file);

        if (file) {
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const clearImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setData('image', undefined);
        setData('remove_image', true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (imageFile) {
            setData('image', imageFile);
            setData('remove_image', false);
        }

        const url = isEditing
            ? adminCategoriesUpdate({ category: category!.id }).url
            : adminCategoriesIndex().url;

        post(url, {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title={isEditing ? 'Edit Category' : 'Create Category'} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Link href={adminCategoriesIndex().url}>
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {isEditing ? 'Edit Category' : 'Create Category'}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {isEditing ? 'Update category details' : 'Add a new room category'}
                        </p>
                    </div>
                </div>

                <Card className="max-w-lg">
                    <CardHeader>
                        <CardTitle>Category Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g. Deluxe Suite"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="floor_id">Floor</Label>
                                    <Select
                                        value={String(data.floor_id)}
                                        onValueChange={(val) => setData('floor_id', Number(val))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select floor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {floors.map((floor) => (
                                                <SelectItem key={floor.id} value={String(floor.id)}>
                                                    {floor.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.floor_id} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="base_price">Base Price ($)</Label>
                                    <Input
                                        id="base_price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.base_price}
                                        onChange={(e) => setData('base_price', e.target.value)}
                                        placeholder="e.g. 199.00"
                                    />
                                    <InputError message={errors.base_price} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="capacity">Capacity</Label>
                                    <Input
                                        id="capacity"
                                        type="number"
                                        min={1}
                                        value={data.capacity}
                                        onChange={(e) => setData('capacity', Number(e.target.value))}
                                    />
                                    <InputError message={errors.capacity} />
                                </div>

                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="image">Image</Label>
                                <div className="flex items-center gap-3">
                                    <Input
                                        id="image"
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handleImageChange}
                                        className="file:text-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-primary/20"
                                    />
                                    {imagePreview && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                                            onClick={clearImage}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                                <InputError message={errors.image} />
                                {imagePreview && (
                                    <div className="mt-2 h-32 w-48 overflow-hidden rounded-md border bg-muted">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                )}
                                {isEditing && !imageFile && category?.image && !imagePreview && (
                                    <p className="text-xs text-muted-foreground">Image will be removed on save</p>
                                )}
                                {isEditing && !imageFile && category?.image && imagePreview && (
                                    <p className="text-xs text-muted-foreground">Leave empty to keep current image</p>
                                )}
                            </div>

                            <div className="space-y-3">
                                <Label>Amenities</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={newAmenity}
                                        onChange={(e) => setNewAmenity(e.target.value)}
                                        onKeyDown={handleAmenityKeyDown}
                                        placeholder="e.g. WiFi, Smart TV, Pool..."
                                    />
                                    <Button type="button" variant="secondary" onClick={addAmenity} className="shrink-0">
                                        Add
                                    </Button>
                                </div>
                                {amenityItems.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {amenityItems.map((item, index) => (
                                            <div
                                                key={index}
                                                className="inline-flex items-center gap-1.5 rounded-full border bg-secondary px-3 py-1 text-sm"
                                            >
                                                <span>{item}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeAmenity(index)}
                                                    className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No amenities added yet.</p>
                                )}
                                <InputError message={errors.amenities} />
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <Button type="submit" disabled={processing}>
                                    {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                    {isEditing ? 'Update Category' : 'Create Category'}
                                </Button>
                                <Link href={adminCategoriesIndex().url}>
                                    <Button variant="outline" type="button">
                                        Cancel
                                    </Button>
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

CategoryForm.layout = {
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
