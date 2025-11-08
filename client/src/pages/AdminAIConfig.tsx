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

type Provider = "infomaniak" | "openai" | "mistral" | "claude" | "gemini";

const PROVIDER_INFO = {
  infomaniak: {
    name: "Infomaniak",
    docs: "https://developer.infomaniak.com/docs/api/post/1/ai/%7Bproduct_id%7D/openai/chat/completions",
    models: ["mixtral", "mistral31", "mistral24b", "llama3", "granite", "reasoning"],
    defaultModel: "mixtral",
  },
  openai: {
    name: "OpenAI",
    docs: "https://platform.openai.com/docs/api-reference/chat/create",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
    defaultModel: "gpt-4o-mini",
  },
  mistral: {
    name: "Mistral AI",
    docs: "https://docs.mistral.ai/api/",
    models: ["mistral-large-latest", "mistral-medium-latest", "mistral-small-latest", "open-mixtral-8x7b"],
    defaultModel: "mistral-small-latest",
  },
  claude: {
    name: "Claude (Anthropic)",
    docs: "https://docs.anthropic.com/claude/reference/messages_post",
    models: ["claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022", "claude-3-opus-20240229"],
    defaultModel: "claude-3-5-haiku-20241022",
  },
  gemini: {
    name: "Gemini (Google)",
    docs: "https://ai.google.dev/api/rest/v1beta/models/generateContent",
    models: ["gemini-2.0-flash-exp", "gemini-1.5-pro", "gemini-1.5-flash"],
    defaultModel: "gemini-2.0-flash-exp",
  },
};

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
    provider: "infomaniak" as Provider,
    apiToken: "",
    productId: "",
    organizationId: "",
    anthropicVersion: "2023-06-01",
    model: "mixtral",
    maxTokens: 200,
    temperature: 70,
    isEnabled: 0,
  });

  useEffect(() => {
    if (config) {
      setFormData({
        provider: (config.provider as Provider) || "infomaniak",
        apiToken: config.apiToken || "",
        productId: config.productId || "",
        organizationId: config.organizationId || "",
        anthropicVersion: config.anthropicVersion || "2023-06-01",
        model: config.model || PROVIDER_INFO[config.provider as Provider]?.defaultModel || "mixtral",
        maxTokens: config.maxTokens || 200,
        temperature: config.temperature || 70,
        isEnabled: config.isEnabled || 0,
      });
    }
  }, [config]);

  const handleProviderChange = (provider: Provider) => {
    setFormData({
      ...formData,
      provider,
      model: PROVIDER_INFO[provider].defaultModel,
      // Reset provider-specific fields
      productId: "",
      organizationId: "",
      anthropicVersion: "2023-06-01",
    });
  };

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

  const currentProvider = PROVIDER_INFO[formData.provider];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            Configuration IA
          </h1>
          <p className="text-muted-foreground mt-2">
            Configurez le fournisseur d'IA pour la génération automatique de descriptions d'images
          </p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Fournisseur sélectionné : {currentProvider.name}</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>
              Pour utiliser {currentProvider.name}, vous devez obtenir une clé API depuis votre compte.
            </p>
            <a
              href={currentProvider.docs}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              Consulter la documentation {currentProvider.name}
              <ExternalLink className="w-3 h-3" />
            </a>
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Sélection du fournisseur</CardTitle>
            <CardDescription>
              Choisissez le fournisseur d'IA à utiliser pour la génération
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="provider">Fournisseur d'IA</Label>
              <Select
                value={formData.provider}
                onValueChange={(value) => handleProviderChange(value as Provider)}
              >
                <SelectTrigger id="provider">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="infomaniak">Infomaniak</SelectItem>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="mistral">Mistral AI</SelectItem>
                  <SelectItem value="claude">Claude (Anthropic)</SelectItem>
                  <SelectItem value="gemini">Gemini (Google)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Paramètres de l'API</CardTitle>
            <CardDescription>
              Configurez les paramètres de connexion à {currentProvider.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="apiToken">Clé API *</Label>
              <Input
                id="apiToken"
                type="password"
                placeholder={
                  formData.provider === "openai" ? "sk-..." :
                  formData.provider === "mistral" ? "..." :
                  formData.provider === "claude" ? "sk-ant-..." :
                  formData.provider === "gemini" ? "AIza..." :
                  "Bearer token..."
                }
                value={formData.apiToken}
                onChange={(e) => setFormData({ ...formData, apiToken: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                {formData.provider === "openai" && "Votre clé API OpenAI (commence par sk-)"}
                {formData.provider === "mistral" && "Votre clé API Mistral AI"}
                {formData.provider === "claude" && "Votre clé API Anthropic (commence par sk-ant-)"}
                {formData.provider === "gemini" && "Votre clé API Google AI (commence par AIza)"}
                {formData.provider === "infomaniak" && "Le token d'authentification fourni par Infomaniak"}
              </p>
            </div>

            {/* Champs spécifiques Infomaniak */}
            {formData.provider === "infomaniak" && (
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
            )}

            {/* Champs spécifiques OpenAI */}
            {formData.provider === "openai" && (
              <div className="space-y-2">
                <Label htmlFor="organizationId">Organization ID (optionnel)</Label>
                <Input
                  id="organizationId"
                  placeholder="org-..."
                  value={formData.organizationId}
                  onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Votre ID d'organisation OpenAI (optionnel)
                </p>
              </div>
            )}

            {/* Champs spécifiques Claude */}
            {formData.provider === "claude" && (
              <div className="space-y-2">
                <Label htmlFor="anthropicVersion">Version de l'API</Label>
                <Input
                  id="anthropicVersion"
                  placeholder="2023-06-01"
                  value={formData.anthropicVersion}
                  onChange={(e) => setFormData({ ...formData, anthropicVersion: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Version de l'API Anthropic (format: YYYY-MM-DD)
                </p>
              </div>
            )}

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
                  {currentProvider.models.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Le modèle de langage à utiliser
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
                disabled={updateMutation.isPending || !formData.apiToken || 
                  (formData.provider === "infomaniak" && !formData.productId)}
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
              Les utilisateurs peuvent maintenant utiliser le bouton "Générer description" dans le générateur de carrousels pour créer automatiquement des descriptions d'images avec {currentProvider.name}.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </DashboardLayout>
  );
}
