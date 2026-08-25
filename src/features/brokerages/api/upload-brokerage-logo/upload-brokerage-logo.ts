import { supabase } from "@/shared/lib/supabase";

export interface UploadBrokerageLogoInput {
  brokerageId: string;
  file: File;
}

// Path fixo (não randomizado como os anexos) — o logo é um arquivo único por
// corretora, substituído em vez de acumulado (upsert: true).
export async function uploadBrokerageLogo({ brokerageId, file }: UploadBrokerageLogoInput) {
  const filePath = `${brokerageId}/logo`;

  const { error: uploadError } = await supabase.storage
    .from("brokerage-assets")
    .upload(filePath, file, { upsert: true, contentType: file.type });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("brokerage-assets").getPublicUrl(filePath);
  return `${data.publicUrl}?t=${Date.now()}`;
}
