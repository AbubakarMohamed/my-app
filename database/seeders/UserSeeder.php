<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $roles = ['user', 'manager', 'admin'];
        $statuses = ['active', 'suspended', 'pending'];
        $departments = ['HR', 'IT', 'Finance', 'Operations', 'Sales'];

        // Update existing users with random demo data
        $users = User::all();
        foreach ($users as $user) {
            $user->update([
                'role' => $roles[array_rand($roles)],
                'status' => $statuses[array_rand($statuses)],
                'last_login' => Carbon::now()->subDays(rand(0, 30))->subHours(rand(0, 23)),
                'login_count' => rand(1, 100),
                'department' => $departments[array_rand($departments)],
            ]);
        }

        // Optionally, create extra demo users
        for ($i = 1; $i <= 5; $i++) {
            User::create([
                'name' => "Demo User {$i}",
                'email' => "demo{$i}@example.com",
                'password' => bcrypt('password'),
                'role' => $roles[array_rand($roles)],
                'status' => $statuses[array_rand($statuses)],
                'last_login' => Carbon::now()->subDays(rand(0, 30))->subHours(rand(0, 23)),
                'login_count' => rand(1, 100),
                'department' => $departments[array_rand($departments)],
                'remember_token' => Str::random(10),
            ]);
        }
    }
}
