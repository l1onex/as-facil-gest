
import { Client } from "../types/client";

// Default clients for MVP
const defaultClients: Client[] = [
  {
    id: "1",
    nomeFantasia: "Empresa ABC Ltda",
    cnpj: "12.345.678/0001-90",
    cpf: null,
    telefone: "(11) 98765-4321",
    email: "contato@empresaabc.com.br",
    cep: "01310-200",
    logradouro: "Av. Paulista",
    numero: "1000",
    complemento: "Sala 123",
    bairro: "Bela Vista",
    cidade: "São Paulo",
    uf: "SP",
    plano: "Premium",
    valor: 299.90,
    vencimento: "10"
  },
  {
    id: "2",
    nomeFantasia: "João da Silva",
    cnpj: null,
    cpf: "123.456.789-00",
    telefone: "(11) 91234-5678",
    email: "joao.silva@email.com",
    cep: "04538-132",
    logradouro: "R. Joaquim Floriano",
    numero: "1000",
    complemento: "Apto 45",
    bairro: "Itaim Bibi",
    cidade: "São Paulo",
    uf: "SP",
    plano: "Básico",
    valor: 99.90,
    vencimento: "15"
  }
];

// Initialize clients in localStorage if not exist
const initClients = () => {
  const clients = localStorage.getItem('clients');
  if (!clients) {
    localStorage.setItem('clients', JSON.stringify(defaultClients));
  }
};

// Get all clients
const getClients = (): Client[] => {
  initClients();
  const clients = localStorage.getItem('clients');
  return clients ? JSON.parse(clients) : [];
};

// Get client by id
const getClientById = (id: string): Client | undefined => {
  const clients = getClients();
  return clients.find(client => client.id === id);
};

// Add a client
const addClient = (client: Omit<Client, 'id'>): Client => {
  const clients = getClients();
  const newClient = {
    ...client,
    id: Date.now().toString(), // Simple ID generation for MVP
  };
  clients.push(newClient);
  localStorage.setItem('clients', JSON.stringify(clients));
  return newClient;
};

// Update a client
const updateClient = (id: string, updatedClient: Omit<Client, 'id'>): Client | null => {
  const clients = getClients();
  const index = clients.findIndex(client => client.id === id);
  if (index === -1) return null;
  
  const client = {
    ...updatedClient,
    id
  };
  
  clients[index] = client;
  localStorage.setItem('clients', JSON.stringify(clients));
  return client;
};

// Delete a client
const deleteClient = (id: string): boolean => {
  const clients = getClients();
  const filteredClients = clients.filter(client => client.id !== id);
  if (filteredClients.length === clients.length) return false;
  
  localStorage.setItem('clients', JSON.stringify(filteredClients));
  return true;
};

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
