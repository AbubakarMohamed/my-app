<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        // Users created per month (last 6 months)
        $userStats = User::selectRaw('DATE_FORMAT(created_at, "%b %Y") as month, COUNT(*) as users')
            ->where('created_at', '>=', now()->subMonths(6))
            ->groupBy('month')
            ->orderByRaw('MIN(created_at)')
            ->get();

        // Gender stats
        $genderStats = User::select('gender', DB::raw('COUNT(*) as value'))
            ->groupBy('gender')
            ->get()
            ->map(function ($item) {
                return [
                    'gender' => ucfirst($item->gender ?? 'Unknown'),
                    'value'  => $item->value,
                ];
            });

        // Users per role (for PieChart)
        $roleStats = User::select('role', DB::raw('COUNT(*) as value'))
            ->groupBy('role')
            ->get()
            ->map(function ($item) {
                return [
                    'role'  => ucfirst($item->role ?? 'Unknown'),
                    'value' => $item->value,
                ];
            });

        // Active vs inactive users
        $statusStats = [
            [
                'status' => 'Active',
                'value'  => User::where('status', 'active')->count(),
            ],
            [
                'status' => 'Pending',
                'value'  => User::where('status', 'pending')->count(),
            ],
            [
                'status' => 'Suspended',
                'value'  => User::where('status', 'suspended')->count(),
            ],
        ];

        // Summary cards (fetched live from DB)
        $summary = [
            'totalUsers'      => User::count(),
            'activeUsers'     => User::where('status', 'active')->count(),
            'pendingUsers'    => User::where('status', 'pending')->count(),
            'suspendedUsers'  => User::where('status', 'suspended')->count(),
        ];

        return Inertia::render('Dashboard', [
            'userStats'   => $userStats,
            'genderStats' => $genderStats,
            'roleStats'   => $roleStats,
            'statusStats' => $statusStats,
            'summary'     => $summary,
        ]);
    }
}
