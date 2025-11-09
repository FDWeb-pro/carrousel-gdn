import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Building2, Loader2, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminBrandConfig() {
  const { user } = useAuth();
  const [organizationName, setOrganizationName] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const { data: brandConfig, isLoading } = trpc.brand.getConfig.useQuery();
  const updateMutation = trpc.brand.updateConfig.useMutation({
    onSuccess: () => {
      toast.success("✅ Configuration de marque mise à jour");
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la mise à jour");
    },
  });

  const uploadLogoMutation = trpc.brand.uploadLogo.useMutation({
    onSuccess: (data) => {
      setLogoUrl(data.url);
      setLogoPreview(data.url);
      setLogoFile(null);
      toast.success("✅ Logo uploadé avec succès");
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de l'upload du logo");
    },
  });

  useEffect(() => {
    if (brandConfig) {
      setOrganizationName(brandConfig.organizationName || "");
      setDescription(brandConfig.description || "");
      setLogoUrl(brandConfig.logoUrl || "");
      setLogoPreview(brandConfig.logoUrl || "");
    }
  }, [brandConfig]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Veuillez sélectionner une image");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Le fichier ne doit pas dépasser 5 Mo");
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadLogo = async () => {
    if (!logoFile) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(",")[1];
        await uploadLogoMutation.mutateAsync({
          fileName: logoFile.name,
          fileData: base64,
          mimeType: logoFile.type,
        });
        setIsUploading(false);
      };
      reader.readAsDataURL(logoFile);
    } catch (error) {
      setIsUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview("");
    setLogoUrl("");
  };

  const handleSave = async () => {
    if (!organizationName.trim()) {
      toast.error("Le nom de la structure est obligatoire");
      return;
    }

    if (description.length > 250) {
      toast.error("La description ne doit pas dépasser 250 caractères");
      return;
    }

    if (logoFile) {
      await handleUploadLogo();
    }

    await updateMutation.mutateAsync({
      organizationName: organizationName.trim(),
      description: description.trim(),
      logoUrl: logoUrl || undefined,
    });
  };

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <p className="text-destructive">Accès refusé. Seuls les administrateurs peuvent accéder à cette page.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Building2 className="w-8 h-8" />
          Configuration de Marque
        </h1>
        <p className="text-muted-foreground mt-2">
          Personnalisez l'apparence de votre application avec le nom, le logo et la description de votre structure
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Paramètres de la Structure</CardTitle>
          <CardDescription>
            Ces informations seront affichées dans l'interface de l'application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="organizationName">
              Nom de la Structure <span className="text-destructive">*</span>
            </Label>
            <Input
              id="organizationName"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              placeholder="Ex: Guichet du Numérique"
              maxLength={255}
            />
            <p className="text-sm text-muted-foreground">
              Ce nom apparaîtra dans le titre de l'application et dans le générateur
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description Courte</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez brièvement votre structure..."
              maxLength={250}
              rows={3}
            />
            <p className="text-sm text-muted-foreground">
              {description.length}/250 caractères
            </p>
          </div>

          <div className="space-y-2">
            <Label>Logo de la Structure (format carré recommandé)</Label>
            <div className="flex items-start gap-4">
              {logoPreview ? (
                <div className="relative">
                  <img
                    src={logoPreview}
                    alt="Logo"
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute -top-2 -right-2 w-6 h-6"
                    onClick={handleRemoveLogo}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground">
                  <Upload className="w-8 h-8" />
                </div>
              )}
              <div className="flex-1 space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  disabled={isUploading}
                />
                <p className="text-sm text-muted-foreground">
                  Format carré recommandé (ex: 512x512px). Maximum 5 Mo.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending || isUploading}
            >
              {(updateMutation.isPending || isUploading) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Enregistrer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
    </DashboardLayout>
  );
}
