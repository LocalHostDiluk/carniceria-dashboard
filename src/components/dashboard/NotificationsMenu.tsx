"use client";

import { useState, useEffect } from "react";
import { Bell, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { inventoryService } from "@/services/inventoryService";
import { useRouter } from "next/navigation";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "low_stock" | "expiry";
  timestamp: Date;
}

export function NotificationsMenu() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const alerts = await inventoryService.getInventoryAlerts(5, 7);

      const mappedNotifications: NotificationItem[] = alerts.map(
        (alert, index) => {
          // 1. Determinar tipo de alerta
          const isLowStock = alert.alert_type === "low_stock";

          // 2. Construir mensaje dinámico (Manejo de undefined)
          const value = alert.current_value ?? 0; // Fallback a 0 si es undefined
          const message = isLowStock
            ? `${alert.product_name} (${value} disponibles)`
            : `${alert.product_name} (Vence en ${value} días)`;

          return {
            id: `alert-${index}`,
            type: isLowStock ? "low_stock" : "expiry",
            title: isLowStock ? "Stock Bajo" : "Próximo a Caducar",
            message: message,
            timestamp: new Date(),
          };
        }
      );

      setNotifications(mappedNotifications);
    } catch (error) {
      console.error("Error cargando notificaciones", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar al montar y cada vez que se abra el menú
  useEffect(() => {
    loadNotifications();
    // Polling opcional: recargar cada 60 segundos
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // Refrescar al abrir para tener datos frescos
  useEffect(() => {
    if (isOpen) loadNotifications();
  }, [isOpen]);

  const handleClick = () => {
    setIsOpen(false);
    router.push("/inventory"); // Redirigir al inventario para resolver los problemas
  };

  const hasNotifications = notifications.length > 0;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {hasNotifications && (
            <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-600 border-2 border-background" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b bg-muted/10">
          <h4 className="font-semibold text-sm">Notificaciones</h4>
          {hasNotifications && (
            <Badge variant="secondary" className="text-xs">
              {notifications.length} pendientes
            </Badge>
          )}
        </div>

        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="p-4 text-center text-xs text-muted-foreground">
              Cargando alertas...
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground gap-2">
              <CheckCircle className="h-8 w-8 text-green-500/50" />
              <p className="text-sm">Todo está bajo control</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((item) => (
                <div
                  key={item.id}
                  className="p-4 hover:bg-muted/50 transition-colors cursor-pointer flex gap-3 items-start"
                  onClick={handleClick}
                >
                  <div
                    className={`mt-1 p-1.5 rounded-full shrink-0 ${
                      item.type === "expiry"
                        ? "bg-red-100 text-red-600"
                        : "bg-amber-100 text-amber-600"
                    }`}
                  >
                    {item.type === "expiry" ? (
                      <Clock className="h-4 w-4" />
                    ) : (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground/70">
                      Requiere atención inmediata
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {hasNotifications && (
          <div className="p-2 border-t bg-muted/10">
            <Button
              variant="ghost"
              className="w-full text-xs h-8"
              onClick={() => router.push("/inventory")}
            >
              Ver todo en Inventario
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
