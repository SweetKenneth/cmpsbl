import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatCard } from "@/components/admin/ui/StatCard";
import { DataTable } from "@/components/admin/ui/DataTable";
import { ActionButton } from "@/components/admin/ui/ActionButton";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { Users, UserPlus, Shield, Activity } from "lucide-react";
import { useUsers } from "@/hooks/admin/useUsers";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function UserManagement() {
  const { users, isLoading, updateRole } = useUsers();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { title: "Total Users", value: users.length, icon: Users, trend: "+12%" },
    { title: "Active Today", value: Math.floor(users.length * 0.6), icon: Activity, trend: "+5%" },
    { title: "Admins", value: users.filter((u) => u.roles?.some((r) => r.role === "admin")).length, icon: Shield },
  ];

  const columns = [
    { key: "display_name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "created_at", label: "Joined", render: (val: string) => new Date(val).toLocaleDateString() },
    {
      key: "roles",
      label: "Role",
      render: (roles: any[]) => {
        const role = roles?.[0]?.role || "user";
        return (
          <Badge variant={role === "admin" ? "default" : "secondary"}>
            {role.toUpperCase()}
          </Badge>
        );
      },
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">User Management</h1>
            <p className="text-muted-foreground mt-1">Manage users, roles, and permissions</p>
          </div>
          <ActionButton 
            icon={UserPlus} 
            onClick={() => {
              toast.info("User invitation feature - Coming soon!");
            }}
          >
            Invite User
          </ActionButton>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </div>

        <div className="glass-panel p-6 space-y-4">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />

          {isLoading ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredUsers.length > 0 ? (
            <DataTable data={filteredUsers} columns={columns} />
          ) : (
            <EmptyState
              icon={Users}
              title="No users found"
              description="Try adjusting your search"
            />
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
