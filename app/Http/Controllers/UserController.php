<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    // List all users
    public function index()
    {
        $users = User::select(
            'id',
            'name',
            'email',
            'role',
            'status',
            'gender'
        )->latest()->get();

        // Aggregate stats for dashboard charts
        $roleStats = User::select('role', DB::raw('COUNT(*) as count'))
            ->groupBy('role')
            ->pluck('count', 'role');

        $statusStats = User::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        $departmentStats = User::select('department', DB::raw('COUNT(*) as count'))
            ->groupBy('department')
            ->pluck('count', 'department');

        return Inertia::render('Users/Index', [
            'users'           => $users,
            'roleStats'       => $roleStats,
            'statusStats'     => $statusStats,
            'departmentStats' => $departmentStats,
        ]);
    }

    // Store new user
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
            'role'     => ['nullable', 'string'],
            'status'   => ['nullable', 'string'],
            'gender' => ['nullable', 'string'],
        ]);

        User::create([
            'name'       => $validated['name'],
            'email'      => $validated['email'],
            'password'   => bcrypt($validated['password']),
            'role'       => $validated['role'] ?? 'user',
            'status'     => $validated['status'] ?? 'active',
            'gender'     => $validated['gender'] ?? 'male',
        ]);

        return redirect()->route('users.index')
            ->with('success', 'User added successfully.');
    }

    // Update existing user
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'password' => ['nullable', 'string', 'min:6'],
            'role'     => ['nullable', 'string'],
            'status'   => ['nullable', 'string'],
            'gender' => ['nullable', 'string'],
        ]);

        $data = [
            'name'       => $validated['name'],
            'email'      => $validated['email'],
            'role'       => $validated['role'] ?? $user->role,
            'status'     => $validated['status'] ?? $user->status,
            'gender' => $validated['gender'] ?? $user->gender,
        ];

        if (!empty($validated['password'])) {
            $data['password'] = bcrypt($validated['password']);
        }

        $user->update($data);

        return redirect()->route('users.index')
            ->with('success', 'User updated successfully.');
    }

    // Delete user
    public function destroy(User $user)
    {
        $user->delete();

        return redirect()->route('users.index')
            ->with('success', 'User deleted successfully.');
    }
}
