import { supabase } from "@/lib/supabaseClient";

export class StorageService {
  private bucketName = "product-images";

  // Subir imagen al bucket
  async uploadProductImage(file: File, productId?: string): Promise<string> {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = productId
        ? `${productId}.${fileExt}`
        : `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const filePath = fileName;

      console.log(`🔄 Uploading file: ${filePath}`); // Debug

      // Subir archivo
      const { data, error: uploadError } = await supabase.storage
        .from(this.bucketName)
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) {
        console.error("❌ Upload error:", uploadError);
        throw uploadError;
      }

      console.log("✅ Upload successful:", data); // Debug

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);

      console.log("🔗 Public URL:", urlData.publicUrl); // Debug

      return urlData.publicUrl;
    } catch (error) {
      console.error("❌ Error uploading image:", error);
      throw new Error("Error al subir la imagen");
    }
  }

  // Eliminar imagen del bucket
  async deleteProductImage(imageUrl: string): Promise<void> {
    try {
      const fileName = imageUrl.split("/").pop();
      if (!fileName) throw new Error("Invalid image URL");

      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([fileName]);

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
