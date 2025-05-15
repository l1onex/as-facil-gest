
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
    
    return data || [];
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
    
    return data;
  } catch (error) {
    console.error('Erro ao buscar cliente por ID:', error);
    return undefined;
  }
};

// Add a client
const addClient = async (client: Omit<Client, 'id'>): Promise<Client | null> => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .insert([
        {
          nome_fantasia: client.nomeFantasia,
          cnpj: client.cnpj,
          cpf: client.cpf,
          telefone: client.telefone,
          email: client.email,
          cep: client.cep,
          logradouro: client.logradouro,
          numero: client.numero,
          complemento: client.complemento,
          bairro: client.bairro,
          cidade: client.cidade,
          uf: client.uf,
          plano: client.plano,
          valor: client.valor,
          vencimento: client.vencimento
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao adicionar cliente:', error);
      throw error;
    }
    
    // Converta o formato do Supabase para o formato do Client
    return mapSupabaseToClient(data);
  } catch (error) {
    console.error('Erro ao adicionar cliente:', error);
    return null;
  }
};

// Update a client
const updateClient = async (id: string, updatedClient: Omit<Client, 'id'>): Promise<Client | null> => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .update({
        nome_fantasia: updatedClient.nomeFantasia,
        cnpj: updatedClient.cnpj,
        cpf: updatedClient.cpf,
        telefone: updatedClient.telefone,
        email: updatedClient.email,
        cep: updatedClient.cep,
        logradouro: updatedClient.logradouro,
        numero: updatedClient.numero,
        complemento: updatedClient.complemento,
        bairro: updatedClient.bairro,
        cidade: updatedClient.cidade,
        uf: updatedClient.uf,
        plano: updatedClient.plano,
        valor: updatedClient.valor,
        vencimento: updatedClient.vencimento
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao atualizar cliente:', error);
      throw error;
    }
    
    // Converta o formato do Supabase para o formato do Client
    return mapSupabaseToClient(data);
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
    nomeFantasia: data.nome_fantasia,
    cnpj: data.cnpj,
    cpf: data.cpf,
    telefone: data.telefone,
    email: data.email,
    cep: data.cep,
    logradouro: data.logradouro,
    numero: data.numero,
    complemento: data.complemento,
    bairro: data.bairro,
    cidade: data.cidade,
    uf: data.uf,
    plano: data.plano,
    valor: data.valor,
    vencimento: data.vencimento
  };
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

export const clientService = {
  getClients,
  getClientById,
  addClient,
  updateClient,
  deleteClient,
  getAddressByCep
};
