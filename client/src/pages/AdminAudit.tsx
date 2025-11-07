import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
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
import { FileText, Loader2 } from "lucide-react";

export default function AdminAudit() {
  const { data: auditLogs, isLoading } = trpc.audit.list.useQuery({ limit: 100 });

  const getActionBadge = (action: string) => {
    const styles: Record<string, string> = {
      create_carrousel: "bg-green-100 text-green-800 border-green-300",
      delete_carrousel: "bg-red-100 text-red-800 border-red-300",
      approve_user: "bg-blue-100 text-blue-800 border-blue-300",
      reject_user: "bg-orange-100 text-orange-800 border-orange-300",
      update_user_role: "bg-purple-100 text-purple-800 border-purple-300",
      delete_user: "bg-red-100 text-red-800 border-red-300",
      update_smtp_config: "bg-gray-100 text-gray-800 border-gray-300",
      create_slide_type: "bg-green-100 text-green-800 border-green-300",
      delete_slide_type: "bg-red-100 text-red-800 border-red-300",
    };

    const labels: Record<string, string> = {
      create_carrousel: "Création carrousel",
      delete_carrousel: "Suppression carrousel",
      approve_user: "Approbation utilisateur",
      reject_user: "Rejet utilisateur",
      update_user_role: "Modification rôle",
      delete_user: "Suppression utilisateur",
      update_smtp_config: "Config SMTP",
      create_slide_type: "Création type slide",
      delete_slide_type: "Suppression type slide",
    };

    return (
      <Badge variant="outline" className={styles[action] || "bg-gray-100 text-gray-800 border-gray-300"}>
        {labels[action] || action}
      </Badge>
    );
  };

  const getEntityBadge = (entityType: string) => {
    const styles: Record<string, string> = {
      carrousel: "bg-blue-50 text-blue-700",
      user: "bg-purple-50 text-purple-700",
      slideType: "bg-green-50 text-green-700",
      smtp: "bg-gray-50 text-gray-700",
    };

    return (
      <Badge variant="secondary" className={styles[entityType] || "bg-gray-50 text-gray-700"}>
        {entityType}
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Historique d'Audit</h1>
          <p className="text-muted-foreground mt-2">
            Consultez l'historique des actions importantes effectuées dans l'application
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                <CardTitle>Journal d'activité</CardTitle>
              </div>
              <CardDescription>
                {auditLogs?.length || 0} action(s) enregistrée(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Type d'entité</TableHead>
                    <TableHead>ID Entité</TableHead>
                    <TableHead>Détails</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs && auditLogs.length > 0 ? (
                    auditLogs.map((log) => {
                      let details = null;
                      try {
                        details = log.details ? JSON.parse(log.details) : null;
                      } catch (e) {
                        details = log.details;
                      }

                      return (
                        <TableRow key={log.id}>
                          <TableCell className="whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleString("fr-FR", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </TableCell>
                          <TableCell className="font-medium">
                            {log.userName || "—"}
                          </TableCell>
                          <TableCell>
                            {getActionBadge(log.action)}
                          </TableCell>
                          <TableCell>
                            {getEntityBadge(log.entityType)}
                          </TableCell>
                          <TableCell>
                            {log.entityId || "—"}
                          </TableCell>
                          <TableCell className="max-w-md">
                            {details ? (
                              <div className="text-sm text-muted-foreground">
                                {typeof details === "object" ? (
                                  <div className="space-y-1">
                                    {Object.entries(details).map(([key, value]) => (
                                      <div key={key}>
                                        <span className="font-medium">{key}:</span>{" "}
                                        {String(value)}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  String(details)
                                )}
                              </div>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Aucune action enregistrée
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
