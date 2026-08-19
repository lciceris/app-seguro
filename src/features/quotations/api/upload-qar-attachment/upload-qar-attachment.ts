import { supabase } from "@/shared/lib/supabase";

export interface UploadQarAttachmentInput {
  brokerageId: string;
  quotationId: string;
  file: File;
}

export async function uploadQarAttachment({
  brokerageId,
  quotationId,
  file,
}: UploadQarAttachmentInput) {
  const filePath = `${brokerageId}/${quotationId}/${crypto.randomUUID()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("qar-attachments")
    .upload(filePath, file);
  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from("quotation_qar_attachments")
    .insert({
      quotation_id: quotationId,
      file_name: file.name,
      file_path: filePath,
      file_size: file.size,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
