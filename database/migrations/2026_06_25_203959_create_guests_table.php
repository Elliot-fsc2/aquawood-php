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
        Schema::create('guests', function (Blueprint $table) {
            $table->id();
            $table->string('phone')->nullable();
            $table->string('country')->nullable();
            $table->string('loyalty_tier')->default('Bronze');
            $table->integer('points')->default(0);
            $table->integer('total_stays')->default(0);
            $table->decimal('total_spent', 12, 2)->default(0);
            $table->json('preferences')->default('[]');
            $table->date('last_stay')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('guests');
    }
};
