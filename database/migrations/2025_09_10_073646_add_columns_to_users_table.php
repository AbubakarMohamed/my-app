<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            // Add new creative dashboard columns
            $table->string('role')->default('user'); // user, manager, admin
            $table->string('status')->default('active'); // active, suspended, pending
            $table->timestamp('last_login')->nullable(); // track last login
            $table->integer('login_count')->default(0); // track number of logins
            $table->string('department')->nullable(); // optional department
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            // Remove added columns if migration is rolled back
            $table->dropColumn(['role', 'status', 'last_login', 'login_count', 'department']);
        });
    }
};
