import { Download, Paperclip, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";

import { useDeletePolicyAttachment } from "../../hooks/use-delete-policy-attachment";
import { usePolicyAttachments } from "../../hooks/use-policy-attachments";
import { usePolicyAttachmentUrl } from "../../hooks/use-policy-attachment-url";
import { useUploadPolicyAttachment } from "../../hooks/use-upload-policy-attachment";

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface PolicyAttachmentsSectionProps {
  policyId: string;
  canManage: boolean;
}

export function PolicyAttachmentsSection({ policyId, canManage }: PolicyAttachmentsSectionProps) {
  const { data: attachments, isLoading, isError, refetch } = usePolicyAttachments(policyId);
  const uploadPolicyAttachment = useUploadPolicyAttachment();
  const deletePolicyAttachment = useDeletePolicyAttachment();
  const policyAttachmentUrl = usePolicyAttachmentUrl();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    uploadPolicyAttachment.mutate(
      { policyId, file },
      {
        onSuccess: () => toast.success("Anexo enviado com sucesso"),
        onError: (error) => toast.error(error.message || "Não foi possível enviar o anexo"),
      },
    );
  }

  function handleDownload(id: string, filePath: string) {
    setIsDownloading(id);
    policyAttachmentUrl.mutate(filePath, {
      onSuccess: (url) => window.open(url, "_blank", "noopener,noreferrer"),
      onError: (error) => toast.error(error.message || "Não foi possível baixar o anexo"),
      onSettled: () => setIsDownloading(null),
    });
  }

  function handleDelete(id: string, filePath: string) {
    deletePolicyAttachment.mutate(
      { id, filePath, policyId },
      {
        onSuccess: () => toast.success("Anexo removido com sucesso"),
        onError: (error) => toast.error(error.message || "Não foi possível remover o anexo"),
      },
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Documentos
        </p>
        {canManage && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileSelected}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploadPolicyAttachment.isPending}
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-4 w-4" />
              {uploadPolicyAttachment.isPending ? "Enviando..." : "Anexar arquivo"}
            </Button>
          </>
        )}
      </div>

      {isLoading && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      )}

      {isError && !isLoading && (
        <div className="text-center">
          <p className="mb-2 text-sm text-muted-foreground">Não foi possível carregar os anexos.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      )}

      {!isLoading && !isError && attachments?.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhum documento anexado ainda.</p>
      )}

      {!isLoading && !isError && attachments && attachments.length > 0 && (
        <ul className="flex flex-col gap-2">
          {attachments.map((attachment) => (
            <li
              key={attachment.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
            >
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm text-foreground">{attachment.file_name}</span>
                <span className="text-xs text-muted-foreground">
                  {formatFileSize(attachment.file_size)}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={isDownloading === attachment.id}
                  onClick={() => handleDownload(attachment.id, attachment.file_path)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                {canManage && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDelete(attachment.id, attachment.file_path)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
