import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { Loader2, Shield, Trash2, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminUsers() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const { data: users, isLoading } = trpc.users.list.useQuery();
  const updateRoleMutation = trpc.users.updateRole.useMutation({
    onSuccess: () => {
      toast.success("Rôle mis à jour avec succès");
      utils.users.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la mise à jour du rôle");
    },
  });
  const deleteUserMutation = trpc.users.delete.useMutation({
    onSuccess: () => {
      toast.success("Utilisateur supprimé avec succès");
      utils.users.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la suppression");
    },
  });

  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);

  const handleRoleChange = async (userId: number, role: "membre" | "admin" | "super_admin") => {
    setUpdatingUserId(userId);
    await updateRoleMutation.mutateAsync({ userId, role });
    setUpdatingUserId(null);
  };

  const handleDeleteUser = async (userId: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      await deleteUserMutation.mutateAsync({ userId });
    }
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      super_admin: "bg-purple-100 text-purple-800 border-purple-300",
      admin: "bg-blue-100 text-blue-800 border-blue-300",
      membre: "bg-gray-100 text-gray-800 border-gray-300",
    };
    const icons = {
      super_admin: Shield,
      admin: Shield,
      membre: User,
    };
    const Icon = icons[role as keyof typeof icons] || User;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${styles[role as keyof typeof styles] || styles.membre}`}>
        <Icon className="w-3 h-3" />
        {role === "super_admin" ? "Super Admin" : role === "admin" ? "Admin" : "Membre"}
      </span>
    );
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Utilisateurs</h1>
          <p className="text-muted-foreground mt-2">
            Gérez les utilisateurs et leurs rôles d'accès
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Utilisateurs</CardTitle>
            <CardDescription>
              {users?.length || 0} utilisateur(s) enregistré(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Méthode de connexion</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Dernière connexion</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name || "—"}</TableCell>
                    <TableCell>{u.email || "—"}</TableCell>
                    <TableCell>{u.loginMethod || "—"}</TableCell>
                    <TableCell>
                      {updatingUserId === u.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : u.id === user?.id ? (
                        getRoleBadge(u.role)
                      ) : (
                        <Select
                          value={u.role}
                          onValueChange={(value) => handleRoleChange(u.id, value as any)}
                          disabled={user?.role !== "super_admin" && u.role === "super_admin"}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="membre">Membre</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            {user?.role === "super_admin" && (
                              <SelectItem value="super_admin">Super Admin</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell>
                      {u.lastSignedIn ? new Date(u.lastSignedIn).toLocaleDateString("fr-FR") : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {u.id !== user?.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(u.id)}
                          disabled={deleteUserMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
