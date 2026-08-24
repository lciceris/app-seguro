export interface ViaCepData {
  street: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
}

export async function fetchCepData(cep: string): Promise<ViaCepData> {
  const digits = cep.replace(/\D/g, "");
  const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
  if (!response.ok) throw new Error("CEP não encontrado");
  const data = await response.json();
  if (data.erro) throw new Error("CEP não encontrado");
  return {
    street: data.logradouro || null,
    neighborhood: data.bairro || null,
    city: data.localidade || null,
    state: data.uf || null,
  };
}
