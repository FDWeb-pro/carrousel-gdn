import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Download, ExternalLink, FileText, HelpCircle, Link as LinkIcon, Loader2 } from "lucide-react";

export default function Help() {
  const { data: resources, isLoading } = trpc.help.list.useQuery();

  const fileResources = resources?.filter(r => r.type === 'file') || [];
  const linkResources = resources?.filter(r => r.type === 'link') || [];
  const cguResource = resources?.find(r => r.type === 'cgu');

  return (
    <DashboardLayout>
      <div className="space-y-6 p-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <HelpCircle className="w-8 h-8" />
            Aide et Documentation
          </h1>
          <p className="text-muted-foreground mt-2">
            Retrouvez ici toutes les ressources pour vous aider à utiliser l'application
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <>
            {fileResources.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Manuels et Documents
                  </CardTitle>
                  <CardDescription>
                    Téléchargez les manuels d'utilisation et guides
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {fileResources.map((resource) => (
                    <div key={resource.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{resource.title}</h3>
                        {resource.description && (
                          <p className="text-sm text-muted-foreground mt-1">{resource.description}</p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                      >
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4 mr-2" />
                          Télécharger
                        </a>
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {linkResources.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LinkIcon className="w-5 h-5" />
                    Ressources en Ligne
                  </CardTitle>
                  <CardDescription>
                    Accédez aux pages d'aide et tutoriels en ligne
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {linkResources.map((resource) => (
                    <div key={resource.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{resource.title}</h3>
                        {resource.description && (
                          <p className="text-sm text-muted-foreground mt-1">{resource.description}</p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                      >
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Ouvrir
                        </a>
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {cguResource && (
              <Card>
                <CardHeader>
                  <CardTitle>Conditions Générales d'Utilisation</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    asChild
                  >
                    <a href={cguResource.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Consulter les CGU
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}

            {!fileResources.length && !linkResources.length && !cguResource && (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune ressource d'aide n'est disponible pour le moment.</p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
