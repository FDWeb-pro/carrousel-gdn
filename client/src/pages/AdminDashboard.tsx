import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, FileText, HelpCircle, LayoutDashboard, Mail, Settings, Shield, Sliders, Sparkles, Users } from "lucide-react";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const adminCards = [
    {
      title: "Utilisateurs",
      description: "Gérer les utilisateurs, rôles et permissions",
      icon: Users,
      path: "/admin/users",
      color: "text-blue-600",
      roles: ['admin', 'super_admin']
    },
    {
      title: "Types de Slides",
      description: "Configurer les différents types de slides disponibles",
      icon: Settings,
      path: "/admin/slide-types",
      color: "text-purple-600",
      roles: ['admin', 'super_admin']
    },
    {
      title: "Paramètres de Marque",
      description: "Personnaliser le nom, logo et description de votre structure",
      icon: Building2,
      path: "/admin/brand-config",
      color: "text-green-600",
      roles: ['admin', 'super_admin']
    },
    {
      title: "Configuration Slides",
      description: "Définir le nombre minimum et maximum de slides",
      icon: Sliders,
      path: "/admin/slide-config",
      color: "text-orange-600",
      roles: ['admin', 'super_admin']
    },
    {
      title: "Gestion de l'Aide",
      description: "Gérer les ressources d'aide, fichiers et liens",
      icon: HelpCircle,
      path: "/admin/help",
      color: "text-cyan-600",
      roles: ['admin', 'super_admin']
    },
    {
      title: "Configuration SMTP",
      description: "Configurer les paramètres d'envoi d'emails",
      icon: Mail,
      path: "/admin/smtp",
      color: "text-red-600",
      roles: ['super_admin']
    },
    {
      title: "Configuration IA",
      description: "Configurer l'API d'intelligence artificielle",
      icon: Sparkles,
      path: "/admin/ai-config",
      color: "text-yellow-600",
      roles: ['super_admin']
    },
    {
      title: "Historique d'Audit",
      description: "Consulter l'historique des actions importantes",
      icon: Shield,
      path: "/admin/audit",
      color: "text-gray-600",
      roles: ['admin', 'super_admin']
    },
  ];

  const accessibleCards = adminCards.filter(card => 
    !card.roles || card.roles.includes(user?.role || 'membre')
  );

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <p className="text-destructive">Accès refusé. Seuls les administrateurs peuvent accéder à cette page.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <LayoutDashboard className="w-8 h-8" />
            Tableau de Bord Administration
          </h1>
          <p className="text-muted-foreground mt-2">
            Accédez rapidement à tous les outils d'administration
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accessibleCards.map((card) => (
            <Card
              key={card.path}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setLocation(card.path)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg bg-muted ${card.color}`}>
                    <card.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{card.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{card.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {user.role === 'super_admin' && (
          <div className="mt-8 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Super Admin :</strong> Vous avez accès à toutes les fonctionnalités d'administration, y compris la configuration SMTP et IA.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
