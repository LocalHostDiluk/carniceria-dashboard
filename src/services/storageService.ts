import { supabase } from "@/lib/supabaseClient";

export class StorageService {
  private bucketName = "product-images"; // Ajusta esto al nombre de tu bucket

  // Subir imagen al bucket
  async uploadProductImage(file: File, productId?: string): Promise<string> {
    try {
      // Generar nombre único para el archivo
      const fileExt = file.name.split(".").pop();
      const fileName = productId
        ? `${productId}.${fileExt}`
        : `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const filePath = `products/${fileName}`;

      // Subir archivo
      const { error: uploadError } = await supabase.storage
        .from(this.bucketName)
        .upload(filePath, file, {
          upsert: true, // Sobrescribir si ya existe
        });

      if (uploadError) {
        throw uploadError;
      }

      // Obtener URL pública
      const { data } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Error al subir la imagen");
    }
  }

  // Eliminar imagen del bucket
  async deleteProductImage(imageUrl: string): Promise<void> {
    try {
      // Extraer el path de la URL
      const urlParts = imageUrl.split("/");
      const filePath = urlParts.slice(-2).join("/"); // products/filename.ext

      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      throw new Error("Error al eliminar la imagen");
    }
  }

  // Obtener URL pública de una imagen
  getPublicUrl(filePath: string): string {
    const { data } = supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
}

export const storageService = new StorageService();
