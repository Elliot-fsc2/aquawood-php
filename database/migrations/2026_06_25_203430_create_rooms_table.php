<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->string('number');
            $table->foreignId('floor_id')->constrained('floors')->onDelete('cascade');
            $table->foreignId('room_category_id')->nullable()->constrained('room_categories')->onDelete('set null');
            $table->string('type');
            $table->decimal('base_rate', 12, 2)->default(0);
            $table->string('status')->default('available');
            $table->string('beds')->nullable();
            $table->integer('capacity')->default(2);
            $table->json('amenities')->default('[]');
            $table->string('image')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};
