// src/services/salesService.ts
import { supabase } from "@/lib/supabaseClient";
import type { CartItem } from "@/app/sales/components/TicketItem";

// Este tipo debe coincidir con el tipo 'cart_item' que creamos en SQL
type CartItemForDb = {
  product_id: string;
  quantity: number;
  price_at_sale: number;
};

export const processSale = async (
  userId: string,
  paymentMethod: "efectivo" | "tarjeta",
  totalAmount: number,
  cart: CartItem[]
) => {
  // 1. Transformamos el carrito del frontend al formato que la función DB espera
  const cartItemsForDb: CartItemForDb[] = cart.map((item) => ({
    product_id: item.product_id,
    quantity: item.quantity,
    price_at_sale: item.price,
  }));

  // 2. Llamamos a la función 'create_sale' en Supabase
  const { data, error } = await supabase.rpc("create_sale", {
    p_user_id: userId,
    p_payment_method: paymentMethod,
    p_total_amount: totalAmount,
    p_cart_items: cartItemsForDb,
  });

  if (error) {
    console.error("Error processing sale:", error);
    // Personalizamos el mensaje de error para el usuario
    if (error.message.includes("Stock insuficiente")) {
      throw new Error(
        "No hay suficiente stock para completar la venta. Revisa el inventario."
      );
    }
    throw new Error("Ocurrió un error al procesar la venta.");
  }

  // Si todo va bien, devolvemos el ID de la nueva venta
  return data;
};
