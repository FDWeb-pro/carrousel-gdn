import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminSlideTypes() {
  const utils = trpc.useUtils();
  const { data: slideTypes, isLoading } = trpc.slideTypes.list.useQuery();
  const upsertMutation = trpc.slideTypes.upsert.useMutation({
    onSuccess: () => {
      toast.success("Configuration mise à jour avec succès");
      utils.slideTypes.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la mise à jour");
    },
  });
  const toggleMutation = trpc.slideTypes.toggle.useMutation({
    onSuccess: () => {
      utils.slideTypes.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la mise à jour");
    },
  });

  const [editingType, setEditingType] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ label: "", charLimit: 0 });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ typeKey: "", label: "", charLimit: 0 });
  const createMutation = trpc.slideTypes.create.useMutation({
    onSuccess: () => {
      toast.success("Type de slide créé avec succès");
      utils.slideTypes.list.invalidate();
      setIsCreateDialogOpen(false);
      setCreateForm({ typeKey: "", label: "", charLimit: 0 });
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la création");
    },
  });
  const deleteMutation = trpc.slideTypes.delete.useMutation({
    onSuccess: () => {
      toast.success("Type de slide supprimé avec succès");
      utils.slideTypes.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la suppression");
    },
  });

  const handleEdit = (slideType: any) => {
    setEditingType(slideType.typeKey);
    setEditForm({ label: slideType.label, charLimit: slideType.charLimit });
  };

  const handleSave = async (typeKey: string) => {
    await upsertMutation.mutateAsync({
      typeKey,
      label: editForm.label,
      charLimit: editForm.charLimit,
      enabled: 1,
    });
    setEditingType(null);
  };

  const handleToggle = async (typeKey: string, currentEnabled: number) => {
    await toggleMutation.mutateAsync({
      typeKey,
      enabled: currentEnabled === 1 ? 0 : 1,
    });
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Configuration des Types de Slides</h1>
            <p className="text-muted-foreground mt-2">
              Gérez les types de slides disponibles pour les utilisateurs
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nouveau type
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un nouveau type de slide</DialogTitle>
                <DialogDescription>
                  Définissez les paramètres du nouveau type de slide
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Clé du type (ex: type6)</Label>
                  <Input
                    value={createForm.typeKey}
                    onChange={(e) => setCreateForm({ ...createForm, typeKey: e.target.value })}
                    placeholder="type6"
                  />
                </div>
                <div>
                  <Label>Label</Label>
                  <Input
                    value={createForm.label}
                    onChange={(e) => setCreateForm({ ...createForm, label: e.target.value })}
                    placeholder="Type 6 - Description (max X car.)"
                  />
                </div>
                <div>
                  <Label>Limite de caractères</Label>
                  <Input
                    type="number"
                    value={createForm.charLimit}
                    onChange={(e) => setCreateForm({ ...createForm, charLimit: parseInt(e.target.value) })}
                    placeholder="100"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => createMutation.mutate(createForm)}
                  disabled={createMutation.isPending || !createForm.typeKey || !createForm.label}
                >
                  {createMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Créer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Types de Slides</CardTitle>
            <CardDescription>
              Configurez les limites de caractères et activez/désactivez les types
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Limite de caractères</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slideTypes?.map((type) => (
                  <TableRow key={type.typeKey}>
                    <TableCell className="font-mono">{type.typeKey}</TableCell>
                    <TableCell>
                      {editingType === type.typeKey ? (
                        <Input
                          value={editForm.label}
                          onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                          className="max-w-md"
                        />
                      ) : (
                        type.label
                      )}
                    </TableCell>
                    <TableCell>
                      {editingType === type.typeKey ? (
                        <Input
                          type="number"
                          value={editForm.charLimit}
                          onChange={(e) => setEditForm({ ...editForm, charLimit: parseInt(e.target.value) })}
                          className="w-24"
                        />
                      ) : (
                        type.charLimit
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={type.enabled === 1}
                          onCheckedChange={() => handleToggle(type.typeKey, type.enabled)}
                        />
                        <Label className="text-sm">
                          {type.enabled === 1 ? "Activé" : "Désactivé"}
                        </Label>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {editingType === type.typeKey ? (
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            onClick={() => handleSave(type.typeKey)}
                            disabled={upsertMutation.isPending}
                          >
                            {upsertMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Save className="w-4 h-4 mr-1" />
                                Enregistrer
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingType(null)}
                          >
                            Annuler
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(type)}
                          >
                            Modifier
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (confirm(`Êtes-vous sûr de vouloir supprimer le type "${type.typeKey}" ?`)) {
                                deleteMutation.mutate({ typeKey: type.typeKey });
                              }
                            }}
                            disabled={deleteMutation.isPending}
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
