import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { Download, Loader2, Mail, Trash2 } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export default function History() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const { data: carrousels, isLoading } = trpc.carrousels.list.useQuery();
  const deleteCarrouselMutation = trpc.carrousels.delete.useMutation({
    onSuccess: () => {
      toast.success("Carrousel supprimé avec succès");
      utils.carrousels.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la suppression");
    },
  });
  const sendEmailMutation = trpc.email.sendCarrousel.useMutation({
    onSuccess: () => {
      toast.success("Email envoyé avec succès");
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de l'envoi de l'email");
    },
  });

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
    XLSX.writeFile(workbook, `Carrousel_${carrousel.titre.replace(/[^a-z0-9]/gi, '_')}.xlsx`);
    toast.success("Fichier Excel téléchargé avec succès");
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
        <div>
          <h1 className="text-3xl font-bold">Historique des Carrousels</h1>
          <p className="text-muted-foreground mt-2">
            Consultez et téléchargez vos carrousels créés
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Carrousels</CardTitle>
            <CardDescription>
              {carrousels?.length || 0} carrousel(s) enregistré(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {carrousels && carrousels.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Thématique</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Date de création</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {carrousels.map((carrousel) => (
                    <TableRow key={carrousel.id}>
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
                Aucun carrousel créé pour le moment
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
