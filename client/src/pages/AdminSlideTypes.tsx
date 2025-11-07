import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Loader2, Save } from "lucide-react";
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
        <div>
          <h1 className="text-3xl font-bold">Configuration des Types de Slides</h1>
          <p className="text-muted-foreground mt-2">
            Gérez les types de slides disponibles pour les utilisateurs
          </p>
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
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(type)}
                        >
                          Modifier
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
