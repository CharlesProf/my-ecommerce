import { put } from "@vercel/blob";

export async function uploadImage(file: File | null) {
  if (!file || file.size === 0) return null;

  try {
    const blob = await put(file.name, file, {
      access: "public",
    });
    return blob.url;
  } catch (error) {
    console.error("Image upload failed:", error);
    return null;
  }
}
