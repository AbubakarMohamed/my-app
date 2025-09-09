import { useEffect, useState } from 'react';
import { Inertia } from '@inertiajs/inertia';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    
    useEffect(() => {
        // Fetch the users from the API
        fetch('/api/users')
            .then((response) => response.json())
            .then((data) => setUsers(data))
            .catch((error) => console.error('Error fetching users:', error));
    }, []);

    return (
        <div className="py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold mb-4">Users</h1>
            <table className="min-w-full bg-white border border-gray-300 shadow-md">
                <thead>
                    <tr>
                        <th className="px-4 py-2 text-left">ID</th>
                        <th className="px-4 py-2 text-left">Name</th>
                        <th className="px-4 py-2 text-left">Email</th>
                        <th className="px-4 py-2 text-left">Created At</th>
                    </tr>
                </thead>
                <tbody>
                    {users.length > 0 ? (
                        users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-100">
                                <td className="px-4 py-2">{user.id}</td>
                                <td className="px-4 py-2">{user.name}</td>
                                <td className="px-4 py-2">{user.email}</td>
                                <td className="px-4 py-2">{new Date(user.created_at).toLocaleDateString()}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="px-4 py-2 text-center">No users found</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
