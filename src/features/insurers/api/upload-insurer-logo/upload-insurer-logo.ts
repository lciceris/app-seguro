import { supabase } from "@/shared/lib/supabase";

export interface UploadInsurerLogoInput {
  insurerId: string;
  file: File;
}

// Path fixo (mesmo padrão de upload-brokerage-logo): logo é um arquivo
// único por seguradora, substituído em vez de acumulado (upsert: true).
export async function uploadInsurerLogo({ insurerId, file }: UploadInsurerLogoInput) {
  const filePath = `${insurerId}/logo`;

  const { error: uploadError } = await supabase.storage
    .from("insurer-assets")
    .upload(filePath, file, { upsert: true, contentType: file.type });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("insurer-assets").getPublicUrl(filePath);
  return `${data.publicUrl}?t=${Date.now()}`;
}
