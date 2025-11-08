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
import { Download, Loader2, Mail, Plus, RotateCcw, Save, Sparkles, Trash2 } from "lucide-react";
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
  const [carrouselId, setCarrouselId] = useState<number | null>(null);
  const [generatingPrompt, setGeneratingPrompt] = useState<string | null>(null);

  const generateDescriptionMutation = trpc.ai.generateImageDescription.useMutation({
    onSuccess: (data, variables) => {
      toast.success("Description générée avec succès");
      setGeneratingPrompt(null);
    },
    onError: (error: { message: string }) => {
      toast.error(error.message || "Erreur lors de la génération");
      setGeneratingPrompt(null);
    },
  });

  const enabledSlideTypes = slideTypesConfig?.filter((t) => t.isActive === "true" && t.typeKey !== "titre" && t.typeKey !== "finale") || [];

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

  const handleGenerateDescription = async (slideIndex: number, promptField: string, textField: string) => {
    const slide = slides[slideIndex];
    const textContent = slide[textField as keyof Slide] as string;

    if (!textContent || textContent.trim() === "") {
      toast.error("Veuillez d'abord remplir le champ texte correspondant");
      return;
    }

    setGeneratingPrompt(`${slideIndex}-${promptField}`);

    try {
      const result = await generateDescriptionMutation.mutateAsync({ textContent });
      updateSlide(slideIndex, promptField, result.description);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const getCharLimit = (type: string) => {
    const config = slideTypesConfig?.find((t) => t.typeKey === type);
    return config?.charLimit || 0;
  };

  const getSlidePreviewImage = (type: string) => {
    const imageMap: Record<string, string> = {
      "Titre": "/slide-previews/titre.png",
      "type1": "/slide-previews/type1.png",
      "type2": "/slide-previews/type2.png",
      "type3": "/slide-previews/type3.png",
      "type4": "/slide-previews/type4.png",
      "type5": "/slide-previews/type5.png",
      "Finale": "/slide-previews/final.png",
    };
    return imageMap[type] || "";
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

    const result = await createCarrouselMutation.mutateAsync({
      titre: titleSlide.titre,
      thematique: titleSlide.thematique,
      emailDestination: undefined,
      slides: JSON.stringify(slides),
    });
    if (result.id) {
      setCarrouselId(result.id);
    }
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

  const sendEmailMutation = trpc.email.sendCarrousel.useMutation({
    onSuccess: () => {
      toast.success("✉️ Email envoyé avec succès");
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de l'envoi de l'email");
    },
  });

  const exportAndSendEmail = async () => {
    // First, save the carrousel if not already saved
    if (!carrouselId) {
      await saveCarrousel();
      // Wait a bit for the ID to be set
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    if (!carrouselId) {
      toast.error("⚠️ Erreur lors de l'enregistrement du carrousel");
      return;
    }

    // Then, export to Excel
    exportToExcel();

    // Send email with the carrousel
    await sendEmailMutation.mutateAsync({
      carrouselId: carrouselId,
      emailTo: undefined, // Will use SMTP destination email
    });
  };

  const resetCarrousel = () => {
    if (confirm("\u26a0\ufe0f \u00cates-vous s\u00fbr de vouloir r\u00e9initialiser le carrousel ? Toutes les donn\u00e9es non enregistr\u00e9es seront perdues.")) {
      setSlides([
        { page: 1, type: "Titre", thematique: "", titre: "" },
        { page: 10, type: "Finale", expert: "", expertise: "", url: "" },
      ]);
      setCarrouselId(null);
      toast.success("✅ Carrousel r\u00e9initialis\u00e9");
    }
  };

  const renderSlideForm = (slide: Slide, index: number) => {
    if (slide.type === "Titre") {
      return (
        <Card className="border-2 border-blue-300 bg-blue-50">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <CardTitle className="text-blue-900 flex-1">📌 Slide 1 - Titre (Obligatoire)</CardTitle>
              {getSlidePreviewImage(slide.type) && (
                <img 
                  src={getSlidePreviewImage(slide.type)} 
                  alt="Aperçu slide titre" 
                  className="w-32 h-32 object-cover rounded border-2 border-blue-400"
                />
              )}
            </div>
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
            <div className="flex items-start justify-between gap-4">
              <CardTitle className="text-green-900 flex-1">✅ Slide 10 - Finale (Obligatoire)</CardTitle>
              {getSlidePreviewImage(slide.type) && (
                <img 
                  src={getSlidePreviewImage(slide.type)} 
                  alt="Aperçu slide finale" 
                  className="w-32 h-32 object-cover rounded border-2 border-green-400"
                />
              )}
            </div>
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
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <CardTitle>Slide {slide.page}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => removeSlide(index)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
            {getSlidePreviewImage(slide.type) && (
              <img 
                src={getSlidePreviewImage(slide.type)} 
                alt={`Aperçu ${slide.type}`} 
                className="w-32 h-32 object-cover rounded border-2"
              />
            )}
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
                {enabledSlideTypes
                  .filter((type) => type.typeKey !== "titre" && type.typeKey !== "finale")
                  .map((type) => (
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
                <div className="flex gap-2">
                  <Input
                    value={slide.promptImage1 || ""}
                    onChange={(e) => updateSlide(index, "promptImage1", e.target.value)}
                    placeholder="Description de l'image à générer"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleGenerateDescription(index, "promptImage1", "texte1")}
                    disabled={generatingPrompt === `${index}-promptImage1`}
                    title="Générer une description avec l'IA"
                  >
                    {generatingPrompt === `${index}-promptImage1` ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div>
                <Label>Prompt Image 2</Label>
                <div className="flex gap-2">
                  <Input
                    value={slide.promptImage2 || ""}
                    onChange={(e) => updateSlide(index, "promptImage2", e.target.value)}
                    placeholder="Description de l'image à générer"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleGenerateDescription(index, "promptImage2", "texte2")}
                    disabled={generatingPrompt === `${index}-promptImage2`}
                    title="Générer une description avec l'IA"
                  >
                    {generatingPrompt === `${index}-promptImage2` ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div>
                <Label>Prompt Image 3</Label>
                <div className="flex gap-2">
                  <Input
                    value={slide.promptImage3 || ""}
                    onChange={(e) => updateSlide(index, "promptImage3", e.target.value)}
                    placeholder="Description de l'image à générer"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleGenerateDescription(index, "promptImage3", "texte3")}
                    disabled={generatingPrompt === `${index}-promptImage3`}
                    title="Générer une description avec l'IA"
                  >
                    {generatingPrompt === `${index}-promptImage3` ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div>
                <Label>Prompt Image 4</Label>
                <div className="flex gap-2">
                  <Input
                    value={slide.promptImage4 || ""}
                    onChange={(e) => updateSlide(index, "promptImage4", e.target.value)}
                    placeholder="Description de l'image à générer"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleGenerateDescription(index, "promptImage4", "texte4")}
                    disabled={generatingPrompt === `${index}-promptImage4`}
                    title="Générer une description avec l'IA"
                  >
                    {generatingPrompt === `${index}-promptImage4` ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                  </Button>
                </div>
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
                  <div className="flex gap-2">
                    <Input
                      value={slide.promptImage1 || ""}
                      onChange={(e) => updateSlide(index, "promptImage1", e.target.value)}
                      placeholder="Description de l'image à générer"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleGenerateDescription(index, "promptImage1", "texte1")}
                      disabled={generatingPrompt === `${index}-promptImage1`}
                      title="Générer une description avec l'IA"
                    >
                      {generatingPrompt === `${index}-promptImage1` ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  const intermediateCount = slides.filter((s) => s.page !== 1 && s.page !== 10).length;

  return (
    <DashboardLayout>
      {/* Barre d'actions fixe */}
      <div className="sticky top-0 z-50 bg-background border-b shadow-sm mb-6">
        <div className="container py-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button 
              onClick={addSlide} 
              disabled={intermediateCount >= 8}
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une slide ({intermediateCount}/8)
            </Button>
            <Button 
              onClick={saveCarrousel} 
              disabled={createCarrouselMutation.isPending}
              size="sm"
            >
              {createCarrouselMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Enregistrer
            </Button>
            <Button onClick={exportToExcel} variant="secondary" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Télécharger Excel
            </Button>
            <Button onClick={exportAndSendEmail} variant="default" size="sm">
              <Mail className="w-4 h-4 mr-2" />
              Envoyer et Télécharger
            </Button>
            <Button onClick={resetCarrousel} variant="destructive" size="sm">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-6 max-w-4xl mx-auto px-4">
        <div>
          <h1 className="text-3xl font-bold">Générateur de Carrousels</h1>
          <p className="text-muted-foreground mt-2">
            Créez votre carrousel pour le Guichet du Numérique
          </p>
        </div>

        <div className="space-y-4">
          {slides.map((slide, index) => (
            <div key={index}>{renderSlideForm(slide, index)}</div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
