<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCategoryRequest;
use App\Http\Requests\Admin\UpdateCategoryRequest;
use App\Models\Floor;
use App\Models\RoomCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    /**
     * Display a listing of room categories.
     */
    public function index(Request $request): Response
    {
        $categories = RoomCategory::with('floor')
            ->when($request->filled('floor_id'), fn ($q) => $q->where('floor_id', $request->floor_id))
            ->latest()
            ->get();

        return Inertia::render('admin/categories/index', [
            'categories' => $categories,
            'floors' => Floor::orderBy('level')->get(),
            'selectedFloor' => $request->floor_id ? (int) $request->floor_id : null,
        ]);
    }

    /**
     * Show the form for creating a new room category.
     */
    public function create(): Response
    {
        return Inertia::render('admin/categories/form', [
            'category' => null,
            'floors' => Floor::orderBy('level')->get(),
        ]);
    }

    /**
     * Store a newly created room category in storage.
     */
    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('images/categories', 'public');
        }

        RoomCategory::create($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Category created.')]);

        return to_route('admin.categories.index');
    }

    /**
     * Show the form for editing the specified room category.
     */
    public function edit(RoomCategory $category): Response
    {
        return Inertia::render('admin/categories/form', [
            'category' => $category,
            'floors' => Floor::orderBy('level')->get(),
        ]);
    }

    /**
     * Update the specified room category in storage.
     */
    public function update(UpdateCategoryRequest $request, RoomCategory $category): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            // Delete old image
            if ($category->image) {
                Storage::disk('public')->delete($category->image);
            }

            $data['image'] = $request->file('image')->store('images/categories', 'public');
        } elseif ($request->boolean('remove_image')) {
            // User explicitly requested to remove the image
            if ($category->image) {
                Storage::disk('public')->delete($category->image);
            }

            $data['image'] = null;
        } else {
            unset($data['image']);
        }

        $category->update($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Category updated.')]);

        return to_route('admin.categories.index');
    }

    /**
     * Remove the specified room category from storage.
     */
    public function destroy(RoomCategory $category): RedirectResponse
    {
        $category->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Category deleted.')]);

        return to_route('admin.categories.index');
    }
}
