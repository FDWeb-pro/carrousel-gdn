import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function UserProfile() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [fonction, setFonction] = useState("");

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setFonction(user.fonction || "");
    }
  }, [user]);

  const updateProfileMutation = trpc.users.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profil mis à jour avec succès");
      utils.auth.me.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la mise à jour du profil");
    },
  });

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("Le prénom et le nom sont obligatoires");
      return;
    }

    await updateProfileMutation.mutateAsync({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      fonction: fonction.trim(),
    });
  };

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container max-w-2xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>Mon Profil</CardTitle>
            <CardDescription>
              Modifiez vos informations personnelles. Ces informations seront utilisées par défaut dans le générateur de carrousels.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user.email || "Non renseigné"}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                L'email ne peut pas être modifié
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ex: Jean"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Ex: Dupont"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fonction">Fonction</Label>
              <Textarea
                id="fonction"
                value={fonction}
                onChange={(e) => setFonction(e.target.value)}
                placeholder="Ex: Consultant en transformation digitale"
                rows={3}
                className="resize-y"
              />
              <p className="text-xs text-muted-foreground">
                Cette fonction sera utilisée par défaut dans le champ "Expertise" du générateur
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                onClick={handleSave}
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? (
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
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
