import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { AlertCircle, ExternalLink, Loader2, Save, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AdminAIConfig() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const { data: config, isLoading } = trpc.ai.getConfig.useQuery();
  const updateMutation = trpc.ai.updateConfig.useMutation({
    onSuccess: () => {
      toast.success("Configuration IA mise à jour avec succès");
      utils.ai.getConfig.invalidate();
    },
    onError: (error: { message: string }) => {
      toast.error(error.message || "Erreur lors de la mise à jour");
    },
  });

  const [formData, setFormData] = useState({
    apiToken: "",
    productId: "",
    model: "mixtral",
    maxTokens: 200,
    temperature: 70,
    isEnabled: 0,
  });

  useEffect(() => {
    if (config) {
      setFormData({
        apiToken: config.apiToken || "",
        productId: config.productId || "",
        model: config.model || "mixtral",
        maxTokens: config.maxTokens || 200,
        temperature: config.temperature || 70,
        isEnabled: config.isEnabled || 0,
      });
    }
  }, [config]);

  const handleSave = async () => {
    await updateMutation.mutateAsync(formData);
  };

  if (user?.role !== "super_admin") {
    return (
      <DashboardLayout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Accès refusé</AlertTitle>
          <AlertDescription>
            Seuls les super administrateurs peuvent accéder à cette page.
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

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
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            Configuration IA
          </h1>
          <p className="text-muted-foreground mt-2">
            Configurez l'API Infomaniak pour la génération automatique de descriptions d'images
          </p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Obtenir vos identifiants API</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>
              Pour utiliser la fonctionnalité IA, vous devez obtenir un token API et un Product ID depuis votre compte Infomaniak.
            </p>
            <a
              href="https://developer.infomaniak.com/docs/api/post/1/ai/%7Bproduct_id%7D/openai/chat/completions"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              Consulter la documentation Infomaniak
              <ExternalLink className="w-3 h-3" />
            </a>
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Paramètres de l'API</CardTitle>
            <CardDescription>
              Configurez les paramètres de connexion à l'API Infomaniak
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="apiToken">Token API *</Label>
              <Input
                id="apiToken"
                type="password"
                placeholder="Bearer token..."
                value={formData.apiToken}
                onChange={(e) => setFormData({ ...formData, apiToken: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Le token d'authentification fourni par Infomaniak
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="productId">Product ID *</Label>
              <Input
                id="productId"
                placeholder="88888"
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                L'identifiant de votre produit LLM API Infomaniak
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Modèle</Label>
              <Select
                value={formData.model}
                onValueChange={(value) => setFormData({ ...formData, model: value })}
              >
                <SelectTrigger id="model">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mixtral">Mixtral</SelectItem>
                  <SelectItem value="mistral31">Mistral 3.1</SelectItem>
                  <SelectItem value="mistral24b">Mistral 24B</SelectItem>
                  <SelectItem value="llama3">Llama 3</SelectItem>
                  <SelectItem value="granite">Granite</SelectItem>
                  <SelectItem value="reasoning">Reasoning</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Le modèle de langage à utiliser (Mixtral recommandé)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxTokens">Tokens maximum</Label>
                <Input
                  id="maxTokens"
                  type="number"
                  min="50"
                  max="500"
                  value={formData.maxTokens}
                  onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground">
                  Longueur maximale de la description (50-500)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="temperature">Température ({(formData.temperature / 100).toFixed(2)})</Label>
                <Input
                  id="temperature"
                  type="range"
                  min="0"
                  max="200"
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: parseInt(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground">
                  Créativité (0 = précis, 2 = très créatif)
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="isEnabled" className="text-base">
                  Activer la génération IA
                </Label>
                <p className="text-sm text-muted-foreground">
                  Permet aux utilisateurs de générer des descriptions d'images automatiquement
                </p>
              </div>
              <Switch
                id="isEnabled"
                checked={formData.isEnabled === 1}
                onCheckedChange={(checked) => setFormData({ ...formData, isEnabled: checked ? 1 : 0 })}
              />
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={updateMutation.isPending || !formData.apiToken || !formData.productId}
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Enregistrer la configuration
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {formData.isEnabled === 1 && (
          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertTitle>Fonctionnalité activée</AlertTitle>
            <AlertDescription>
              Les utilisateurs peuvent maintenant utiliser le bouton "Générer description" dans le générateur de carrousels pour créer automatiquement des descriptions d'images basées sur le contenu texte de leurs slides.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </DashboardLayout>
  );
}
