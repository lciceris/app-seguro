import { supabase } from "@/shared/lib/supabase";

export interface DeleteQarAttachmentInput {
  id: string;
  filePath: string;
}

export async function deleteQarAttachment({ id, filePath }: DeleteQarAttachmentInput) {
  const { error: storageError } = await supabase.storage.from("qar-attachments").remove([filePath]);
  if (storageError) throw storageError;

  const { error } = await supabase.from("quotation_qar_attachments").delete().eq("id", id);
  if (error) throw error;
}
