import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

export default function TestSmtp() {
  const { data: testResult, isLoading, refetch } = trpc.email.testSmtpConfig.useQuery();
  const { data: logs, refetch: refetchLogs } = trpc.email.getLogs.useQuery(undefined, {
    refetchInterval: 2000, // Auto-refresh every 2 seconds
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Test Configuration SMTP</h1>
          <p className="text-muted-foreground">
            Vérifiez que votre configuration SMTP est correctement enregistrée
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>État de la configuration</CardTitle>
            <CardDescription>
              Diagnostic de la configuration SMTP dans la base de données
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Vérification en cours...</span>
              </div>
            ) : testResult ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {testResult.isValid ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="font-semibold">
                    {testResult.isValid
                      ? "✅ Configuration valide"
                      : "❌ Configuration invalide ou incomplète"}
                  </span>
                </div>

                <div className="border rounded-lg p-4 space-y-2 bg-muted/50">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="font-medium">Configuration existe :</div>
                    <div>{testResult.exists ? "✅ Oui" : "❌ Non"}</div>

                    <div className="font-medium">Serveur SMTP (host) :</div>
                    <div>{testResult.host || "❌ Non défini"}</div>

                    <div className="font-medium">Port :</div>
                    <div>{testResult.port || "❌ Non défini"}</div>

                    <div className="font-medium">Sécurisé (SSL/TLS) :</div>
                    <div>{testResult.secure === 1 ? "✅ Oui" : "Non"}</div>

                    <div className="font-medium">Nom d'utilisateur :</div>
                    <div>{testResult.user || "❌ Non défini"}</div>

                    <div className="font-medium">Mot de passe :</div>
                    <div>{testResult.hasPass ? "✅ Défini" : "❌ Non défini"}</div>

                    <div className="font-medium">Email d'expédition :</div>
                    <div>{testResult.from || "Non défini (utilisera le nom d'utilisateur)"}</div>

                    <div className="font-medium">Email de destination :</div>
                    <div>{testResult.destinationEmail || "❌ Non défini"}</div>
                  </div>
                </div>

                {!testResult.isValid && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>⚠️ Champs manquants :</strong>
                      <br />
                      Pour que l'envoi d'email fonctionne, vous devez renseigner :
                      {!testResult.host && <><br />• Serveur SMTP (host)</>}
                      {!testResult.user && <><br />• Nom d'utilisateur</>}
                      {!testResult.hasPass && <><br />• Mot de passe</>}
                      {!testResult.destinationEmail && <><br />• Email de destination</>}
                    </p>
                  </div>
                )}
              </div>
            ) : null}

            <Button onClick={() => refetch()} variant="outline">
              Rafraîchir le test
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Logs d'envoi d'email</CardTitle>
            <CardDescription>
              Logs en temps réel des tentatives d'envoi d'email (rafraîchissement automatique)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {logs && logs.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {logs.map((log, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border text-sm ${
                      log.level === 'error'
                        ? 'bg-red-50 border-red-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="font-medium">
                          {log.level === 'error' ? '❌' : '✅'} {log.message}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(log.timestamp).toLocaleString('fr-FR')}
                        </div>
                        {log.data && (
                          <pre className="mt-2 text-xs bg-white/50 p-2 rounded overflow-x-auto">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">
                Aucun log d'email pour le moment. Essayez d'envoyer un email pour voir les logs apparaître ici.
              </div>
            )}
            <Button onClick={() => refetchLogs()} variant="outline" size="sm">
              Rafraîchir les logs
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
