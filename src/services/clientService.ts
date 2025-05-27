
import { supabase } from "../integrations/supabase/client";
import { Client } from "../types/client";

// Initialize clients in Supabase if needed
const initClients = async () => {
  // Não é mais necessário com Supabase
};

// Get all clients
const getClients = async (): Promise<Client[]> => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*');
    
    if (error) {
      console.error('Erro ao buscar clientes:', error);
      throw error;
    }
    
    // Atualizar status de pagamento com base na data de vencimento
    const clientsWithUpdatedStatus = await Promise.all((data || []).map(async (client) => {
      return checkAndUpdatePaymentStatus(mapSupabaseToClient(client));
    }));
    
    return clientsWithUpdatedStatus;
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return [];
  }
};

// Get client by id
const getClientById = async (id: string): Promise<Client | undefined> => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Erro ao buscar cliente:', error);
      return undefined;
    }
    
    if (!data) return undefined;
    
    // Verificar e atualizar status de pagamento antes de retornar
    const clientWithUpdatedStatus = await checkAndUpdatePaymentStatus(mapSupabaseToClient(data));
    return clientWithUpdatedStatus;
  } catch (error) {
    console.error('Erro ao buscar cliente por ID:', error);
    return undefined;
  }
};

// Add a client
const addClient = async (client: Omit<Client, 'id'>): Promise<Client | null> => {
  try {
    // Primeiro, obtenha o ID do usuário atual
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      console.error('Usuário não autenticado');
      return null;
    }
    
    const clientData = mapClientToSupabase(client, userData.user.id);
    
    const { data, error } = await supabase
      .from('clients')
      .insert([clientData])
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao adicionar cliente:', error);
      throw error;
    }
    
    return data ? mapSupabaseToClient(data) : null;
  } catch (error) {
    console.error('Erro ao adicionar cliente:', error);
    return null;
  }
};

// Update a client
const updateClient = async (id: string, updatedClient: Omit<Client, 'id'>): Promise<Client | null> => {
  try {
    // Obter o ID do usuário atual
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      console.error('Usuário não autenticado');
      return null;
    }
    
    const clientData = mapClientToSupabase(updatedClient, userData.user.id);
    
    const { data, error } = await supabase
      .from('clients')
      .update(clientData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao atualizar cliente:', error);
      throw error;
    }
    
    return data ? mapSupabaseToClient(data) : null;
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    return null;
  }
};

// Delete a client
const deleteClient = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Erro ao excluir cliente:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    return false;
  }
};

// Função auxiliar para converter formato do Supabase para o formato Client
function mapSupabaseToClient(data: any): Client {
  return {
    id: data.id,
    nomeFantasia: data.fantasy_name,
    cnpj: data.cnpj,
    cpf: data.cpf,
    telefone: data.phone,
    email: data.email,
    cep: data.cep,
    logradouro: data.street,
    numero: data.number,
    complemento: data.complement,
    bairro: data.neighborhood,
    cidade: data.city,
    uf: data.state,
    plano: data.plan,
    valor: data.value,
    vencimento: data.due_date.toString(),
    statusPagamento: data.payment_status || 'Pendente'
  };
}

// Função auxiliar para converter formato Client para o formato do Supabase
function mapClientToSupabase(client: Omit<Client, 'id'>, userId: string): any {
  return {
    fantasy_name: client.nomeFantasia,
    full_name: client.nomeFantasia,
    cnpj: client.cnpj,
    cpf: client.cpf,
    phone: client.telefone,
    email: client.email,
    cep: client.cep,
    street: client.logradouro,
    number: client.numero,
    complement: client.complemento,
    neighborhood: client.bairro,
    city: client.cidade,
    state: client.uf,
    plan: client.plano,
    value: client.valor,
    due_date: parseInt(client.vencimento, 10),
    payment_status: client.statusPagamento || 'Pendente',
    user_id: userId
  };
}

// Nova função para verificar e atualizar o status de pagamento com base no vencimento
async function checkAndUpdatePaymentStatus(client: Client): Promise<Client> {
  // Se não temos um ID válido, apenas retorne o cliente sem modificações
  if (!client.id) return client;
  
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  // Criar data de vencimento para o mês atual
  const dueDay = parseInt(client.vencimento, 10);
  let dueDate = new Date(currentYear, currentMonth, dueDay);
  
  // Se o dia de vencimento já passou neste mês, considerar próximo mês
  if (currentDay > dueDay) {
    dueDate = new Date(currentYear, currentMonth + 1, dueDay);
  }
  
  // Data limites para troca de status (25 dias após o vencimento)
  const limitDate = new Date(dueDate);
  limitDate.setDate(limitDate.getDate() + 25);
  
  // Determinar se o pagamento está pendente baseado nas regras
  let newStatus = client.statusPagamento;
  
  // Se a data atual for maior que a data limite, marcar como pendente
  if (today > limitDate) {
    newStatus = 'Pendente';
  }
  
  // Se o status mudou, atualizar no banco de dados
  if (newStatus !== client.statusPagamento) {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        await supabase
          .from('clients')
          .update({ payment_status: newStatus })
          .eq('id', client.id);
        
        // Atualizar o cliente local
        client.statusPagamento = newStatus;
      }
    } catch (error) {
      console.error('Erro ao atualizar status de pagamento:', error);
    }
  }
  
  return client;
}

// Service to get address by CEP
const getAddressByCep = async (cep: string) => {
  try {
    cep = cep.replace(/\D/g, ''); // Remove non-digits
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (!response.ok) throw new Error('CEP não encontrado');
    
    const data = await response.json();
    if (data.erro) throw new Error('CEP não encontrado');
    
    return {
      logradouro: data.logradouro,
      bairro: data.bairro,
      cidade: data.localidade,
      uf: data.uf
    };
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    throw error;
  }
};

// Nova função para definir manualmente o status de pagamento de um cliente
const updatePaymentStatus = async (id: string, status: 'Pago' | 'Pendente'): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('clients')
      .update({ payment_status: status })
      .eq('id', id);
    
    if (error) {
      console.error('Erro ao atualizar status de pagamento:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao atualizar status de pagamento:', error);
    return false;
  }
};

export const clientService = {
  getClients,
  getClientById,
  addClient,
  updateClient,
  deleteClient,
  getAddressByCep,
  updatePaymentStatus
};
