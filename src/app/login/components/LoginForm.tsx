// src/app/login/components/LoginForm.tsx
"use client"; // Este componente es interactivo

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Lock, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

export const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: `${username}@carniceria.com`,
      password: password,
    });

    if (error) {
      toast.error("Error al iniciar sesión", {
        description:
          "Usuario o contraseña incorrectos. Por favor, inténtalo de nuevo.",
      });
    } else {
      toast.success("¡Inicio de sesión exitoso!", {
        description: "Redirigiendo al panel de administración...",
      });
      router.push("/");
    }

    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center py-12">
      <form onSubmit={handleLogin} className="mx-auto grid w-[350px] gap-6">
        <div className="grid gap-2 text-center">
          <h1 className="text-3xl font-bold">Bienvenido de Nuevo</h1>
          <p className="text-balance text-muted-foreground">
            Ingresa tus credenciales para administrar la Carnicería La Picota.
          </p>
        </div>
        <div className="grid gap-4">
          <div className="grid gap-2 relative">
            <Label htmlFor="username">Usuario</Label>
            <User className="absolute bottom-3 left-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="username"
              type="text"
              placeholder="ej: encargado1"
              required
              className="pl-10"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2 relative">
            <div className="flex items-center">
              <Label htmlFor="password">Contraseña</Label>
            </div>
            <Lock className="absolute bottom-3 left-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              required
              className="pl-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            className="w-full font-semibold py-6 text-md"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Ingresar al Panel"
            )}
          </Button>
        </div>
        <div className="mt-4 text-center text-sm">
          ¿Necesitas ayuda?{" "}
          <a href="#" className="underline">
            Contacta a soporte
          </a>
        </div>
      </form>
    </div>
  );
};
