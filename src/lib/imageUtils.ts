const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const BUCKET_NAME = process.env.NEXT_PUBLIC_BUCKET_NAME;

export function getImageUrl(
  imagePath: string | null | undefined
): string | undefined {
  if (!imagePath) return undefined;
  if (imagePath.startsWith("http")) {
    return imagePath;
  }
  const fullUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${imagePath}`;
  return fullUrl;
}

export function getImageFallback(productName: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    productName
  )}&size=200&background=f3f4f6&color=374151&bold=true`;
}

export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch {
    return false;
  }
}
