import React, { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { Menu } from "@headlessui/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { Toaster, toast } from "sonner";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function UsersIndex({ auth, users: initialUsers, errors }) {
  const [users, setUsers] = useState(initialUsers);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [saveStatus, setSaveStatus] = useState("idle");
  const [sorting, setSorting] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const columnHelper = createColumnHelper();

  // ===== Add User =====
  const handleAddUserSubmit = (e) => {
    e.preventDefault();
    setSaveStatus("loading");

    router.post(route("users.store"), formData, {
      onSuccess: (page) => {
        // Inertia returns updated props, fetch the latest users list
        const updatedUsers = page.props.users ?? [];
        setUsers(updatedUsers);
        toast.success("User added successfully ✅");
        setIsAddDialogOpen(false);
        setFormData({ name: "", email: "", password: "" });
        setSaveStatus("idle");
      },
      
      onError: () => {
        toast.error("Failed to add user ❌");
        setSaveStatus("idle");
      },
    });
  };

  // ===== Edit User =====
  const handleEditClick = (user) => {
    setSelectedUser(user);
    setFormData({ name: user.name, email: user.email, password: "" });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setSaveStatus("loading");

    router.patch(route("users.update", selectedUser.id), formData, {
      onSuccess: (page) => {
        // Update user in table
        setUsers((prev) =>
          prev.map((u) => (u.id === selectedUser.id ? { ...u, ...formData } : u))
        );
        toast.success("User updated successfully ✅");
        setIsEditDialogOpen(false);
        setSaveStatus("idle");
      },
      onError: () => {
        toast.error("Failed to update user ❌");
        setSaveStatus("idle");
      },
    });
  };

  // ===== Delete User =====
  const handleDelete = (user) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    router.delete(route("users.destroy", user.id), {
      onSuccess: () => {
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
        toast.success("User deleted successfully ✅");
      },
      onError: () => {
        toast.error("Failed to delete user ❌");
      },
    });
  };

  // ===== Columns =====
  const columns = [
    columnHelper.accessor("id", { header: "ID" }),
    columnHelper.accessor("name", { header: "Name" }),
    columnHelper.accessor("email", { header: "Email" }),
    columnHelper.accessor("created_at", {
      header: "Created At",
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    }),
    columnHelper.display({
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <Menu as="div" className="relative inline-block text-left">
          <Menu.Button className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300">
            •••
          </Menu.Button>
          <Menu.Items className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-md shadow-lg z-50">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => {
                    setSelectedUser(row.original);
                    setIsViewDialogOpen(true);
                  }}
                  className={`${active ? "bg-gray-100" : ""} block w-full text-left px-4 py-2 text-sm`}
                >
                  View
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => handleEditClick(row.original)}
                  className={`${active ? "bg-gray-100" : ""} block w-full text-left px-4 py-2 text-sm`}
                >
                  Edit
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => handleDelete(row.original)}
                  className={`${active ? "bg-gray-100" : ""} block w-full text-left px-4 py-2 text-sm text-red-600`}
                >
                  Delete
                </button>
              )}
            </Menu.Item>
          </Menu.Items>
        </Menu>
      ),
    }),
  ];

  // ===== Filter users =====
  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    return users.filter((user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, users]);

  // ===== Table =====
  const table = useReactTable({
    data: filteredUsers,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // ===== Export Excel / PDF =====
  const now = new Date();
  const exportTimestamp = now.toLocaleString();

  const exportExcel = () => {
    const wsData = [
      [`Generated At: ${exportTimestamp}`],
      [],
      ["ID", "Name", "Email", "Created At"],
      ...filteredUsers.map((u) => [
        u.id,
        u.name,
        u.email,
        new Date(u.created_at).toLocaleString(),
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, `users_${now.getTime()}.xlsx`);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Users List", 14, 16);
    doc.setFontSize(10);
    doc.text(`Generated At: ${exportTimestamp}`, 14, 22);
    const tableColumn = ["ID", "Name", "Email", "Created At"];
    const tableRows = filteredUsers.map((u) => [
      u.id,
      u.name,
      u.email,
      new Date(u.created_at).toLocaleString(),
    ]);
    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 35 });
    doc.save(`users_${now.getTime()}.pdf`);
  };

  return (
    <AuthenticatedLayout
      auth={auth}
      errors={errors}
      header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Users</h2>}
    >
      <Head title="Users" />
      <Toaster richColors position="top-right" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">

            {/* Search + Export + Add User */}
            <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-1/2 border border-gray-300 rounded-md px-4 py-2 focus:ring focus:ring-indigo-200"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setIsAddDialogOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add User
                </button>
                <button
                  onClick={exportExcel}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Export Excel
                </button>
                <button
                  onClick={exportPDF}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Export PDF
                </button>
              </div>
            </div>

            {/* Table */}
            <table className="table-auto border-collapse border border-gray-300 w-full">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="border border-gray-300 px-4 py-2 text-left select-none">
                        <div className="flex items-center space-x-2">
                          <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                          {header.column.getCanSort() && (
                            <button
                              className="cursor-pointer"
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              {header.column.getIsSorted() === "asc" ? "↑" : header.column.getIsSorted() === "desc" ? "↓" : "↑↓"}
                            </button>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="border border-gray-300 px-4 py-2">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* View Dialog */}
            {isViewDialogOpen && selectedUser && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                  <h2 className="text-xl font-bold mb-4">User Details</h2>
                  <p><strong>ID:</strong> {selectedUser.id}</p>
                  <p><strong>Name:</strong> {selectedUser.name}</p>
                  <p><strong>Email:</strong> {selectedUser.email}</p>
                  <p><strong>Created At:</strong> {new Date(selectedUser.created_at).toLocaleString()}</p>
                  <button
                    className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    onClick={() => setIsViewDialogOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {/* Edit Dialog */}
            {isEditDialogOpen && selectedUser && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <form onSubmit={handleEditSubmit} className="bg-white p-6 rounded-lg shadow-lg w-96">
                  <h2 className="text-xl font-bold mb-4">Edit User</h2>
                  <label className="block mb-2">
                    Name:
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full border border-gray-300 rounded px-2 py-1 mt-1"
                    />
                  </label>
                  <label className="block mb-2">
                    Email:
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full border border-gray-300 rounded px-2 py-1 mt-1"
                    />
                  </label>
                  <label className="block mb-2">
                    Password: <span className="text-sm text-gray-400">(leave empty to keep current)</span>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full border border-gray-300 rounded px-2 py-1 mt-1"
                    />
                  </label>
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                      onClick={() => setIsEditDialogOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      disabled={saveStatus === "loading"}
                    >
                      {saveStatus === "loading" ? "Saving..." : "Save"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Add Dialog */}
            {isAddDialogOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <form onSubmit={handleAddUserSubmit} className="bg-white p-6 rounded-lg shadow-lg w-96">
                  <h2 className="text-xl font-bold mb-4">Add New User</h2>
                  <label className="block mb-2">
                    Name:
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full border border-gray-300 rounded px-2 py-1 mt-1"
                      required
                    />
                  </label>
                  <label className="block mb-2">
                    Email:
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full border border-gray-300 rounded px-2 py-1 mt-1"
                      required
                    />
                  </label>
                  <label className="block mb-2">
                    Password:
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full border border-gray-300 rounded px-2 py-1 mt-1"
                      required
                    />
                  </label>
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      disabled={saveStatus === "loading"}
                    >
                      {saveStatus === "loading" ? "Saving..." : "Add"}
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
