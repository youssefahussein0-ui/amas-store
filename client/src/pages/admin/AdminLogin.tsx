import { useState } from "react";
import { useLocation } from "wouter";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import logoImg from "@assets/image_1772919891991.png";
import { Lock, Mail } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { login } = useAdminAuth();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({ title: t("admin.login.error"), description: t("admin.login.fillFields"), variant: "destructive" });
      return;
    }

    setIsLoading(true);
    const success = await login(username, password);
    setIsLoading(false);

    if (success) {
      toast({ title: t("admin.login.success"), description: t("admin.login.loggedIn") });
      setLocation("/admin");
    } else {
      toast({ title: t("admin.login.error"), description: t("admin.login.invalidCredentials"), variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md border-none shadow-2xl backdrop-blur-sm bg-background/80 relative z-10">
        <CardHeader className="flex flex-col items-center justify-center pb-6">
          <img src={logoImg} alt="Amas Admin" className="h-16 mb-4" />
          <CardTitle className="text-2xl font-serif text-primary">{t("admin.login.title")}</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">{t("admin.login.subtitle")}</p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6" data-testid="form-admin-login">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">{t("admin.login.username")}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-secondary pointer-events-none rtl:left-auto rtl:right-3" />
                <Input
                  type="text"
                  placeholder={t("admin.login.usernamePlaceholder")}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="ps-10 h-10 bg-background/50 border-secondary/30 focus:border-secondary transition-colors"
                  data-testid="input-username"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">{t("admin.login.password")}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-secondary pointer-events-none rtl:left-auto rtl:right-3" />
                <Input
                  type="password"
                  placeholder={t("admin.login.passwordPlaceholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="ps-10 h-10 bg-background/50 border-secondary/30 focus:border-secondary transition-colors"
                  data-testid="input-password"
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-10"
              disabled={isLoading}
              data-testid="button-login"
            >
              {isLoading ? t("admin.login.signingIn") : t("admin.login.signIn")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
