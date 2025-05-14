
export interface Client {
  id: string;
  nomeFantasia: string; // Nome fantasia / nome completo
  cnpj: string | null;
  cpf: string | null;
  telefone: string;
  email: string;
  cep: string;
  logradouro: string; // Rua
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  plano: string;
  valor: number;
  vencimento: string; // Data de vencimento mensal (dia do mês)
}
