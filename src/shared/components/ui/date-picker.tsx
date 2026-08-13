import { CalendarIcon } from "lucide-react";
import { ptBR } from "date-fns/locale";
import { format } from "date-fns";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";

interface DatePickerProps {
  id?: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
}

export function DatePicker({
  id,
  value,
  onChange,
  placeholder = "Selecione uma data",
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className={cn("w-full justify-start font-normal", !value && "text-muted-foreground")}
        >
          <CalendarIcon className="h-4 w-4" />
          {value ? format(value, "dd/MM/yyyy", { locale: ptBR }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value ?? undefined}
          onSelect={(date) => onChange(date ?? null)}
          locale={ptBR}
          captionLayout="dropdown"
        />
      </PopoverContent>
    </Popover>
  );
}
