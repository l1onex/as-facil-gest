
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ClientForm from "@/components/ClientForm";
import { clientService } from "../services/clientService";
import { Client } from "../types/client";
import { toast } from "sonner";

const AddClient = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleAddClient = async (data: Omit<Client, 'id'>) => {
    setIsLoading(true);
    try {
      const newClient = clientService.addClient(data);
      toast.success("Cliente adicionado com sucesso!");
      navigate(`/client/${newClient.id}`);
    } catch (error) {
      console.error("Erro ao adicionar cliente:", error);
      toast.error("Erro ao adicionar cliente");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o Dashboard
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-blue-700">Adicionar Novo Cliente</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <ClientForm onSubmit={handleAddClient} isLoading={isLoading} />
        </div>
      </main>
    </div>
  );
};

export default AddClient;
