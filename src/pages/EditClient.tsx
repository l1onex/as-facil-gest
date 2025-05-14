
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ClientForm from "@/components/ClientForm";
import { clientService } from "../services/clientService";
import { Client } from "../types/client";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

const EditClient = () => {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      const foundClient = clientService.getClientById(id);
      if (foundClient) {
        setClient(foundClient);
      }
      setInitialLoading(false);
    }
  }, [id]);

  const handleUpdateClient = async (data: Omit<Client, 'id'>) => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const updatedClient = clientService.updateClient(id, data);
      if (updatedClient) {
        toast.success("Cliente atualizado com sucesso!");
        navigate(`/client/${id}`);
      } else {
        throw new Error("Cliente não encontrado");
      }
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      toast.error("Erro ao atualizar cliente");
    } finally {
      setIsLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">Carregando...</div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>Cliente não encontrado.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <Button variant="ghost" onClick={() => navigate(`/client/${id}`)} className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Detalhes do Cliente
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-blue-700">Editar Cliente</h1>
          <p className="text-gray-500">{client.nomeFantasia}</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <ClientForm
            initialData={client}
            onSubmit={handleUpdateClient}
            isLoading={isLoading}
          />
        </div>
      </main>
    </div>
  );
};

export default EditClient;
