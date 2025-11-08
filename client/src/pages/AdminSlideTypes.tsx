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
import { Image, Loader2, Plus, Save, Search, Trash2, Upload, X } from "lucide-react";
import { useState, useRef, useMemo } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  const updateImageMutation = trpc.slideTypes.updateImage.useMutation({
    onSuccess: () => {
      toast.success("Image mise à jour avec succès");
      utils.slideTypes.list.invalidate();
    },
    onError: (error: { message: string }) => {
      toast.error(error.message || "Erreur lors de la mise à jour de l'image");
    },
  });

  const [editingType, setEditingType] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ label: "", charLimit: 0 });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ typeKey: "", label: "", charLimit: 0 });
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Filtered slide types based on search and filters
  const filteredSlideTypes = useMemo(() => {
    if (!slideTypes) return [];
    
    return slideTypes.filter(st => {
      // Search filter
      const matchesSearch = searchTerm === "" || 
        st.typeKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
        st.label.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus = filterStatus === "all" || 
        (filterStatus === "active" && st.isActive === "true") ||
        (filterStatus === "inactive" && st.isActive === "false");

      return matchesSearch && matchesStatus;
    });
  }, [slideTypes, searchTerm, filterStatus]);

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
  };

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
      isActive: "true",
    });
    setEditingType(null);
  };

  const handleToggle = async (typeKey: string, currentEnabled: "true" | "false") => {
    await toggleMutation.mutateAsync({
      typeKey,
      isActive: currentEnabled === "true" ? "false" : "true",
    });
  };

  const handleImageUpload = async (typeKey: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error("Veuillez sélectionner un fichier image");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5 MB");
      return;
    }

    setUploadingImage(typeKey);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        await updateImageMutation.mutateAsync({
          typeKey,
          imageData: base64,
          fileName: file.name,
        });
        setUploadingImage(null);
      };
      reader.onerror = () => {
        toast.error("Erreur lors de la lecture du fichier");
        setUploadingImage(null);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Erreur lors de l'upload de l'image");
      setUploadingImage(null);
    }
  };

  const isFixedSlide = (typeKey: string) => {
    return typeKey === 'titre' || typeKey === 'finale';
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

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtres et Recherche</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label>Rechercher</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par type ou label..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label>Statut</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="active">Actifs</SelectItem>
                    <SelectItem value="inactive">Inactifs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {(searchTerm || filterStatus !== "all") && (
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
            <CardTitle>Types de Slides</CardTitle>
            <CardDescription>
              {filteredSlideTypes.length} type(s) trouvé(s) sur {slideTypes?.length || 0} au total
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aperçu</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Limite de caractères</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSlideTypes.map((type) => (
                  <TableRow key={type.typeKey}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {type.imageUrl ? (
                          <img
                            src={type.imageUrl}
                            alt={type.label}
                            className="w-16 h-16 object-cover rounded border"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-muted rounded border flex items-center justify-center">
                            <Image className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <input
                            ref={(el) => { fileInputRefs.current[type.typeKey] = el; }}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleImageUpload(type.typeKey, file);
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => fileInputRefs.current[type.typeKey]?.click()}
                            disabled={uploadingImage === type.typeKey}
                          >
                            {uploadingImage === type.typeKey ? (
                              <Loader2 className="w-3 h-3 animate-spin mr-1" />
                            ) : (
                              <Upload className="w-3 h-3 mr-1" />
                            )}
                            Changer
                          </Button>
                        </div>
                      </div>
                    </TableCell>
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
                          checked={type.isActive === "true"}
                          onCheckedChange={() => handleToggle(type.typeKey, type.isActive)}
                          disabled={isFixedSlide(type.typeKey)}
                        />
                        <Label className="text-sm">
                          {type.isActive === "true" ? "Activé" : "Désactivé"}
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
                          {!isFixedSlide(type.typeKey) && (
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
                          )}
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
