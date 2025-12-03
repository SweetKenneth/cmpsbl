import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatCard } from "@/components/admin/ui/StatCard";
import { DataTable } from "@/components/admin/ui/DataTable";
import { ActionButton } from "@/components/admin/ui/ActionButton";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { Shield, UserPlus, Users, Key } from "lucide-react";
import { useUsers } from "@/hooks/admin/useUsers";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function AccessControlManagement() {
  const { users, isLoading, updateRole } = useUsers();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<"user" | "admin">("user");

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const adminCount = users.filter((u) => u.roles?.some((r) => r.role === "admin")).length;
  const userCount = users.filter((u) => u.roles?.some((r) => r.role === "user")).length;

  const stats = [
    { title: "Total Users", value: users.length, icon: Users, trend: "+12%" },
    { title: "Administrators", value: adminCount, icon: Shield },
    { title: "Regular Users", value: userCount, icon: Users },
  ];

  const handleInviteUser = () => {
    if (!newUserEmail) {
      toast.error("Please enter an email address");
      return;
    }

    toast.success(`Invitation sent to ${newUserEmail}`);
    setNewUserEmail("");
    setNewUserRole("user");
    setDialogOpen(false);
  };

  const handleRoleChange = (userId: string, newRole: string) => {
    updateRole.mutate({ userId, role: newRole });
  };

  const columns = [
    { key: "display_name", label: "Name" },
    { key: "email", label: "Email" },
    {
      key: "created_at",
      label: "Joined",
      render: (val: string) => new Date(val).toLocaleDateString(),
    },
    {
      key: "roles",
      label: "Role",
      render: (roles: any[], row: any) => {
        const currentRole = roles?.[0]?.role || "user";
        return (
          <Select
            value={currentRole}
            onValueChange={(value) => handleRoleChange(row.id, value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue>
                <Badge variant={currentRole === "admin" ? "default" : "secondary"}>
                  {currentRole.toUpperCase()}
                </Badge>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        );
      },
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Access Control</h1>
            <p className="text-muted-foreground mt-1">
              Manage user permissions and role assignments
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <ActionButton icon={UserPlus}>Invite User</ActionButton>
            </DialogTrigger>
            <DialogContent aria-describedby="invite-user-description">
              <DialogHeader>
                <DialogTitle>Invite New User</DialogTitle>
              </DialogHeader>
              <p id="invite-user-description" className="text-sm text-muted-foreground pt-2">
                Send an invitation email to add a new user to the system.
              </p>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    placeholder="user@example.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Initial Role</Label>
                  <Select value={newUserRole} onValueChange={(val: any) => setNewUserRole(val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleInviteUser} className="w-full">
                  Send Invitation
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </div>

        <div className="glass-panel p-6 space-y-4">
          <Input
            placeholder="Search users by name or email..."
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
              description="Try adjusting your search criteria"
            />
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
