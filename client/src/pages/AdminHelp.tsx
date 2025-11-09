import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, ExternalLink, FileText, HelpCircle, Link as LinkIcon, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AdminHelp() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [resourceType, setResourceType] = useState<"file" | "link" | "cgu">("link");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data: resources, isLoading } = trpc.help.listAdmin.useQuery();
  const utils = trpc.useUtils();

  const uploadFileMutation = trpc.help.uploadFile.useMutation({
    onSuccess: (data) => {
      setUrl(data.url);
      toast.success("✅ Fichier uploadé avec succès");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erreur lors de l'upload");
    },
  });

  const createMutation = trpc.help.create.useMutation({
    onSuccess: () => {
      toast.success("✅ Ressource créée avec succès");
      utils.help.listAdmin.invalidate();
      utils.help.list.invalidate();
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erreur lors de la création");
    },
  });

  const deleteMutation = trpc.help.delete.useMutation({
    onSuccess: () => {
      toast.success("✅ Ressource supprimée");
      utils.help.listAdmin.invalidate();
      utils.help.list.invalidate();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erreur lors de la suppression");
    },
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setUrl("");
    setFile(null);
    setResourceType("link");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("Le fichier ne doit pas dépasser 10 Mo");
      return;
    }

    setFile(selectedFile);
    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(",")[1];
        await uploadFileMutation.mutateAsync({
          fileName: selectedFile.name,
          fileData: base64,
          mimeType: selectedFile.type,
        });
        setIsUploading(false);
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      setIsUploading(false);
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Le titre est obligatoire");
      return;
    }

    if (resourceType === "file" && !url) {
      toast.error("Veuillez uploader un fichier");
      return;
    }

    if ((resourceType === "link" || resourceType === "cgu") && !url.trim()) {
      toast.error("L'URL est obligatoire");
      return;
    }

    await createMutation.mutateAsync({
      type: resourceType,
      title: title.trim(),
      description: description.trim() || undefined,
      url: url.trim(),
      displayOrder: resources?.length || 0,
    });
  };

  const handleDelete = async (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette ressource ?")) {
      await deleteMutation.mutateAsync({ id });
    }
  };

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
   return (
    <DashboardLayout>
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => setLocation('/admin')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à l'Administration
        </Button>          <p className="text-destructive">Accès refusé. Seuls les administrateurs peuvent accéder à cette page.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <HelpCircle className="w-8 h-8" />
            Gestion de l'Aide
          </h1>
          <p className="text-muted-foreground mt-2">
            Gérez les ressources d'aide disponibles pour les utilisateurs
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une ressource
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nouvelle Ressource d'Aide</DialogTitle>
              <DialogDescription>
                Ajoutez un fichier, un lien ou les CGU
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Type de Ressource</Label>
                <Select value={resourceType} onValueChange={(v: any) => setResourceType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="link">Lien externe</SelectItem>
                    <SelectItem value="file">Fichier téléchargeable</SelectItem>
                    <SelectItem value="cgu">Conditions Générales d'Utilisation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Titre *</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Manuel d'utilisation"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description optionnelle..."
                  rows={2}
                />
              </div>

              {resourceType === "file" ? (
                <div className="space-y-2">
                  <Label>Fichier *</Label>
                  <Input
                    type="file"
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />
                  {url && (
                    <p className="text-sm text-green-600">✓ Fichier uploadé</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>URL *</Label>
                  <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button
                onClick={handleCreate}
                disabled={createMutation.isPending || isUploading}
              >
                {(createMutation.isPending || isUploading) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Créer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {resources && resources.length > 0 ? (
            resources.map((resource) => (
              <Card key={resource.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {resource.type === "file" && <FileText className="w-5 h-5" />}
                      {resource.type === "link" && <LinkIcon className="w-5 h-5" />}
                      {resource.type === "cgu" && <ExternalLink className="w-5 h-5" />}
                      <div>
                        <CardTitle className="text-lg">{resource.title}</CardTitle>
                        {resource.description && (
                          <CardDescription className="mt-1">{resource.description}</CardDescription>
                        )}
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(resource.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium">Type:</span>
                    <span>
                      {resource.type === "file" && "Fichier"}
                      {resource.type === "link" && "Lien"}
                      {resource.type === "cgu" && "CGU"}
                    </span>
                    <span className="mx-2">•</span>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Voir la ressource
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucune ressource d'aide n'a encore été créée.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
    </DashboardLayout>
  );
}
