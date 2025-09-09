import Authenticated from '@/Layouts/AuthenticatedLayout';

export default function Index({ auth, users }) {
    return (
        <Authenticated auth={auth} header={<h2 className="text-xl font-semibold leading-tight">Users</h2>}>
            <div className="bg-white shadow-sm rounded-lg p-6">
                <table className="min-w-full border">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border px-4 py-2">ID</th>
                            <th className="border px-4 py-2">Name</th>
                            <th className="border px-4 py-2">Email</th>
                            <th className="border px-4 py-2">Created At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="border px-4 py-2">{user.id}</td>
                                <td className="border px-4 py-2">{user.name}</td>
                                <td className="border px-4 py-2">{user.email}</td>
                                <td className="border px-4 py-2">{user.created_at}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Authenticated>
    );
}
