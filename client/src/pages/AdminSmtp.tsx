import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { Loader2, Mail, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminSmtp() {
  const { data: smtpConfig, isLoading } = trpc.smtp.get.useQuery();
  const updateMutation = trpc.smtp.update.useMutation({
    onSuccess: () => {
      toast.success("Configuration SMTP mise à jour avec succès");
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la mise à jour");
    },
  });

  const [form, setForm] = useState({
    host: "",
    port: 587,
    secure: false,
    user: "",
    pass: "",
    from: "",
    destinationEmail: "",
  });

  useEffect(() => {
    if (smtpConfig) {
      setForm({
        host: smtpConfig.host || "",
        port: smtpConfig.port || 587,
        secure: smtpConfig.secure === 1,
        user: smtpConfig.user || "",
        pass: smtpConfig.pass || "",
        from: smtpConfig.from || "",
        destinationEmail: smtpConfig.destinationEmail || "",
      });
    }
  }, [smtpConfig]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateMutation.mutateAsync({
      host: form.host,
      port: form.port,
      secure: form.secure ? 1 : 0,
      user: form.user,
      pass: form.pass,
      from: form.from,
      destinationEmail: form.destinationEmail,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Configuration SMTP</h1>
          <p className="text-muted-foreground mt-2">
            Configurez les paramètres d'envoi d'emails
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
                <Mail className="w-5 h-5" />
                <CardTitle>Paramètres SMTP</CardTitle>
              </div>
              <CardDescription>
                Ces paramètres permettent d'envoyer des emails depuis l'application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="host">Serveur SMTP *</Label>
                    <Input
                      id="host"
                      value={form.host}
                      onChange={(e) => setForm({ ...form, host: e.target.value })}
                      placeholder="smtp.gmail.com"
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      Ex: smtp.gmail.com, smtp.office365.com
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="port">Port *</Label>
                    <Input
                      id="port"
                      type="number"
                      value={form.port}
                      onChange={(e) => setForm({ ...form, port: parseInt(e.target.value) })}
                      placeholder="587"
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      Généralement 587 (TLS) ou 465 (SSL)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="secure"
                    checked={form.secure}
                    onCheckedChange={(checked) => setForm({ ...form, secure: checked })}
                  />
                  <Label htmlFor="secure">Utiliser SSL/TLS</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user">Nom d'utilisateur / Email *</Label>
                  <Input
                    id="user"
                    type="email"
                    value={form.user}
                    onChange={(e) => setForm({ ...form, user: e.target.value })}
                    placeholder="votre-email@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pass">Mot de passe *</Label>
                  <Input
                    id="pass"
                    type="password"
                    value={form.pass}
                    onChange={(e) => setForm({ ...form, pass: e.target.value })}
                    placeholder="••••••••"
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Pour Gmail, utilisez un "mot de passe d'application"
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="from">Email d'expédition (optionnel)</Label>
                  <Input
                    id="from"
                    type="email"
                    value={form.from}
                    onChange={(e) => setForm({ ...form, from: e.target.value })}
                    placeholder="noreply@example.com"
                  />
                  <p className="text-sm text-muted-foreground">
                    Si vide, utilise le nom d'utilisateur
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destinationEmail">Email de destination *</Label>
                  <Input
                    id="destinationEmail"
                    type="email"
                    value={form.destinationEmail}
                    onChange={(e) => setForm({ ...form, destinationEmail: e.target.value })}
                    placeholder="destination@example.com"
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Adresse email qui recevra tous les fichiers Excel générés
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Enregistrer
                      </>
                    )}
                  </Button>
                </div>
              </form>

              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Configuration Gmail</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                  <li>Activez la validation en 2 étapes sur votre compte Google</li>
                  <li>Allez dans "Mots de passe d'application" dans les paramètres de sécurité</li>
                  <li>Créez un nouveau mot de passe d'application pour "Mail"</li>
                  <li>Utilisez ce mot de passe ici (pas votre mot de passe Google habituel)</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
