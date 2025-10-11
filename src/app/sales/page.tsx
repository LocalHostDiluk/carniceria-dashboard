"use client";
import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import {
  getActiveProducts,
  type ProductWithCategory,
} from "@/services/productService";
import { type CartItem, TicketItem } from "./components/TicketItem";
import { WeightInputDialog } from "./components/WeightInputDialog";

// Un componente simple para la tarjeta de producto en el POS
const PosProductCard = ({
  product,
  onSelect,
}: {
  product: ProductWithCategory;
  onSelect: () => void;
}) => (
  <Card
    onClick={onSelect}
    className="cursor-pointer hover:border-primary transition-colors"
  >
    <CardHeader className="p-2">
      <div className="aspect-square w-full bg-muted rounded-md mb-2"></div>
      <p className="font-semibold text-sm truncate">{product.name}</p>
    </CardHeader>
  </Card>
);

export default function SalesPage() {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductWithCategory | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getActiveProducts();
        setProducts(data);
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
  }, []);

  // ✅ CORRECCIÓN: La función ahora espera un objeto 'CartItem'
  const handleAddToCart = (itemToAdd: CartItem) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.product_id === itemToAdd.product_id
      );

      if (existingItem) {
        return currentCart.map((item) =>
          item.product_id === itemToAdd.product_id
            ? { ...item, quantity: item.quantity + itemToAdd.quantity }
            : item
        );
      } else {
        return [...currentCart, itemToAdd];
      }
    });
  };

  // Maneja la selección de un producto
  const handleProductSelect = (product: ProductWithCategory) => {
    if (product.unit_of_measure === "kg") {
      setSelectedProduct(product);
      setIsWeightModalOpen(true);
    } else {
      // ✅ CORRECCIÓN: Pasamos un objeto 'CartItem' bien formado
      handleAddToCart({
        product_id: product.product_id,
        name: product.name,
        price: product.sale_price,
        quantity: 1,
      });
    }
  };

  // ✅ CORRECCIÓN: Se eliminó el 'return cart' innecesario
  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    setCart((currentCart) => {
      if (newQuantity <= 0) {
        return currentCart.filter((item) => item.product_id !== productId);
      }
      return currentCart.map((item) =>
        item.product_id === productId
          ? { ...item, quantity: newQuantity }
          : item
      );
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.product_id !== productId)
    );
  };

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <WeightInputDialog
        isOpen={isWeightModalOpen}
        onClose={() => setIsWeightModalOpen(false)}
        product={selectedProduct}
        onConfirm={(productId, name, price, weight) => {
          // ✅ CORRECCIÓN: Pasamos un objeto 'CartItem' bien formado
          handleAddToCart({
            product_id: productId,
            name: name,
            price: price,
            quantity: weight,
          });
        }}
      />

      <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar productos..."
              className="w-full pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {isLoading ? (
              <p>Cargando productos...</p>
            ) : (
              filteredProducts.map((p) => (
                <PosProductCard
                  key={p.product_id}
                  product={p}
                  onSelect={() => handleProductSelect(p)}
                />
              ))
            )}
          </div>
        </div>

        <div className="sticky top-0">
          <Card>
            <CardHeader>
              <CardTitle>Ticket de Venta</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {cart.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <p>Añade productos para comenzar una venta.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <TicketItem
                    key={item.product_id}
                    item={item}
                    onIncrease={() =>
                      handleUpdateQuantity(item.product_id, item.quantity + 1)
                    }
                    onDecrease={() =>
                      handleUpdateQuantity(item.product_id, item.quantity - 1)
                    }
                    onRemove={() => handleRemoveFromCart(item.product_id)}
                  />
                ))
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <div className="w-full flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <Button className="w-full" size="lg" disabled={cart.length === 0}>
                Finalizar Venta
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
