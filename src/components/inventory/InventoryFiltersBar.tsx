"use client";

import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import type { InventoryFilters } from "@/services/inventoryService";

interface Props {
  onFilterChange: (filters: InventoryFilters) => void;
}

export function InventoryFiltersBar({ onFilterChange }: Props) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");

  // Debounce para no buscar en cada tecla
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    onFilterChange({
      search: debouncedSearch,
      status: status as any,
    });
  }, [debouncedSearch, status]);

  const clearFilters = () => {
    setSearch("");
    setStatus("all");
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 bg-muted/20 rounded-lg border mb-6">
      {/* Buscador */}
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar producto o categoría..."
          className="pl-9 bg-background"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Filtro de Estado */}
      <div className="w-full md:w-[200px]">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="bg-background">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Estado" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="low_stock">⚠️ Stock Bajo</SelectItem>
            <SelectItem value="near_expiry">⏰ Por Caducar</SelectItem>
            <SelectItem value="ok">✅ Normal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Botón Limpiar (solo si hay filtros activos) */}
      {(search || status !== "all") && (
        <Button
          variant="ghost"
          onClick={clearFilters}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4 mr-2" />
          Limpiar
        </Button>
      )}
    </div>
  );
}
