export function formatPhone(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function formatCnpj(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

export function formatCpf(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

export function formatCep(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

// Ano (4 dígitos, sem separador) — usado em campos tipo "Ano de fabricação".
export function formatYear(value: string): string {
  return value.replace(/\D/g, "").slice(0, 4);
}

// UF (2 letras maiúsculas) — usado em campos tipo "UF principal".
export function formatUf(value: string): string {
  return value
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .slice(0, 2);
}

// Máscara de dinheiro em tempo real (trata os dígitos digitados como centavos,
// ex.: "18740000" -> "R$ 187.400,00") — mesmo padrão usado por apps bancários.
export function formatCurrencyInput(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits === "") return "";
  const cents = digits.padStart(3, "0");
  const integerPart = cents.slice(0, -2).replace(/^0+(?=\d)/, "");
  const centsPart = cents.slice(-2);
  const withThousands = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `R$ ${withThousands},${centsPart}`;
}

// Extrai o número puro de um valor mascarado por formatCurrencyInput, pra
// salvar no banco (coluna numeric).
export function parseCurrencyInput(value: string): number | null {
  const digits = value.replace(/\D/g, "");
  if (digits === "") return null;
  return Number(digits) / 100;
}

// Inverso: formata um número vindo do banco pra semear o defaultValue de um
// input com formatCurrencyInput (mesma máscara, sem duplicar a lógica).
export function numberToCurrencyInput(value: number | null | undefined): string {
  if (value === null || value === undefined) return "";
  return formatCurrencyInput(Math.round(value * 100).toString());
}
