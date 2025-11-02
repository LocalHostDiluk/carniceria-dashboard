"use client";
import { Button } from "@/components/ui/button";
import { MinusCircle, PlusCircle, Trash2 } from "lucide-react";

export interface CartItem {
  product_id: string;
  name: string;
  quantity: number;
  price: number;
}

// Definimos las funciones que el componente recibirá
interface TicketItemProps {
  item: CartItem;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}

export const TicketItem = ({
  item,
  onIncrease,
  onDecrease,
  onRemove,
}: TicketItemProps) => {
  // ✅ Añadimos un valor por defecto para 'price' para evitar el error 'toFixed'
  const price = item.price || 0;

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium">{item.name}</p>
        <p className="text-sm text-muted-foreground">
          {item.quantity.toFixed(3)} x ${price.toFixed(2)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {/* Conectamos las funciones a los botones */}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onDecrease}
        >
          <MinusCircle className="h-4 w-4" />
        </Button>
        <span className="w-12 text-center font-medium">
          {item.quantity.toFixed(3)}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onIncrease}
        >
          <PlusCircle className="h-4 w-4" />
        </Button>
        <Button
          variant="destructive"
          size="icon"
          className="h-7 w-7 ml-2"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
