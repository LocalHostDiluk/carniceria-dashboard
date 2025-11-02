"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface DateRange {
  start_date: string;
  end_date: string;
}

interface DateRangePickerProps {
  onDateRangeChange: (range: DateRange) => void;
  isLoading?: boolean;
}

export function DateRangePicker({ onDateRangeChange, isLoading }: DateRangePickerProps) {
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return weekAgo.toISOString().split('T')[0];
  });
  
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const handleQuickSelect = (type: 'today' | 'week' | 'month') => {
    const today = new Date();
    let start: Date;

    switch (type) {
      case 'today':
        start = new Date(today);
        break;
      case 'week':
        start = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
    }

    const startStr = start.toISOString().split('T')[0];
    const endStr = today.toISOString().split('T')[0];
    
    setStartDate(startStr);
    setEndDate(endStr);
    onDateRangeChange({ start_date: startStr, end_date: endStr });
  };

  const handleCustomRange = () => {
    if (startDate && endDate && startDate <= endDate) {
      onDateRangeChange({ start_date: startDate, end_date: endDate });
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5" />
          Período de Consulta
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Botones rápidos */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickSelect('today')}
            disabled={isLoading}
          >
            Hoy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickSelect('week')}
            disabled={isLoading}
          >
            Últimos 7 días
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickSelect('month')}
            disabled={isLoading}
          >
            Este mes
          </Button>
        </div>

        {/* Rango personalizado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start-date">Fecha Inicio</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-date">Fecha Fin</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        <Button
          onClick={handleCustomRange}
          disabled={!startDate || !endDate || startDate > endDate || isLoading}
          className="w-full"
        >
          {isLoading ? "Cargando..." : "Aplicar Rango"}
        </Button>
      </CardContent>
    </Card>
  );
}
