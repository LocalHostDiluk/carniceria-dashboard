// src/components/dashboard/Header.tsx
"use client";
import {
  CircleUser,
  Home,
  LineChart,
  Menu,
  Package,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabaseClient";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"; // Importamos Sheet
import Link from "next/link";
import { UserNav } from "./UserNav";

export const Header = () => {
  const router = useRouter();
  const pathname = usePathname(); // Obtenemos la ruta actual

  // Función para manejar el cierre de sesión
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error("Error al cerrar sesión", { description: error.message });
    } else {
      toast.success("Has cerrado sesión exitosamente.");
      router.push("/login"); // Redirige al login
    }
  };

  const navLinks = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/inventory", label: "Inventario", icon: Package },
    { href: "/sales", label: "Ventas", icon: ShoppingCart },
    { href: "/reports", label: "Reportes", icon: LineChart },
  ];

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
      {/* --- Menú Hamburguesa para Móvil --- */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
          {/* 1. Solución de Accesibilidad y Header del Menú */}
          <SheetHeader className="text-left">
            <SheetTitle className="sr-only">Menú Principal</SheetTitle>
            <SheetDescription className="sr-only">
              Navega por las diferentes secciones del panel de administración.
            </SheetDescription>
          </SheetHeader>

          {/* 2. Diseño Mejorado de la Navegación */}
          <nav className="grid gap-2 text-lg font-medium">
            <Link
              href="#"
              className="flex items-center gap-2 text-lg font-semibold mb-4"
            >
              <Package className="h-6 w-6" />
              <span>Carnicería POS</span>
            </Link>
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 transition-colors ${
                    isActive
                      ? "bg-muted text-foreground" // Estilo para el enlace activo
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>

      {/* Dejamos este espacio por si queremos añadir un buscador o título en el futuro */}
      <div className="w-full flex-1">
        {/* Formulario de búsqueda (opcional) */}
      </div>

      {/* Menú de usuario */}
      <UserNav />
    </header>
  );
};
