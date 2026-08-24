export interface BrasilApiCnpjData {
  name: string;
  trade_name: string | null;
  business_code: string | null;
  email: string | null;
  phone: string | null;
  zip_code: string | null;
  street: string | null;
  street_number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
}

export async function fetchCnpjData(cnpj: string): Promise<BrasilApiCnpjData> {
  const digits = cnpj.replace(/\D/g, "");
  const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`);
  if (!response.ok) throw new Error("CNPJ não encontrado");
  const data = await response.json();
  return {
    name: data.razao_social,
    trade_name: data.nome_fantasia || null,
    business_code:
      data.cnae_fiscal && data.cnae_fiscal_descricao
        ? `${data.cnae_fiscal} - ${data.cnae_fiscal_descricao}`
        : null,
    email: data.email || null,
    phone: data.ddd_telefone_1 || null,
    zip_code: data.cep || null,
    street: data.logradouro || null,
    street_number: data.numero || null,
    complement: data.complemento || null,
    neighborhood: data.bairro || null,
    city: data.municipio || null,
    state: data.uf || null,
  };
}
