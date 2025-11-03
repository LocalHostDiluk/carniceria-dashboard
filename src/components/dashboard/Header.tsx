"use client";
import {
  CircleUser,
  Home,
  LineChart,
  Menu,
  Package,
  ShoppingCart,
  DollarSign,
} from "lucide-react";
import { useState } from "react";
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
} from "@/components/ui/sheet";
import Link from "next/link";
import { UserNav } from "./UserNav";
import { CashClosureModal } from "@/components/cash/CashClosureModal";
import { useUser } from "@/hooks/useUser";

export const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { profile } = useUser();

  // Estado para el modal de cierre
  const [showCashModal, setShowCashModal] = useState(false);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error("Error al cerrar sesión", { description: error.message });
    } else {
      toast.success("Has cerrado sesión exitosamente.");
      router.push("/login");
    }
  };

  const navLinks = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/inventory", label: "Inventario", icon: Package },
    { href: "/sales", label: "Ventas", icon: ShoppingCart },
    { href: "/reports", label: "Reportes", icon: LineChart },
  ];

  const handleCashClosureSuccess = () => {
    toast.success("🎉 Caja cerrada exitosamente", {
      description: "El cierre se ha registrado correctamente",
    });
    // Opcional: Refrescar datos del dashboard si estamos en la página principal
    if (pathname === "/") {
      window.location.reload();
    }
  };

  return (
    <>
      <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
        {/* Menú Hamburguesa para Móvil */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col">
            <SheetHeader className="text-left">
              <SheetTitle className="sr-only">Menú Principal</SheetTitle>
              <SheetDescription className="sr-only">
                Navega por las diferentes secciones del panel de administración.
              </SheetDescription>
            </SheetHeader>

            <nav className="grid gap-2 text-lg font-medium">
              <Link
                href="#"
                className="flex items-center gap-2 text-lg font-semibold mb-4"
              >
                <Package className="h-6 w-6" />
                <span>Carnicería La Picota</span>
              </Link>
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 transition-colors ${
                      isActive
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <link.icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                );
              })}

              {/* Botón de cierre en el menú móvil - Solo para encargados */}
              {profile?.role === "encargado" && (
                <>
                  <div className="border-t pt-4 mt-4">
                    <Button
                      variant="secondary"
                      onClick={() => setShowCashModal(true)}
                      className="w-full justify-start"
                    >
                      <DollarSign className="h-5 w-5 mr-4" />
                      Cerrar Caja
                    </Button>
                  </div>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Título/Breadcrumb */}
        <div className="w-full flex-1">
          <h1 className="text-lg font-semibold md:text-2xl">
            {pathname === "/" && "Dashboard"}
            {pathname === "/inventory" && "Inventario"}
            {pathname === "/sales" && "Punto de Venta"}
            {pathname === "/reports" && "Reportes"}
          </h1>
        </div>

        {/* Botón de cierre de caja - Solo desktop y solo para encargados */}
        {profile?.role === "encargado" && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowCashModal(true)}
            className="hidden md:flex gap-2"
          >
            <DollarSign className="h-4 w-4" />
            Cerrar Caja
          </Button>
        )}

        {/* Menú de usuario */}
        <UserNav />
      </header>

      {/* Modal de cierre de caja */}
      <CashClosureModal
        open={showCashModal}
        onOpenChange={setShowCashModal}
        onSuccess={handleCashClosureSuccess}
      />
    </>
  );
};
