import { supabase } from "@/shared/lib/supabase";

export interface DeletePolicyAttachmentInput {
  id: string;
  filePath: string;
}

export async function deletePolicyAttachment({ id, filePath }: DeletePolicyAttachmentInput) {
  const { error: storageError } = await supabase.storage
    .from("policy-documents")
    .remove([filePath]);
  if (storageError) throw storageError;

  const { error } = await supabase.from("policy_attachments").delete().eq("id", id);
  if (error) throw error;
}
