// src/components/dashboard/DashboardLayout.tsx
"use client";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
// Importaremos el Header en el siguiente paso

export const DashboardLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // Aquí irá la lógica para verificar si el usuario está logueado

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="flex flex-col">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
