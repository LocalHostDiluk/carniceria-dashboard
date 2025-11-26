"use client";
import {
  Home,
  LineChart,
  Menu,
  Package,
  ShoppingCart,
  DollarSign,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const { profile} = useUser();

  const [showCashModal, setShowCashModal] = useState(false);

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
    if (pathname === "/") {
      window.location.reload();
    }
  };

  return (
    <>
      <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[69px] lg:px-6">
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

              {profile?.role === "encargado" && (
                <div className="border-t pt-4 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowCashModal(true)}
                    className="w-full justify-start gap-2 border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
                  >
                    <DollarSign className="h-5 w-5" />
                    Cerrar Caja
                  </Button>
                </div>
              )}
            </nav>
          </SheetContent>
        </Sheet>

        <div className="w-full flex-1">
          <h1 className="text-lg font-semibold md:text-2xl">
            {pathname === "/" && "Dashboard"}
            {pathname === "/inventory" && "Inventario"}
            {pathname === "/sales" && "Punto de Venta"}
            {pathname === "/reports" && "Reportes"}
          </h1>
        </div>

        {profile?.role === "encargado" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCashModal(true)}
            className="hidden md:flex gap-2 border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
          >
            <DollarSign className="h-5 w-5" />
            Cerrar Caja
          </Button>
        )}

        <UserNav />
      </header>

      <CashClosureModal
        open={showCashModal}
        onOpenChange={setShowCashModal}
        onSuccess={handleCashClosureSuccess}
      />
    </>
  );
};
