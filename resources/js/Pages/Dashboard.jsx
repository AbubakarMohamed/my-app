import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

export default function Dashboard(props) {
  const { userStats = [], genderStats = [], roleStats = [], summary = {} } = props;

  const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#06B6D4"]; 
  // Indigo, Green, Amber, Red, Cyan

  return (
    <AuthenticatedLayout
      auth={props.auth}
      errors={props.errors}
      header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard</h2>}
    >
      <Head title="Dashboard" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-indigo-500 to-indigo-400 text-white shadow-lg">
              <CardContent>
                <h3 className="text-lg font-semibold">Total Users</h3>
                <p className="text-2xl font-bold">{summary.totalUsers ?? 0}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-green-500 to-green-400 text-white shadow-lg">
              <CardContent>
                <h3 className="text-lg font-semibold">Active Users</h3>
                <p className="text-2xl font-bold">{summary.activeUsers ?? 0}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-red-500 to-red-400 text-white shadow-lg">
              <CardContent>
                <h3 className="text-lg font-semibold">Pending Users</h3>
                <p className="text-2xl font-bold">{summary.pendingUsers ?? 0}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-yellow-500 to-yellow-400 text-white shadow-lg">
              <CardContent>
                <h3 className="text-lg font-semibold">Suspended Users</h3>
                <p className="text-2xl font-bold">{summary.suspendedUsers ?? 0}</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

            {/* Users Growth Chart */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle>Users Growth (Last 6 Months)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={userStats}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="users" radius={[6, 6, 0, 0]}>
                      {userStats.map((entry, index) => (
                        <Cell key={`cell-bar-${index}`} fill={`rgba(79, 70, 229, ${0.6 + index * 0.1})`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gender Distribution */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle>Gender Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={genderStats}
                      dataKey="value"
                      nameKey="gender"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {genderStats.map((entry, index) => (
                        <Cell key={`cell-gender-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend verticalAlign="bottom" height={36}/>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* User Roles Distribution */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle>User Roles Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={roleStats}
                      dataKey="value"
                      nameKey="role"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {roleStats.map((entry, index) => (
                        <Cell key={`cell-role-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend verticalAlign="bottom" height={36}/>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
