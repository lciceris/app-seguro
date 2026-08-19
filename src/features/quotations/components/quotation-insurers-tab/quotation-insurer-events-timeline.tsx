import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Textarea } from "@/shared/components/ui/textarea";

import { useAddQuotationInsurerComment } from "../../hooks/use-add-quotation-insurer-comment";
import { useQuotationInsurerEvents } from "../../hooks/use-quotation-insurer-events";

const commentSchema = z.object({ content: z.string().min(1, "Escreva um comentário") });
type CommentFormValues = z.infer<typeof commentSchema>;

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("pt-BR");
}

interface QuotationInsurerEventsTimelineProps {
  quotationInsurerId: string;
  canComment: boolean;
}

export function QuotationInsurerEventsTimeline({
  quotationInsurerId,
  canComment,
}: QuotationInsurerEventsTimelineProps) {
  const {
    data: events,
    isLoading,
    isError,
    refetch,
  } = useQuotationInsurerEvents(quotationInsurerId);
  const addComment = useAddQuotationInsurerComment();

  const { register, handleSubmit, reset } = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: "" },
  });

  function onSubmit(values: CommentFormValues) {
    addComment.mutate(
      { quotation_insurer_id: quotationInsurerId, content: values.content },
      {
        onSuccess: () => {
          toast.success("Comentário adicionado com sucesso");
          reset();
        },
        onError: (error) => toast.error(error.message || "Não foi possível comentar"),
      },
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
      <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        Linha do tempo
      </p>

      {canComment && (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
          <Textarea placeholder="Adicionar um comentário" rows={2} {...register("content")} />
          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={addComment.isPending}>
              {addComment.isPending ? "Enviando..." : "Comentar"}
            </Button>
          </div>
        </form>
      )}

      {isLoading && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}

      {isError && !isLoading && (
        <div className="text-center">
          <p className="mb-2 text-sm text-muted-foreground">
            Não foi possível carregar a linha do tempo.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      )}

      {!isLoading && !isError && events?.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhum evento ainda.</p>
      )}

      {!isLoading && !isError && events && events.length > 0 && (
        <ul className="flex flex-col gap-3">
          {events.map((event) => (
            <li
              key={event.id}
              className="flex flex-col gap-0.5 border-b border-border pb-3 last:border-0 last:pb-0"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  {event.event_type === "comment"
                    ? (event.users?.full_name ?? "Usuário")
                    : "Sistema"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(event.created_at)}
                </span>
              </div>
              {event.event_type === "comment" ? (
                <p className="text-sm text-foreground">{event.content}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {event.content}: <span className="text-foreground">{event.old_value}</span> →{" "}
                  <span className="text-foreground">{event.new_value}</span>
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
