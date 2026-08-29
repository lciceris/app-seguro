import { zodResolver } from "@hookform/resolvers/zod";
import { Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { supabase } from "@/shared/lib/supabase";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import { Textarea } from "@/shared/components/ui/textarea";

import { useCreateInsurer } from "../../hooks/use-create-insurer";
import { uploadInsurerLogo } from "../../api/upload-insurer-logo";
import type { CreateInsurerInput } from "../../api/create-insurer";
import {
  createInsurerSchema,
  type CreateInsurerFormValues,
} from "../../validations/create-insurer-schema";

function sanitize(value: string | undefined) {
  return value === "" || value === undefined ? null : value;
}

function sanitizeNum(value: string | undefined) {
  return value === "" || value === undefined || Number.isNaN(Number(value)) ? null : Number(value);
}

function paraPayload(values: CreateInsurerFormValues): CreateInsurerInput {
  return {
    name: values.name,
    cnpj: values.cnpj,
    email: sanitize(values.email),
    phone: sanitize(values.phone),
    website: sanitize(values.website),
    contact_name: sanitize(values.contact_name),
    response_time_days: sanitizeNum(values.response_time_days),
    display_order: sanitizeNum(values.display_order),
    notes: sanitize(values.notes),
    logo_url: null,
  };
}

export function CreateInsurerDrawer() {
  const navigate = useNavigate();
  const createInsurer = useCreateInsurer();

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateInsurerFormValues>({
    resolver: zodResolver(createInsurerSchema),
  });

  function handleClose() {
    if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
    navigate("/admin/insurers");
  }

  function handleLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo 2MB.");
      return;
    }
    if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
    setLogoFile(file);
    setLogoPreviewUrl(URL.createObjectURL(file));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleLogoRemove() {
    if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
    setLogoFile(null);
    setLogoPreviewUrl("");
  }

  function onSubmit(values: CreateInsurerFormValues) {
    createInsurer.mutate(paraPayload(values), {
      onSuccess: async (insurer) => {
        // O path do logo no Storage depende do id — só existe depois do
        // insert, por isso o upload acontece à parte, num UPDATE pontual
        // logo em seguida (mesmo padrão de create-brokerage-drawer).
        if (logoFile) {
          try {
            const logoUrl = await uploadInsurerLogo({ insurerId: insurer.id, file: logoFile });
            const { error } = await supabase
              .from("insurers")
              .update({ logo_url: logoUrl })
              .eq("id", insurer.id);
            if (error) throw error;
          } catch {
            toast.error("Seguradora criada, mas não foi possível salvar o logo.");
          }
        }
        toast.success("Seguradora criada com sucesso");
        handleClose();
      },
      onError: (error) => {
        toast.error(error.message || "Não foi possível criar a seguradora");
      },
    });
  }

  return (
    <Sheet open onOpenChange={(open) => !open && handleClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Nova seguradora</SheetTitle>
        </SheetHeader>

        <form
          id="create-insurer-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 min-h-0 overflow-y-auto bg-background"
        >
          <div className="mx-auto flex w-full max-w-[720px] flex-col gap-4 p-5">
            <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
              <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Identificação
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 flex flex-col gap-1.5">
                  <Label htmlFor="name">Nome *</Label>
                  <Input id="name" {...register("name")} />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="cnpj">CNPJ *</Label>
                  <Input id="cnpj" placeholder="00.000.000/0000-00" {...register("cnpj")} />
                  {errors.cnpj && <p className="text-sm text-destructive">{errors.cnpj.message}</p>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" {...register("email")} />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="phone">Telefone Comercial</Label>
                  <Input id="phone" placeholder="(00) 00000-0000" {...register("phone")} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" placeholder="https://" {...register("website")} />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
              <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Identidade visual
              </p>

              <div className="flex flex-col gap-1.5">
                <Label>Logo</Label>
                {logoPreviewUrl ? (
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-muted p-2.5">
                    <img
                      src={logoPreviewUrl}
                      alt="Logo"
                      className="size-12 shrink-0 rounded-full border-2 border-border bg-card object-contain p-1"
                    />
                    <span className="flex-1 truncate text-sm text-muted-foreground">
                      {logoFile?.name}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="shrink-0 text-destructive hover:text-destructive"
                      onClick={handleLogoRemove}
                    >
                      <X className="size-3.5" />
                      Remover
                    </Button>
                  </div>
                ) : (
                  <label className="block cursor-pointer">
                    <div className="rounded-lg border-2 border-dashed border-border bg-muted p-5 text-center">
                      <Upload className="mx-auto mb-2 size-5 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Clique para enviar uma imagem</p>
                      <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, SVG até 2MB</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml"
                      className="hidden"
                      onChange={handleLogoFile}
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
              <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Contato comercial
              </p>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="contact_name">Nome do contato</Label>
                <Input id="contact_name" {...register("contact_name")} />
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
              <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Configurações
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="response_time_days">Prazo de resposta (dias)</Label>
                  <Input
                    id="response_time_days"
                    type="number"
                    min={0}
                    {...register("response_time_days")}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="display_order">Ordem de exibição</Label>
                  <Input id="display_order" type="number" min={0} {...register("display_order")} />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
              <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Observações
              </p>

              <Textarea id="notes" rows={4} {...register("notes")} />
            </div>
          </div>
        </form>

        <SheetFooter className="flex-row justify-end">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" form="create-insurer-form" disabled={createInsurer.isPending}>
            {createInsurer.isPending ? "Criando..." : "Criar"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
