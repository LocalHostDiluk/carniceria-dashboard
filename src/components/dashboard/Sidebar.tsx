// src/components/dashboard/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Package,
  ShoppingCart,
  LineChart,
  Tags,
  BookCheck,
  Receipt,
} from "lucide-react";
import Image from "next/image";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/sales", label: "Vender", icon: Receipt },
  { href: "/inventory", label: "Inventario", icon: Package },
  { href: "/products", label: "Productos", icon: Tags },
  { href: "/settings", label: "Categorias/Proveedores", icon: BookCheck },
  { href: "/purchases", label: "Compras", icon: ShoppingCart },
  { href: "/reports", label: "Reportes", icon: LineChart },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <div className="hidden border-r bg-white md:block">
      <div className="flex h-full max-h-screen flex-col gap-3">
        <div className="flex h-14 items-center border-b px-4 lg:h-[69px] lg:px-6 overflow-hidden">
          <Link href="/" className="flex items-center gap-5">
            <Image
              src="/img/laPicota.png"
              alt="Carnicería La Picota"
              width={60}
              height={60}
              className="rounded-full"
            />

            <div className="leading-none">
              <span className="block text-[22px] font-serif font-black uppercase text-slate-900">
                LA PICOTA
              </span>
              <span className="block text-[15px] text-red-700 -mt-[2px]">
                Carnicería
              </span>
            </div>
          </Link>
        </div>

        <div className="flex-1 py-4">
          <nav className="flex flex-col gap-2 px-2 text-sm font-medium lg:px-4">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;

              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 transition-colors
                    ${
                      isActive
                        ? "bg-[#FFE5E8] text-[#b91c1c]"
                        : "text-muted-foreground hover:bg-[#FFF3F5] hover:text-[#b91c1c]"
                    }
                  `}
                >
                  <Icon
                    className={`h-4 w-4 ${
                      isActive ? "text-[#b91c1c]" : "text-muted-foreground"
                    }`}
                  />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};
