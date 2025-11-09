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
import ThematiqueAutocomplete from "@/components/ThematiqueAutocomplete";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  
  const getDefaultExpertName = () => {
    if (!user) return "";
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    return `${firstName} ${lastName}`.trim();
  };

  const getDefaultExpertise = () => {
    return user?.fonction || "";
  };

  const [slides, setSlides] = useState<Slide[]>([
    { page: 1, type: "Titre", thematique: "", titre: "" },
    { page: 10, type: "Finale", expert: getDefaultExpertName(), expertise: getDefaultExpertise(), url: "" },
  ]);
  const [carrouselId, setCarrouselId] = useState<number | null>(null);
  const [generatingPrompt, setGeneratingPrompt] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [location, navigate] = useLocation();

  // Détecter et charger les données de duplication depuis l'URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const duplicateParam = params.get('duplicate');
    
    if (duplicateParam) {
      try {
        const decodedData = JSON.parse(decodeURIComponent(atob(duplicateParam)));
        const parsedSlides = JSON.parse(decodedData.slides);
        
        // Charger les slides dupliquées
        setSlides(parsedSlides);
        setCarrouselId(null); // Réinitialiser l'ID pour créer un nouveau carrousel
        setHasUnsavedChanges(true); // Marquer comme modifié pour encourager la sauvegarde
        
        // Nettoyer l'URL
        window.history.replaceState({}, '', '/');
      } catch (error) {
        console.error('Erreur lors du chargement des données de duplication:', error);
        toast.error('Erreur lors de la duplication du carrousel');
      }
    }
  }, []);

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

    const firstEnabledType = enabledSlideTypes[0];
    if (!firstEnabledType) {
      toast.error("Aucun type de slide actif disponible");
      return;
    }

    const newSlide: Slide = {
      page: intermediateSlides.length + 2,
      type: firstEnabledType.typeKey,
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
    setHasUnsavedChanges(true);
  };

  const removeSlide = (index: number) => {
    const updatedSlides = slides.filter((_, i) => i !== index);
    const reindexed = updatedSlides.map((slide, idx) => {
      if (slide.type === "Titre") return { ...slide, page: 1 };
      if (slide.type === "Finale") return { ...slide, page: 10 };
      return { ...slide, page: idx + 1 };
    });
    setSlides(reindexed);
    setHasUnsavedChanges(true);
  };

  const updateSlide = (index: number, field: string, value: string) => {
    const updated = [...slides];
    updated[index] = { ...updated[index], [field]: value };
    setSlides(updated);
    setHasUnsavedChanges(true);
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
      setHasUnsavedChanges(false);
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
            "Type 1",
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
            "Type 2",
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
            "Type 3",
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
            "Type 4",
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
            "Type 5",
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
    let savedCarrouselId = carrouselId;
    
    if (!savedCarrouselId) {
      const titleSlide = slides.find((s) => s.type === "Titre");
      if (!titleSlide?.thematique || !titleSlide?.titre) {
        toast.error("⚠️ Veuillez remplir la thématique et le titre");
        return;
      }

      const intermediateSlides = slides.filter((s) => s.type !== "Titre" && s.type !== "Finale");
      if (intermediateSlides.length < 2) {
        toast.error("⚠️ Vous devez créer au moins 2 slides intermédiaires");
        return;
      }

      try {
        const result = await createCarrouselMutation.mutateAsync({
          titre: titleSlide.titre,
          thematique: titleSlide.thematique,
          emailDestination: undefined,
          slides: JSON.stringify(slides),
        });
        savedCarrouselId = result.id;
        setCarrouselId(result.id);
        setHasUnsavedChanges(false);
        toast.success("✅ Carrousel enregistré avec succès");
      } catch (error) {
        toast.error("⚠️ Erreur lors de l'enregistrement du carrousel");
        return;
      }
    }

    // Then, export to Excel
    exportToExcel();

    // Send email with the carrousel
    await sendEmailMutation.mutateAsync({
      carrouselId: savedCarrouselId,
      emailTo: undefined, // Will use SMTP destination email
    });
  };

  const resetCarrousel = () => {
    if (confirm("⚠️ Êtes-vous sûr de vouloir réinitialiser le carrousel ? Toutes les données non enregistrées seront perdues.")) {
      setSlides([
        { page: 1, type: "Titre", thematique: "", titre: "" },
        { page: 10, type: "Finale", expert: getDefaultExpertName(), expertise: getDefaultExpertise(), url: "" },
      ]);
      setCarrouselId(null);
      setHasUnsavedChanges(false);
      toast.success("✅ Carrousel réinitialisé");
    }
  };

  // Bloquer la navigation si des modifications non sauvegardées existent
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Fonction pour intercepter la navigation
  const handleBeforeNavigate = (targetPath: string): boolean => {
    if (hasUnsavedChanges && targetPath !== location) {
      setPendingNavigation(targetPath);
      setShowExitDialog(true);
      return false; // Bloquer la navigation
    }
    return true; // Autoriser la navigation
  };

  const handleConfirmExit = () => {
    setHasUnsavedChanges(false);
    setShowExitDialog(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  const handleCancelExit = () => {
    setShowExitDialog(false);
    setPendingNavigation(null);
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
              <Label className="mb-2 block">Thématique</Label>
              <ThematiqueAutocomplete
                value={slide.thematique || ""}
                onChange={(value) => updateSlide(index, "thematique", value)}
                placeholder="Ex: Intelligence Artificielle, Transformation digitale..."
              />
            </div>
            <div>
              <Label className="mb-2 block">Titre du carrousel</Label>
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
              <Label className="mb-2 block">Nom de l'expert</Label>
              <Input
                value={slide.expert || ""}
                onChange={(e) => updateSlide(index, "expert", e.target.value)}
                placeholder="Ex: Frédéric Dedobbeleer"
              />
            </div>
            <div>
              <Label className="mb-2 block">Expertise</Label>
              <Input
                value={slide.expertise || ""}
                onChange={(e) => updateSlide(index, "expertise", e.target.value)}
                placeholder="Ex: Consultant en transformation digitale"
              />
            </div>
            <div>
              <Label className="mb-2 block">URL de l'offre</Label>
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
            <Label className="mb-2 block">Type de slide</Label>
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
                <Label className="mb-2 block">Texte 1 (max {charLimit} car.)</Label>
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
                <Label className="mb-2 block">Texte 2 (max {charLimit} car.)</Label>
                <Textarea
                  value={slide.texte2 || ""}
                  onChange={(e) => updateSlide(index, "texte2", e.target.value)}
                  maxLength={charLimit}
                />
              </div>
              <div>
                <Label className="mb-2 block">Texte 3 (max {charLimit} car.)</Label>
                <Textarea
                  value={slide.texte3 || ""}
                  onChange={(e) => updateSlide(index, "texte3", e.target.value)}
                  maxLength={charLimit}
                />
              </div>
              <div>
                <Label className="mb-2 block">Texte 4 (max {charLimit} car.)</Label>
                <Textarea
                  value={slide.texte4 || ""}
                  onChange={(e) => updateSlide(index, "texte4", e.target.value)}
                  maxLength={charLimit}
                />
              </div>
              <div>
                <Label className="mb-2 block">Prompt Image 1</Label>
                <div className="flex gap-2">
                  <Textarea
                    value={slide.promptImage1 || ""}
                    onChange={(e) => updateSlide(index, "promptImage1", e.target.value)}
                    placeholder="Description de l'image à générer"
                    rows={3}
                    className="resize-y"
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
                <Label className="mb-2 block">Prompt Image 2</Label>
                <div className="flex gap-2">
                  <Textarea
                    value={slide.promptImage2 || ""}
                    onChange={(e) => updateSlide(index, "promptImage2", e.target.value)}
                    placeholder="Description de l'image à générer"
                    rows={3}
                    className="resize-y"
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
                <Label className="mb-2 block">Prompt Image 3</Label>
                <div className="flex gap-2">
                  <Textarea
                    value={slide.promptImage3 || ""}
                    onChange={(e) => updateSlide(index, "promptImage3", e.target.value)}
                    placeholder="Description de l'image à générer"
                    rows={3}
                    className="resize-y"
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
                <Label className="mb-2 block">Prompt Image 4</Label>
                <div className="flex gap-2">
                  <Textarea
                    value={slide.promptImage4 || ""}
                    onChange={(e) => updateSlide(index, "promptImage4", e.target.value)}
                    placeholder="Description de l'image à générer"
                    rows={3}
                    className="resize-y"
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
                <Label className="mb-2 block">Citation (max {charLimit} car.)</Label>
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
                <Label className="mb-2 block">Auteur</Label>
                <Input
                  value={slide.auteur || ""}
                  onChange={(e) => updateSlide(index, "auteur", e.target.value)}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <Label className="mb-2 block">Texte (max {charLimit} car.)</Label>
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
                  <Label className="mb-2 block">Prompt Image</Label>
                  <div className="flex gap-2">
                    <Textarea
                      value={slide.promptImage1 || ""}
                      onChange={(e) => updateSlide(index, "promptImage1", e.target.value)}
                      placeholder="Description de l'image à générer"
                      rows={3}
                      className="resize-y"
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
    <DashboardLayout onBeforeNavigate={handleBeforeNavigate}>
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

      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ Modifications non sauvegardées</AlertDialogTitle>
            <AlertDialogDescription>
              Vous avez des modifications non sauvegardées dans votre carrousel. Si vous quittez maintenant, ces modifications seront perdues.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelExit}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmExit} className="bg-destructive hover:bg-destructive/90">
              Quitter sans sauvegarder
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
