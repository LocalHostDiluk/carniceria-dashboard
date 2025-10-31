import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { UserContextProvider } from "@/hooks/useUser"; // ✅ NO SE ME PUEDE OLVIDAR
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Carnicería Dashboard",
  description: "Sistema de gestión para carnicería",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary
          onError={(error) => {
            console.error("Error capturado por boundary principal:", error);
          }}
        >
          <UserContextProvider>{children}</UserContextProvider>
          <Toaster
            position="top-right"
            richColors
            closeButton
            duration={4000}
          />
        </ErrorBoundary>
      </body>
    </html>
  );
}
