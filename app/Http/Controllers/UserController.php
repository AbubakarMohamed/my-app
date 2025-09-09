<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    // List all users
    public function index()
    {
        $users = User::select('id', 'name', 'email', 'created_at')->get();

        return Inertia::render('Users/Index', [
            'users' => $users,
        ]);
    }

    // Add new user (Inertia-friendly)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
        ]);

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => bcrypt($validated['password']),
        ]);

        // If the request is an Inertia request, return the updated Inertia page
        if ($request->header('X-Inertia')) {
            $users = User::select('id', 'name', 'email', 'created_at')->get();
            return Inertia::render('Users/Index', [
                'users' => $users,
            ])->with('success', 'User added successfully.');
        }

        // Otherwise, normal redirect
        return redirect()->route('users.index')
                         ->with('success', 'User added successfully.');
    }

    // Update existing user
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name'  => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,' . $user->id],
        ]);

        $user->update($validated);

        return redirect()->route('users.index')
            ->with('success', 'User updated successfully.');
    }

    // Optional: delete user
    public function destroy(User $user)
    {
        $user->delete();

        return redirect()->route('users.index')
            ->with('success', 'User deleted successfully.');
    }
}
