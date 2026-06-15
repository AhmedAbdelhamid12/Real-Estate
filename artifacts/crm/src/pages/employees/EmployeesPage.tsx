import { useState } from "react";
import { useListUsers, apiFetch, getListUsersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RoleBadge } from "@/components/shared/RoleBadge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Mail, Phone, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/contexts/i18nContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  title?: string | null;
  avatarUrl?: string | null;
  isOnline?: boolean;
}

const ROLES = ["ceo", "admin", "director", "team_leader", "sales"] as const;

export function EmployeesPage() {
  const { t } = useI18n();
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const { data: users = [], isLoading } = useListUsers({ status: "active" });

  const isAdmin = currentUser && ["ceo", "admin"].includes(currentUser.role);

  const [editingUser, setEditingUser] = useState<Employee | null>(null);
  const [editForm, setEditForm] = useState({ name: "", phone: "", title: "", role: "" });
  const [editLoading, setEditLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  function openEdit(u: Employee) {
    setEditingUser(u);
    setEditForm({ name: u.name, phone: u.phone ?? "", title: u.title ?? "", role: u.role });
  }

  async function handleEdit() {
    if (!editingUser) return;
    setEditLoading(true);
    try {
      const res = await apiFetch(`/api/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          phone: editForm.phone || null,
          title: editForm.title || null,
          role: editForm.role,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as any;
        throw new Error(err.error || "Failed to update");
      }
      await queryClient.invalidateQueries({ queryKey: getListUsersQueryKey({ status: "active" }) });
      toast.success("Employee updated");
      setEditingUser(null);
    } catch (e: any) {
      toast.error(e.message || "Failed to update employee");
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await apiFetch(`/api/users/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error("Failed to delete");
      await queryClient.invalidateQueries({ queryKey: getListUsersQueryKey({ status: "active" }) });
      toast.success("Employee removed");
      setDeleteTarget(null);
    } catch (e: any) {
      toast.error(e.message || "Failed to delete employee");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t("employees.title")}</h2>
        <p className="text-muted-foreground">{t("employees.subtitle")}</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-0 pt-6 px-6 text-center flex flex-col items-center">
                <Skeleton className="h-20 w-20 rounded-full mb-4" />
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="p-6 mt-4 border-t space-y-3 bg-muted/20">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-xl border shadow-sm">
          <p className="text-muted-foreground">{t("employees.no_employees")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {users.map(user => (
            <Card key={user.id} className="overflow-hidden group hover:border-primary/50 transition-colors">
              <CardHeader className="pb-0 pt-6 px-6 relative flex flex-col items-center">
                {isAdmin && (
                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 hover:bg-muted"
                      onClick={() => openEdit(user as Employee)}
                      title="Edit employee"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteTarget(user as Employee)}
                      title="Delete employee"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
                <div className="relative">
                  <UserAvatar name={user.name} avatarUrl={user.avatarUrl} className="h-20 w-20 mb-4" />
                  <div className={cn(
                    "absolute bottom-4 right-0 h-4 w-4 rounded-full border-2 border-background",
                    user.isOnline ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                  )} title={user.isOnline ? "Online" : "Offline"} />
                </div>
                <h3 className="font-semibold text-lg text-center leading-none tracking-tight">{user.name}</h3>
                <p className="text-sm text-muted-foreground mt-1.5 text-center h-5">
                  {user.title || "No Title Set"}
                </p>
                <div className="mt-3">
                  <RoleBadge role={user.role} />
                </div>
              </CardHeader>
              <CardContent className="p-5 mt-6 border-t bg-muted/10 space-y-3">
                <div className="flex items-center text-sm gap-3 text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0 text-foreground/40" />
                  <span className="truncate" title={user.email}>{user.email}</span>
                </div>
                <div className="flex items-center text-sm gap-3 text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0 text-foreground/40" />
                  <span>{user.phone || "No phone provided"}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(v) => { if (!v) setEditingUser(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input value={editForm.name} onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={editForm.phone} onChange={(e) => setEditForm(f => ({ ...f, phone: e.target.value }))} placeholder="+20 10 1234 5678" />
            </div>
            <div className="space-y-1.5">
              <Label>Title / Position</Label>
              <Input value={editForm.title} onChange={(e) => setEditForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Senior Sales Agent" />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={editForm.role} onValueChange={(v) => setEditForm(f => ({ ...f, role: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map(r => (
                    <SelectItem key={r} value={r} className="capitalize">{r.replace("_", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={editLoading || !editForm.name.trim()}>
              {editLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Employee</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Are you sure you want to remove <span className="font-semibold text-foreground">{deleteTarget?.name}</span> from the system? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteLoading}>
              {deleteLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
