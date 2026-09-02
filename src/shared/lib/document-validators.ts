function calcCnpjCheckDigit(base: string) {
  const weights =
    base.length === 12
      ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
      : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const sum = base.split("").reduce((acc, digit, index) => acc + Number(digit) * weights[index], 0);
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

export function isValidCnpj(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(digits)) return false;

  const base = digits.slice(0, 12);
  const digit1 = calcCnpjCheckDigit(base);
  const digit2 = calcCnpjCheckDigit(base + digit1);

  return digits === `${base}${digit1}${digit2}`;
}

function calcCpfCheckDigit(base: string) {
  let sum = 0;
  let weight = base.length + 1;
  for (const char of base) {
    sum += Number(char) * weight;
    weight -= 1;
  }
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

export function isValidCpf(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  const base = digits.slice(0, 9);
  const digit1 = calcCpfCheckDigit(base);
  const digit2 = calcCpfCheckDigit(base + digit1);

  return digits === `${base}${digit1}${digit2}`;
}
