import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { Download, FileArchive, Loader2, Mail, Search, Trash2, X } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import JSZip from "jszip";

export default function History() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const { data: carrousels, isLoading } = trpc.carrousels.list.useQuery();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterThematique, setFilterThematique] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<string>("all");

  const deleteCarrouselMutation = trpc.carrousels.delete.useMutation({
    onSuccess: () => {
      toast.success("Carrousel supprimé avec succès");
      utils.carrousels.list.invalidate();
    },
    onError: (error: { message: string }) => {
      toast.error(error.message || "Erreur lors de la suppression");
    },
  });

  const sendEmailMutation = trpc.email.sendCarrousel.useMutation({
    onSuccess: () => {
      toast.success("Email envoyé avec succès");
    },
    onError: (error: { message: string }) => {
      toast.error(error.message || "Erreur lors de l'envoi de l'email");
    },
  });

  // Extract unique thematiques for filter
  const uniqueThematiques = useMemo(() => {
    if (!carrousels) return [];
    const thematiques = new Set(carrousels.map(c => c.thematique));
    return Array.from(thematiques).sort();
  }, [carrousels]);

  // Filtered carrousels based on search and filters
  const filteredCarrousels = useMemo(() => {
    if (!carrousels) return [];
    
    return carrousels.filter(c => {
      // Search filter
      const matchesSearch = searchTerm === "" || 
        c.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.thematique.toLowerCase().includes(searchTerm.toLowerCase());

      // Thematique filter
      const matchesThematique = filterThematique === "all" || c.thematique === filterThematique;

      // Date filter
      let matchesDate = true;
      if (filterDate !== "all") {
        const createdDate = new Date(c.createdAt);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (filterDate === "today") matchesDate = daysDiff === 0;
        else if (filterDate === "week") matchesDate = daysDiff <= 7;
        else if (filterDate === "month") matchesDate = daysDiff <= 30;
        else if (filterDate === "year") matchesDate = daysDiff <= 365;
      }

      return matchesSearch && matchesThematique && matchesDate;
    });
  }, [carrousels, searchTerm, filterThematique, filterDate]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredCarrousels.map(c => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) {
      toast.error("Aucun carrousel sélectionné");
      return;
    }

    if (confirm(`Êtes-vous sûr de vouloir supprimer ${selectedIds.length} carrousel(s) ?`)) {
      try {
        for (const id of selectedIds) {
          await deleteCarrouselMutation.mutateAsync({ id });
        }
        setSelectedIds([]);
        toast.success(`${selectedIds.length} carrousel(s) supprimé(s) avec succès`);
      } catch (error) {
        toast.error("Erreur lors de la suppression groupée");
      }
    }
  };

  const generateExcelBuffer = (carrousel: any): ArrayBuffer => {
    const slides = JSON.parse(carrousel.slides);
    const workbook = XLSX.utils.book_new();
    const data: any[][] = [];

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

    const intermediateSlides = slides.filter((s: any) => s.type !== "Titre" && s.type !== "Finale");
    const fixedSlides = Array(10)
      .fill(null)
      .map((_, idx) => {
        const pageNumber = idx + 1;

        if (pageNumber === 1) {
          const titleSlide = slides.find((s: any) => s.type === "Titre");
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
          const finalSlide = slides.find((s: any) => s.type === "Finale");
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
    
    return XLSX.write(workbook, { type: "array", bookType: "xlsx" });
  };

  const handleDownloadSelected = async () => {
    if (selectedIds.length === 0) {
      toast.error("Aucun carrousel sélectionné");
      return;
    }

    if (!carrousels) return;

    const selectedCarrousels = carrousels.filter(c => selectedIds.includes(c.id));

    if (selectedCarrousels.length === 1) {
      // Single file download
      const carrousel = selectedCarrousels[0];
      const buffer = generateExcelBuffer(carrousel);
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Carrousel_${carrousel.titre.replace(/[^a-z0-9]/gi, '_')}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Fichier téléchargé avec succès");
    } else {
      // Multiple files - create ZIP
      const zip = new JSZip();

      selectedCarrousels.forEach((carrousel) => {
        const buffer = generateExcelBuffer(carrousel);
        const fileName = `Carrousel_${carrousel.titre.replace(/[^a-z0-9]/gi, '_')}.xlsx`;
        zip.file(fileName, buffer);
      });

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Carrousels_${new Date().toISOString().split('T')[0]}.zip`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success(`${selectedCarrousels.length} fichier(s) téléchargé(s) en ZIP`);
    }

    setSelectedIds([]);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce carrousel ?")) {
      await deleteCarrouselMutation.mutateAsync({ id });
    }
  };

  const handleSendEmail = async (carrousel: any) => {
    if (!carrousel.emailDestination) {
      toast.error("Aucune adresse email n'est associée à ce carrousel");
      return;
    }
    if (confirm(`Envoyer le carrousel par email à ${carrousel.emailDestination} ?`)) {
      await sendEmailMutation.mutateAsync({ 
        carrouselId: carrousel.id, 
        emailTo: carrousel.emailDestination 
      });
    }
  };

  const handleDownload = (carrousel: any) => {
    const buffer = generateExcelBuffer(carrousel);
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Carrousel_${carrousel.titre.replace(/[^a-z0-9]/gi, '_')}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Fichier Excel téléchargé avec succès");
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterThematique("all");
    setFilterDate("all");
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

  const allSelected = filteredCarrousels.length > 0 && selectedIds.length === filteredCarrousels.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < filteredCarrousels.length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Historique des Carrousels</h1>
            <p className="text-muted-foreground mt-2">
              Consultez et téléchargez vos carrousels créés
            </p>
          </div>
          {selectedIds.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleDownloadSelected}
              >
                <FileArchive className="w-4 h-4 mr-2" />
                Télécharger ({selectedIds.length})
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteSelected}
                disabled={deleteCarrouselMutation.isPending}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer ({selectedIds.length})
              </Button>
            </div>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtres et Recherche</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Label>Rechercher</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par titre ou thématique..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label>Thématique</Label>
                <Select value={filterThematique} onValueChange={setFilterThematique}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    {uniqueThematiques.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Période</Label>
                <Select value={filterDate} onValueChange={setFilterDate}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    <SelectItem value="today">Aujourd'hui</SelectItem>
                    <SelectItem value="week">Cette semaine</SelectItem>
                    <SelectItem value="month">Ce mois</SelectItem>
                    <SelectItem value="year">Cette année</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {(searchTerm || filterThematique !== "all" || filterDate !== "all") && (
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
            <CardTitle>Carrousels</CardTitle>
            <CardDescription>
              {filteredCarrousels.length} carrousel(s) trouvé(s) sur {carrousels?.length || 0} au total
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredCarrousels.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={handleSelectAll}
                        aria-label="Tout sélectionner"
                      />
                    </TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead>Thématique</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Date de création</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCarrousels.map((carrousel) => (
                    <TableRow key={carrousel.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(carrousel.id)}
                          onCheckedChange={(checked) => handleSelectOne(carrousel.id, checked as boolean)}
                          aria-label={`Sélectionner ${carrousel.titre}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{carrousel.titre}</TableCell>
                      <TableCell>{carrousel.thematique}</TableCell>
                      <TableCell>{carrousel.emailDestination || "—"}</TableCell>
                      <TableCell>
                        {new Date(carrousel.createdAt).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(carrousel)}
                            title="Télécharger Excel"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          {carrousel.emailDestination && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSendEmail(carrousel)}
                              disabled={sendEmailMutation.isPending}
                              title="Envoyer par email"
                            >
                              <Mail className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(carrousel.id)}
                            disabled={deleteCarrouselMutation.isPending}
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                {carrousels && carrousels.length > 0 
                  ? "Aucun carrousel ne correspond aux critères de recherche"
                  : "Aucun carrousel créé pour le moment"}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
