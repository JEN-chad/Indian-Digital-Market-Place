import React, { useEffect, useState } from "react";
import { UserTable } from "../../../components/admin/user-table.tsx";
import { getAdminUsers, suspendUser } from "../../../actions/admin.ts";

export function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await getAdminUsers();
      if (res.success) {
        setUsers(res.users);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSuspend = async (id: string, reason: string) => {
    await suspendUser(id, reason);
    fetchUsers();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif italic font-bold">User Management</h2>
        <p className="text-sm text-gray-500 mt-1">Manage accounts, roles, and platform access.</p>
      </div>

      <UserTable 
        data={users} 
        isLoading={isLoading} 
        onSuspend={handleSuspend}
      />
    </div>
  );
}
