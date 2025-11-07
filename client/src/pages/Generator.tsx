import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Download, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface Slide {
  page: number;
  type: string;
  thematique?: string;
  titre?: string;
  expert?: string;
  expertise?: string;
  url?: string;
  texte1?: string;
  texte2?: string;
  texte3?: string;
  texte4?: string;
  auteur?: string;
  promptImage1?: string;
  promptImage2?: string;
  promptImage3?: string;
  promptImage4?: string;
}

export default function Generator() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const { data: slideTypesConfig } = trpc.slideTypes.list.useQuery();
  const createCarrouselMutation = trpc.carrousels.create.useMutation({
    onSuccess: () => {
      toast.success("Carrousel enregistré avec succès");
      utils.carrousels.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de l'enregistrement");
    },
  });

  const [slides, setSlides] = useState<Slide[]>([
    { page: 1, type: "Titre", thematique: "", titre: "" },
    { page: 10, type: "Finale", expert: "", expertise: "", url: "" },
  ]);
  const [emailDestination, setEmailDestination] = useState("");

  const enabledSlideTypes = slideTypesConfig?.filter((t) => t.enabled === 1) || [];

  const addSlide = () => {
    const intermediateSlides = slides.filter((s) => s.page !== 1 && s.page !== 10);
    if (intermediateSlides.length >= 8) {
      toast.error("Maximum 8 slides intermédiaires autorisées");
      return;
    }

    const newPage = intermediateSlides.length + 2;
    const newSlide: Slide = {
      page: newPage,
      type: enabledSlideTypes[0]?.typeKey || "type1",
      texte1: "",
      promptImage1: "",
    };

    const updatedSlides = [...slides];
    updatedSlides.splice(updatedSlides.length - 1, 0, newSlide);

    const reindexed = updatedSlides.map((slide, idx) => {
      if (slide.type === "Titre") return { ...slide, page: 1 };
      if (slide.type === "Finale") return { ...slide, page: 10 };
      return { ...slide, page: idx + 1 };
    });

    setSlides(reindexed);
  };

  const removeSlide = (index: number) => {
    const updatedSlides = slides.filter((_, i) => i !== index);
    const reindexed = updatedSlides.map((slide, idx) => {
      if (slide.type === "Titre") return { ...slide, page: 1 };
      if (slide.type === "Finale") return { ...slide, page: 10 };
      return { ...slide, page: idx + 1 };
    });
    setSlides(reindexed);
  };

  const updateSlide = (index: number, field: string, value: string) => {
    const updated = [...slides];
    updated[index] = { ...updated[index], [field]: value };
    setSlides(updated);
  };

  const getCharLimit = (type: string) => {
    const config = slideTypesConfig?.find((t) => t.typeKey === type);
    return config?.charLimit || 0;
  };

  const saveCarrousel = async () => {
    const titleSlide = slides.find((s) => s.type === "Titre");
    if (!titleSlide?.thematique || !titleSlide?.titre) {
      toast.error("Veuillez remplir la thématique et le titre");
      return;
    }

    const intermediateSlides = slides.filter((s) => s.type !== "Titre" && s.type !== "Finale");
    if (intermediateSlides.length < 2) {
      toast.error("Vous devez créer au moins 2 slides intermédiaires");
      return;
    }

    await createCarrouselMutation.mutateAsync({
      titre: titleSlide.titre,
      thematique: titleSlide.thematique,
      emailDestination: emailDestination || undefined,
      slides: JSON.stringify(slides),
    });
  };

  const exportToExcel = () => {
    const intermediateSlides = slides.filter((s) => s.type !== "Titre" && s.type !== "Finale");
    if (intermediateSlides.length < 2) {
      toast.error("❌ Vous devez créer au moins 2 slides intermédiaires avant de télécharger le fichier Excel.");
      return;
    }

    const workbook = XLSX.utils.book_new();
    const data: any[][] = [];

    // Header row
    data.push([
      "Page",
      "Type de slide",
      "Thématique / Texte 1 / Expert",
      "Titre / Texte 2 / URL",
      "Texte 3",
      "Texte 4",
      "Auteur (si citation)",
      "Prompt Image 1",
      "Prompt Image 2",
      "Prompt Image 3",
      "Prompt Image 4",
    ]);

    // Create 10 slides structure
    const fixedSlides = Array(10)
      .fill(null)
      .map((_, idx) => {
        const pageNumber = idx + 1;

        if (pageNumber === 1) {
          const titleSlide = slides.find((s) => s.type === "Titre");
          return [
            1,
            "Titre",
            titleSlide?.thematique || "",
            titleSlide?.titre || "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
          ];
        }

        if (pageNumber === 10) {
          const finalSlide = slides.find((s) => s.type === "Finale");
          return [
            10,
            "Finale",
            finalSlide?.expert || "",
            finalSlide?.expertise || "",
            "",
            "",
            finalSlide?.url || "",
            "",
            "",
            "",
            "",
          ];
        }

        const slideIndex = pageNumber - 2;
        const slide = intermediateSlides[slideIndex];

        if (!slide) {
          return [pageNumber, "", "", "", "", "", "", "", "", "", ""];
        }

        if (slide.type === "type1") {
          return [
            pageNumber,
            "type 1",
            slide.texte1 || "",
            "",
            "",
            "",
            "",
            slide.promptImage1 || "",
            "",
            "",
            "",
          ];
        } else if (slide.type === "type2") {
          return [
            pageNumber,
            "type 2",
            slide.texte1 || "",
            "",
            "",
            "",
            "",
            slide.promptImage1 || "",
            "",
            "",
            "",
          ];
        } else if (slide.type === "type3") {
          return [
            pageNumber,
            "type 3",
            slide.texte1 || "",
            "",
            "",
            "",
            "",
            slide.promptImage1 || "",
            "",
            "",
            "",
          ];
        } else if (slide.type === "type4") {
          return [
            pageNumber,
            "type 4",
            slide.texte1 || "",
            "",
            "",
            "",
            slide.auteur || "",
            "",
            "",
            "",
            "",
          ];
        } else if (slide.type === "type5") {
          return [
            pageNumber,
            "type 5",
            slide.texte1 || "",
            slide.texte2 || "",
            slide.texte3 || "",
            slide.texte4 || "",
            "",
            slide.promptImage1 || "",
            slide.promptImage2 || "",
            slide.promptImage3 || "",
            slide.promptImage4 || "",
          ];
        }

        return [pageNumber, "", "", "", "", "", "", "", "", "", ""];
      });

    fixedSlides.forEach((row) => data.push(row));

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Carrousel");
    XLSX.writeFile(workbook, "Modele_Carrousel_GdN.xlsx");
    toast.success("Fichier Excel téléchargé avec succès");
  };

  const renderSlideForm = (slide: Slide, index: number) => {
    if (slide.type === "Titre") {
      return (
        <Card className="border-2 border-blue-300 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">📌 Slide 1 - Titre (Obligatoire)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Thématique</Label>
              <Input
                value={slide.thematique || ""}
                onChange={(e) => updateSlide(index, "thematique", e.target.value)}
                placeholder="Ex: Intelligence Artificielle, Transformation digitale..."
              />
            </div>
            <div>
              <Label>Titre du carrousel</Label>
              <Input
                value={slide.titre || ""}
                onChange={(e) => updateSlide(index, "titre", e.target.value)}
                placeholder="Ex: 5 façons d'utiliser l'IA dans votre métier"
              />
            </div>
          </CardContent>
        </Card>
      );
    }

    if (slide.type === "Finale") {
      return (
        <Card className="border-2 border-green-300 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-900">✅ Slide 10 - Finale (Obligatoire)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nom de l'expert</Label>
              <Input
                value={slide.expert || ""}
                onChange={(e) => updateSlide(index, "expert", e.target.value)}
                placeholder="Ex: Frédéric Dedobbeleer"
              />
            </div>
            <div>
              <Label>Expertise</Label>
              <Input
                value={slide.expertise || ""}
                onChange={(e) => updateSlide(index, "expertise", e.target.value)}
                placeholder="Ex: Consultant en transformation digitale"
              />
            </div>
            <div>
              <Label>URL de l'offre</Label>
              <Input
                type="url"
                value={slide.url || ""}
                onChange={(e) => updateSlide(index, "url", e.target.value)}
                placeholder="https://guichetdunumerique.be/..."
              />
            </div>
          </CardContent>
        </Card>
      );
    }

    const charLimit = getCharLimit(slide.type);

    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Slide {slide.page}</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => removeSlide(index)}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Type de slide</Label>
            <Select
              value={slide.type}
              onValueChange={(value) => updateSlide(index, "type", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {enabledSlideTypes.map((type) => (
                  <SelectItem key={type.typeKey} value={type.typeKey}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {slide.type === "type5" ? (
            <>
              <div>
                <Label>Texte 1 (max {charLimit} car.)</Label>
                <Textarea
                  value={slide.texte1 || ""}
                  onChange={(e) => updateSlide(index, "texte1", e.target.value)}
                  maxLength={charLimit}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {(slide.texte1 || "").length}/{charLimit}
                </p>
              </div>
              <div>
                <Label>Texte 2 (max {charLimit} car.)</Label>
                <Textarea
                  value={slide.texte2 || ""}
                  onChange={(e) => updateSlide(index, "texte2", e.target.value)}
                  maxLength={charLimit}
                />
              </div>
              <div>
                <Label>Texte 3 (max {charLimit} car.)</Label>
                <Textarea
                  value={slide.texte3 || ""}
                  onChange={(e) => updateSlide(index, "texte3", e.target.value)}
                  maxLength={charLimit}
                />
              </div>
              <div>
                <Label>Texte 4 (max {charLimit} car.)</Label>
                <Textarea
                  value={slide.texte4 || ""}
                  onChange={(e) => updateSlide(index, "texte4", e.target.value)}
                  maxLength={charLimit}
                />
              </div>
              <div>
                <Label>Prompt Image 1</Label>
                <Input
                  value={slide.promptImage1 || ""}
                  onChange={(e) => updateSlide(index, "promptImage1", e.target.value)}
                />
              </div>
              <div>
                <Label>Prompt Image 2</Label>
                <Input
                  value={slide.promptImage2 || ""}
                  onChange={(e) => updateSlide(index, "promptImage2", e.target.value)}
                />
              </div>
              <div>
                <Label>Prompt Image 3</Label>
                <Input
                  value={slide.promptImage3 || ""}
                  onChange={(e) => updateSlide(index, "promptImage3", e.target.value)}
                />
              </div>
              <div>
                <Label>Prompt Image 4</Label>
                <Input
                  value={slide.promptImage4 || ""}
                  onChange={(e) => updateSlide(index, "promptImage4", e.target.value)}
                />
              </div>
            </>
          ) : slide.type === "type4" ? (
            <>
              <div>
                <Label>Citation (max {charLimit} car.)</Label>
                <Textarea
                  value={slide.texte1 || ""}
                  onChange={(e) => updateSlide(index, "texte1", e.target.value)}
                  maxLength={charLimit}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {(slide.texte1 || "").length}/{charLimit}
                </p>
              </div>
              <div>
                <Label>Auteur</Label>
                <Input
                  value={slide.auteur || ""}
                  onChange={(e) => updateSlide(index, "auteur", e.target.value)}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <Label>Texte (max {charLimit} car.)</Label>
                <Textarea
                  value={slide.texte1 || ""}
                  onChange={(e) => updateSlide(index, "texte1", e.target.value)}
                  maxLength={charLimit}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {(slide.texte1 || "").length}/{charLimit}
                </p>
              </div>
              {(slide.type === "type2" || slide.type === "type3") && (
                <div>
                  <Label>Prompt Image</Label>
                  <Input
                    value={slide.promptImage1 || ""}
                    onChange={(e) => updateSlide(index, "promptImage1", e.target.value)}
                    placeholder="Description de l'image à générer"
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold">Générateur de Carrousels</h1>
          <p className="text-muted-foreground mt-2">
            Créez votre carrousel pour le Guichet du Numérique
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Email de destination (optionnel)</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="email"
              value={emailDestination}
              onChange={(e) => setEmailDestination(e.target.value)}
              placeholder="email@example.com"
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          {slides.map((slide, index) => (
            <div key={index}>{renderSlideForm(slide, index)}</div>
          ))}
        </div>

        <div className="flex gap-4">
          <Button onClick={addSlide} disabled={slides.filter((s) => s.page !== 1 && s.page !== 10).length >= 8}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une slide
          </Button>
          <Button onClick={saveCarrousel} disabled={createCarrouselMutation.isPending}>
            {createCarrouselMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Enregistrer
          </Button>
          <Button onClick={exportToExcel} variant="secondary">
            <Download className="w-4 h-4 mr-2" />
            Télécharger Excel
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
