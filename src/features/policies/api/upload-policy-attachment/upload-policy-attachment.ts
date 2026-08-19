import { supabase } from "@/shared/lib/supabase";

export interface UploadPolicyAttachmentInput {
  brokerageId: string;
  policyId: string;
  file: File;
}

export async function uploadPolicyAttachment({
  brokerageId,
  policyId,
  file,
}: UploadPolicyAttachmentInput) {
  const filePath = `${brokerageId}/${policyId}/${crypto.randomUUID()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("policy-documents")
    .upload(filePath, file);
  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from("policy_attachments")
    .insert({
      policy_id: policyId,
      file_name: file.name,
      file_path: filePath,
      file_size: file.size,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
