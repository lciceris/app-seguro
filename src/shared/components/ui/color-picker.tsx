import { Input } from "@/shared/components/ui/input";

interface ColorPickerProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function ColorPicker({ id, value, onChange, placeholder = "#3B82F6" }: ColorPickerProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        aria-label="Selecionar cor"
        value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000"}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-10 shrink-0 cursor-pointer rounded-lg border border-input p-1"
      />
      <Input
        id={id}
        className="font-mono"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
