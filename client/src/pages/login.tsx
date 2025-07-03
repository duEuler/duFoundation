import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginRequest } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login, isLoading, isAuthenticated } = useAuth();

  // Check setup status
  const { data: setupStatus } = useQuery({
    queryKey: ["/api/setup/status"],
  });

  useEffect(() => {
    if (setupStatus && !(setupStatus as any)?.setupCompleted) {
      setLocation("/setup");
    }
  }, [setupStatus, setLocation]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, setLocation]);

  const form = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginRequest) => {
    try {
      await login(data);
      // Redirecionamento adicional caso o hook não funcione
      setTimeout(() => {
        setLocation("/dashboard");
      }, 100);
    } catch (error) {
      // Error will be handled by the useAuth hook
      console.error("Login error:", error);
    }
  };

  if (!setupStatus || !(setupStatus as any)?.setupCompleted) {
    return (
      <div className="min-h-screen dueuler-gradient flex items-center justify-center">
        <div className="text-white text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
          <p>Verificando configuração do sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen dueuler-gradient flex items-center justify-center px-4">
      <Card className="w-full max-w-md card-shadow">
        <CardHeader className="text-center">
          <div className="w-16 h-16 dueuler-bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="text-white text-2xl" size={32} />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            DuEuler Foundation
          </CardTitle>
          <CardDescription>
            Sistema de Gestão Integrado
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Usuário</Label>
              <Input
                id="username"
                placeholder="Digite seu usuário"
                {...form.register("username")}
              />
              {form.formState.errors.username && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Digite sua senha"
                {...form.register("password")}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>



            <Button
              type="submit"
              className="w-full dueuler-bg-primary hover:bg-blue-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar no Sistema"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <a href="#" className="text-sm dueuler-primary hover:underline">
              Esqueceu sua senha?
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
