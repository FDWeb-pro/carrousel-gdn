import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Ban, CheckCircle, Loader2, Lock, Search, Shield, Trash2, Unlock, User, X, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export default function AdminUsers() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const { data: users, isLoading } = trpc.users.list.useQuery();
  const { data: pendingUsers } = trpc.users.pending.useQuery();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const updateRoleMutation = trpc.users.updateRole.useMutation({
    onSuccess: () => {
      toast.success("Rôle mis à jour avec succès");
      utils.users.list.invalidate();
    },
    onError: (error: { message: string }) => {
      toast.error(error.message || "Erreur lors de la mise à jour du rôle");
    },
  });

  const deleteUserMutation = trpc.users.delete.useMutation({
    onSuccess: () => {
      toast.success("Utilisateur supprimé avec succès");
      utils.users.list.invalidate();
      utils.users.pending.invalidate();
    },
    onError: (error: { message: string }) => {
      toast.error(error.message || "Erreur lors de la suppression");
    },
  });

  const blockUserMutation = trpc.users.block.useMutation({
    onSuccess: () => {
      toast.success("Utilisateur bloqué avec succès");
      utils.users.list.invalidate();
    },
    onError: (error: { message: string }) => {
      toast.error(error.message || "Erreur lors du blocage");
    },
  });

  const unblockUserMutation = trpc.users.unblock.useMutation({
    onSuccess: () => {
      toast.success("Utilisateur débloqué avec succès");
      utils.users.list.invalidate();
    },
    onError: (error: { message: string }) => {
      toast.error(error.message || "Erreur lors du déblocage");
    },
  });

  const approveMutation = trpc.users.approve.useMutation({
    onSuccess: () => {
      toast.success("Utilisateur approuvé avec succès");
      utils.users.list.invalidate();
      utils.users.pending.invalidate();
    },
    onError: (error: { message: string }) => {
      toast.error(error.message || "Erreur lors de l'approbation");
    },
  });

  const rejectMutation = trpc.users.reject.useMutation({
    onSuccess: () => {
      toast.success("Utilisateur rejeté avec succès");
      utils.users.list.invalidate();
      utils.users.pending.invalidate();
    },
    onError: (error: { message: string }) => {
      toast.error(error.message || "Erreur lors du rejet");
    },
  });

  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);

  // Filtered users based on search and filters
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    
    return users.filter(u => {
      // Search filter
      const matchesSearch = searchTerm === "" || 
        (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()));

      // Role filter
      const matchesRole = filterRole === "all" || u.role === filterRole;

      // Status filter
      const matchesStatus = filterStatus === "all" || u.status === filterStatus;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, filterRole, filterStatus]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Don't select current user
      setSelectedIds(filteredUsers.filter(u => u.id !== user?.id).map(u => u.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) {
      toast.error("Aucun utilisateur sélectionné");
      return;
    }

    if (confirm(`⚠️ ATTENTION : Supprimer ${selectedIds.length} utilisateur(s) supprimera également TOUTES leurs données (carrousels, notifications, logs d'audit).\n\nÊtes-vous absolument sûr de vouloir continuer ?`)) {
      try {
        for (const id of selectedIds) {
          await deleteUserMutation.mutateAsync({ userId: id });
        }
        setSelectedIds([]);
        toast.success(`${selectedIds.length} utilisateur(s) et leurs données supprimé(s) avec succès`);
      } catch (error) {
        toast.error("Erreur lors de la suppression groupée");
      }
    }
  };

  const handleRoleChange = async (userId: number, role: "membre" | "admin" | "super_admin") => {
    setUpdatingUserId(userId);
    await updateRoleMutation.mutateAsync({ userId, role });
    setUpdatingUserId(null);
  };

  const handleDeleteUser = async (userId: number) => {
    if (confirm("⚠️ ATTENTION : Supprimer cet utilisateur supprimera également TOUTES ses données (carrousels, notifications, logs d'audit).\n\nÊtes-vous sûr de vouloir continuer ?")) {
      await deleteUserMutation.mutateAsync({ userId });
    }
  };

  const handleBlockUser = async (userId: number) => {
    if (confirm("Bloquer cet utilisateur l'empêchera de se connecter mais conservera ses données. Confirmer ?")) {
      await blockUserMutation.mutateAsync({ userId });
    }
  };

  const handleUnblockUser = async (userId: number) => {
    await unblockUserMutation.mutateAsync({ userId });
  };

  const handleApprove = async (userId: number) => {
    await approveMutation.mutateAsync({ userId });
  };

  const handleReject = async (userId: number) => {
    if (confirm("Êtes-vous sûr de vouloir rejeter cette demande ?")) {
      await rejectMutation.mutateAsync({ userId });
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterRole("all");
    setFilterStatus("all");
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      approved: "bg-green-100 text-green-800 border-green-300",
      rejected: "bg-red-100 text-red-800 border-red-300",
      blocked: "bg-orange-100 text-orange-800 border-orange-300",
    };
    const labels = {
      pending: "En attente",
      approved: "Approuvé",
      rejected: "Rejeté",
      blocked: "Bloqué",
    };
    return (
      <Badge variant="outline" className={styles[status as keyof typeof styles] || styles.pending}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
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

  const allSelected = filteredUsers.filter(u => u.id !== user?.id).length > 0 && 
    selectedIds.length === filteredUsers.filter(u => u.id !== user?.id).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestion des Utilisateurs</h1>
            <p className="text-muted-foreground mt-2">
              Gérez les utilisateurs et leurs rôles d'accès
            </p>
          </div>
          {selectedIds.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={handleDeleteSelected}
                disabled={deleteUserMutation.isPending}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer ({selectedIds.length})
              </Button>
            </div>
          )}
        </div>

        {pendingUsers && pendingUsers.length > 0 && (
          <Card className="border-yellow-300 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-900">Demandes en attente</CardTitle>
              <CardDescription>
                {pendingUsers.length} demande(s) d'accès en attente de validation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Date de demande</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name || "—"}</TableCell>
                      <TableCell>{u.email || "—"}</TableCell>
                      <TableCell>
                        {new Date(u.createdAt).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApprove(u.id)}
                            disabled={approveMutation.isPending}
                            className="text-green-600 border-green-300 hover:bg-green-50"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approuver
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReject(u.id)}
                            disabled={rejectMutation.isPending}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Rejeter
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtres et Recherche</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Label>Rechercher</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par nom ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label>Rôle</Label>
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="membre">Membre</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Statut</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="approved">Approuvé</SelectItem>
                    <SelectItem value="blocked">Bloqué</SelectItem>
                    <SelectItem value="rejected">Rejeté</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {(searchTerm || filterRole !== "all" || filterStatus !== "all") && (
              <div className="mt-4">
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-2" />
                  Effacer les filtres
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Utilisateurs</CardTitle>
            <CardDescription>
              {filteredUsers.length} utilisateur(s) trouvé(s) sur {users?.length || 0} au total
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Tout sélectionner"
                    />
                  </TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Méthode de connexion</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Dernière connexion</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      {u.id !== user?.id && (
                        <Checkbox
                          checked={selectedIds.includes(u.id)}
                          onCheckedChange={(checked) => handleSelectOne(u.id, checked as boolean)}
                          aria-label={`Sélectionner ${u.name}`}
                        />
                      )}
                    </TableCell>
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
                      {getStatusBadge(u.status)}
                    </TableCell>
                    <TableCell>
                      {u.lastSignedIn ? new Date(u.lastSignedIn).toLocaleDateString("fr-FR") : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {u.id !== user?.id && (
                        <div className="flex gap-2 justify-end">
                          {u.status === "blocked" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUnblockUser(u.id)}
                              disabled={unblockUserMutation.isPending}
                              title="Débloquer"
                              className="text-green-600 border-green-300"
                            >
                              <Unlock className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleBlockUser(u.id)}
                              disabled={blockUserMutation.isPending}
                              title="Bloquer"
                              className="text-orange-600 border-orange-300"
                            >
                              <Lock className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(u.id)}
                            disabled={deleteUserMutation.isPending || (user?.role === 'admin' && u.role === 'super_admin')}
                            title="Supprimer (avec toutes les données)"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
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
