import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2, Sliders } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function AdminSlideConfig() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [minSlides, setMinSlides] = useState(2);
  const [maxSlides, setMaxSlides] = useState(8);

  const { data: slideConfig, isLoading } = trpc.slideConfigRouter.getConfig.useQuery();
  const updateMutation = trpc.slideConfigRouter.updateConfig.useMutation({
    onSuccess: () => {
      toast.success("✅ Configuration des slides mise à jour");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erreur lors de la mise à jour");
    },
  });

  useEffect(() => {
    if (slideConfig) {
      setMinSlides(slideConfig.minSlides || 2);
      setMaxSlides(slideConfig.maxSlides || 8);
    }
  }, [slideConfig]);

  const handleSave = async () => {
    if (minSlides < 2) {
      toast.error("Le minimum ne peut pas être inférieur à 2");
      return;
    }

    if (maxSlides > 100) {
      toast.error("Le maximum ne peut pas dépasser 100");
      return;
    }

    if (minSlides > maxSlides) {
      toast.error("Le minimum ne peut pas être supérieur au maximum");
      return;
    }

    await updateMutation.mutateAsync({
      minSlides,
      maxSlides,
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
        <Button
          variant="ghost"
          onClick={() => setLocation('/admin')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à l'Administration
        </Button>
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sliders className="w-8 h-8" />
          Configuration des Slides
        </h1>
        <p className="text-muted-foreground mt-2">
          Définissez le nombre minimum et maximum de slides intermédiaires autorisées dans les carrousels
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Paramètres des Slides</CardTitle>
          <CardDescription>
            Les utilisateurs devront créer entre {minSlides} et {maxSlides} slides intermédiaires
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="minSlides">
              Nombre Minimum de Slides Intermédiaires <span className="text-destructive">*</span>
            </Label>
            <Input
              id="minSlides"
              type="number"
              min={2}
              max={100}
              value={minSlides}
              onChange={(e) => setMinSlides(parseInt(e.target.value) || 2)}
            />
            <p className="text-sm text-muted-foreground">
              Minimum autorisé : 2 slides
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxSlides">
              Nombre Maximum de Slides Intermédiaires <span className="text-destructive">*</span>
            </Label>
            <Input
              id="maxSlides"
              type="number"
              min={2}
              max={100}
              value={maxSlides}
              onChange={(e) => setMaxSlides(parseInt(e.target.value) || 8)}
            />
            <p className="text-sm text-muted-foreground">
              Maximum autorisé : 100 slides
            </p>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Aperçu de la Configuration</h3>
            <p className="text-sm text-muted-foreground">
              Les carrousels contiendront au total entre <strong>{minSlides + 2}</strong> et <strong>{maxSlides + 2}</strong> slides
              (incluant la slide titre et la slide finale).
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending && (
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
