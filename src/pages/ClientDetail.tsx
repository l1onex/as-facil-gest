
import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { clientService } from "../services/clientService";
import { Client } from "../types/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft } from "lucide-react";
import { formatCurrency, formatDocument, formatPhone } from "../utils/formatters";
import { toast } from "sonner";
import { AuthContext } from "../App";
import { Badge } from "@/components/ui/badge";

const ClientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClient = async () => {
      if (!id || !user) return;
      
      try {
        const foundClient = await clientService.getClientById(id);
        if (foundClient) {
          setClient(foundClient);
        }
      } catch (error) {
        console.error("Erro ao buscar detalhes do cliente:", error);
        toast.error("Erro ao carregar detalhes do cliente");
      } finally {
        setLoading(false);
      }
    };
    
    fetchClient();
  }, [id, user]);

  const handleDelete = async () => {
    if (!client || !id || !user) return;
    
    if (window.confirm(`Tem certeza que deseja excluir o cliente "${client.nomeFantasia}"?`)) {
      try {
        const success = await clientService.deleteClient(id);
        if (success) {
          toast.success("Cliente excluído com sucesso!");
          navigate("/dashboard");
        } else {
          toast.error("Erro ao excluir cliente.");
        }
      } catch (error) {
        console.error("Erro ao excluir cliente:", error);
        toast.error("Erro ao excluir cliente.");
      }
    }
  };

  const handleTogglePaymentStatus = async () => {
    if (!client || !id) return;
    
    const newStatus = client.statusPagamento === 'Pago' ? 'Pendente' : 'Pago';
    const success = await clientService.updatePaymentStatus(id, newStatus);
    
    if (success) {
      setClient({
        ...client,
        statusPagamento: newStatus
      });
      toast.success(`Status alterado para ${newStatus}`);
    } else {
      toast.error("Erro ao alterar status de pagamento");
    }
  };

  if (loading) {
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
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o Dashboard
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-blue-700">Detalhes do Cliente</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="bg-blue-50">
            <div className="flex justify-between items-center">
              <CardTitle>{client.nomeFantasia}</CardTitle>
              <Badge 
                variant={client.statusPagamento === 'Pago' ? 'default' : 'destructive'}
                className="cursor-pointer text-sm py-1 px-3"
                onClick={handleTogglePaymentStatus}
              >
                {client.statusPagamento}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Informações Básicas</h3>
                
                <div className="space-y-2">
                  {client.cnpj && (
                    <div>
                      <span className="text-gray-500">CNPJ:</span>
                      <p>{formatDocument(client.cnpj)}</p>
                    </div>
                  )}
                  
                  {client.cpf && (
                    <div>
                      <span className="text-gray-500">CPF:</span>
                      <p>{formatDocument(client.cpf)}</p>
                    </div>
                  )}
                  
                  <div>
                    <span className="text-gray-500">Telefone:</span>
                    <p>{formatPhone(client.telefone)}</p>
                  </div>
                  
                  <div>
                    <span className="text-gray-500">E-mail:</span>
                    <p>{client.email}</p>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold mb-4 mt-6">Plano e Cobranças</h3>
                
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-500">Plano:</span>
                    <p>{client.plano}</p>
                  </div>
                  
                  <div>
                    <span className="text-gray-500">Valor:</span>
                    <p className="text-green-600 font-semibold">{formatCurrency(client.valor)}</p>
                  </div>
                  
                  <div>
                    <span className="text-gray-500">Vencimento:</span>
                    <p>Todo dia {client.vencimento} do mês</p>
                  </div>
                  
                  <div>
                    <span className="text-gray-500">Status de Pagamento:</span>
                    <p 
                      className={`font-semibold ${
                        client.statusPagamento === 'Pago' ? 'text-green-600' : 'text-red-600'
                      } cursor-pointer`}
                      onClick={handleTogglePaymentStatus}
                    >
                      {client.statusPagamento}
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Endereço</h3>
                
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-500">CEP:</span>
                    <p>{client.cep}</p>
                  </div>
                  
                  <div>
                    <span className="text-gray-500">Logradouro:</span>
                    <p>{client.logradouro}, {client.numero}</p>
                  </div>
                  
                  {client.complemento && (
                    <div>
                      <span className="text-gray-500">Complemento:</span>
                      <p>{client.complemento}</p>
                    </div>
                  )}
                  
                  <div>
                    <span className="text-gray-500">Bairro:</span>
                    <p>{client.bairro}</p>
                  </div>
                  
                  <div>
                    <span className="text-gray-500">Cidade/UF:</span>
                    <p>{client.cidade} - {client.uf}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => navigate(`/edit-client/${client.id}`)}>
              Editar Cliente
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir Cliente
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default ClientDetail;
