import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/input-error';
import { index as adminFloorsIndex, update as adminFloorsUpdate } from '@/routes/admin/floors';
import { dashboard } from '@/routes';

interface Floor {
    id: number;
    name: string;
    level: number;
    description: string | null;
}

interface Props {
    floor: Floor | null;
}

export default function FloorForm({ floor }: Props) {
    const isEditing = !!floor;

    const { data, setData, post, patch, processing, errors } = useForm({
        name: floor?.name ?? '',
        level: floor?.level ?? 1,
        description: floor?.description ?? '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            patch(adminFloorsUpdate({ floor: floor!.id }).url, {
                preserveScroll: true,
            });
        } else {
            post(adminFloorsIndex().url, {
                preserveScroll: true,
            });
        }
    };

    return (
        <>
            <Head title={isEditing ? 'Edit Floor' : 'Create Floor'} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Link href={adminFloorsIndex().url}>
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {isEditing ? 'Edit Floor' : 'Create Floor'}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {isEditing ? 'Update floor details' : 'Add a new floor to the resort'}
                        </p>
                    </div>
                </div>

                <Card className="max-w-lg">
                    <CardHeader>
                        <CardTitle>Floor Details</CardTitle>
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
                                        placeholder="e.g. Ground Floor"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="level">Level</Label>
                                    <Input
                                        id="level"
                                        type="number"
                                        min={1}
                                        value={data.level}
                                        onChange={(e) => setData('level', Number(e.target.value))}
                                    />
                                    <InputError message={errors.level} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Optional description of this floor..."
                                    className="min-h-[100px]"
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <Button type="submit" disabled={processing}>
                                    {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                    {isEditing ? 'Update Floor' : 'Create Floor'}
                                </Button>
                                <Link href={adminFloorsIndex().url}>
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

FloorForm.layout = {
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
