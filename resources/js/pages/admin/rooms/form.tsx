import { useRef, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, LoaderCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InputError from '@/components/input-error';
import { index as adminRoomsIndex, update as adminRoomsUpdate } from '@/routes/admin/rooms';
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
    floor_id: number;
    room_category_id: number;
    beds: string | null;
    amenities: string[] | null;
    image: string | null;
}

interface Props {
    room: Room | null;
    floors: Floor[];
    categories: RoomCategory[];
}

export default function RoomForm({ room, floors, categories }: Props) {
    const isEditing = !!room;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(
        room?.image ? '/storage/' + room.image : null
    );

    const { data, setData, post, processing, errors } = useForm({
        number: room?.number ?? '',
        floor_id: room?.floor_id ?? 0,
        room_category_id: room?.room_category_id ?? 0,
        base_rate: room?.base_rate ?? '',
        capacity: room?.capacity ?? 2,
        status: room?.status ?? 'available',
        beds: room?.beds ?? '',
        amenities: room?.amenities ? JSON.stringify(room.amenities) : '[]',
        image: undefined as File | undefined,
        remove_image: false,
        _method: isEditing ? ('PATCH' as const) : undefined,
    });

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
            ? adminRoomsUpdate({ room: room!.id }).url
            : adminRoomsIndex().url;

        post(url, {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title={isEditing ? 'Edit Room' : 'Create Room'} />

            <div className="flex h-full flex-1 flex-col items-center gap-4 overflow-x-auto rounded-xl p-4">
                <div className="w-full max-w-2xl">
                    <div className="flex items-center gap-4">
                        <Link href={adminRoomsIndex().url}>
                            <Button variant="ghost" size="icon" className="h-9 w-9">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                {isEditing ? 'Edit Room' : 'Create Room'}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {isEditing ? 'Update room details' : 'Add a new room to the resort'}
                            </p>
                        </div>
                    </div>
                </div>

                <Card className="w-full max-w-2xl">
                    <CardHeader>
                        <CardTitle>Room Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="number">Room Number</Label>
                                    <Input
                                        id="number"
                                        value={data.number}
                                        onChange={(e) => setData('number', e.target.value)}
                                        placeholder="e.g. 101"
                                    />
                                    <InputError message={errors.number} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="beds">Beds</Label>
                                    <Input
                                        id="beds"
                                        value={data.beds}
                                        onChange={(e) => setData('beds', e.target.value)}
                                        placeholder="e.g. 1 King"
                                    />
                                    <InputError message={errors.beds} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
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

                                <div className="space-y-2">
                                    <Label htmlFor="room_category_id">Category</Label>
                                    <Select
                                        value={String(data.room_category_id)}
                                        onValueChange={(val) => setData('room_category_id', Number(val))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat.id} value={String(cat.id)}>
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.room_category_id} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="base_rate">Base Rate ($)</Label>
                                    <Input
                                        id="base_rate"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.base_rate}
                                        onChange={(e) => setData('base_rate', e.target.value)}
                                        placeholder="e.g. 145.00"
                                    />
                                    <InputError message={errors.base_rate} />
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
                                {isEditing && !imageFile && room?.image && !imagePreview && (
                                    <p className="text-xs text-muted-foreground">Image will be removed on save</p>
                                )}
                                {isEditing && !imageFile && room?.image && imagePreview && (
                                    <p className="text-xs text-muted-foreground">Leave empty to keep current image</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={data.status}
                                    onValueChange={(val) => setData('status', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="available">Available</SelectItem>
                                        <SelectItem value="occupied">Occupied</SelectItem>
                                        <SelectItem value="maintenance">Maintenance</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.status} />
                            </div>

                            <div className="flex items-center gap-2 pt-4">
                                <Button type="submit" disabled={processing}>
                                    {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                    {isEditing ? 'Update Room' : 'Create Room'}
                                </Button>
                                <Link href={adminRoomsIndex().url}>
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

RoomForm.layout = {
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
