"use client";

import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SortableHeaderProps {
  label: string;
  column: string;
  currentSort: string;
  currentDirection: "asc" | "desc";
  onSort: (column: string) => void;
  className?: string;
}

export function SortableHeader({
  label,
  column,
  currentSort,
  currentDirection,
  onSort,
  className,
}: SortableHeaderProps) {
  const isActive = currentSort === column;

  return (
    <Button
      variant="ghost"
      onClick={() => onSort(column)}
      className={cn("-ml-4 h-8 data-[state=open]:bg-accent", className)}
    >
      <span>{label}</span>
      {isActive ? (
        currentDirection === "asc" ? (
          <ArrowUp className="ml-2 h-4 w-4" />
        ) : (
          <ArrowDown className="ml-2 h-4 w-4" />
        )
      ) : (
        <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground/50" />
      )}
    </Button>
  );
}
