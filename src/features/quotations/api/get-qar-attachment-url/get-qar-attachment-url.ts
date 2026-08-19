import { supabase } from "@/shared/lib/supabase";

// Bucket privado — precisa de URL assinada com expiração curta pra download.
export async function getQarAttachmentUrl(filePath: string) {
  const { data, error } = await supabase.storage
    .from("qar-attachments")
    .createSignedUrl(filePath, 60);

  if (error) throw error;
  return data.signedUrl;
}
