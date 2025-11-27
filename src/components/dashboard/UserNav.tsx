// src/components/dashboard/UserNav.tsx
"use client";
import { CircleUser } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";

export const UserNav = () => {
  const router = useRouter();
  const { profile, logout } = useUser();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Has cerrado sesión exitosamente.");
      router.push("/login");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error("Error al cerrar sesión", {
        description: error.message,
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full cursor-pointer bg-[#FFE5E8]  hover:bg-[#ffd4dc]"
        >
          <CircleUser className=" h-9 w-9 text-[#b91c1c]" />
          <span className="sr-only">Toggle user menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {/* Mostramos el nombre de usuario y rol */}
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {profile?.username || "Cargando..."}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {profile?.role}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Configuración</DropdownMenuItem>
        <DropdownMenuItem>Soporte</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          Cerrar Sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
