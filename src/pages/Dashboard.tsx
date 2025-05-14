
import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../App";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { clientService } from "../services/clientService";
import { Client } from "../types/client";
import { formatCurrency } from "../utils/formatters";

const Dashboard = () => {
  const { logout } = useContext(AuthContext);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadedClients = clientService.getClients();
    setClients(loadedClients);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const filteredClients = clients.filter((client) =>
    client.nomeFantasia.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.cnpj && client.cnpj.includes(searchTerm)) ||
    (client.cpf && client.cpf.includes(searchTerm)) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold text-blue-700">Gerenciador de Cobranças</h1>
          <Button variant="outline" onClick={handleLogout}>
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Card className="mb-6">
          <CardHeader className="bg-blue-50 pb-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle>Clientes</CardTitle>
              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                <Input
                  placeholder="Buscar cliente..."
                  className="w-full md:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button onClick={() => navigate("/add-client")}>
                  Adicionar Cliente
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              {filteredClients.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Documento</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.nomeFantasia}</TableCell>
                        <TableCell>
                          {client.cnpj || client.cpf || "N/A"}
                        </TableCell>
                        <TableCell>{client.plano}</TableCell>
                        <TableCell>{formatCurrency(client.valor)}</TableCell>
                        <TableCell>Dia {client.vencimento}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/client/${client.id}`)}
                          >
                            Detalhes
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">
                    {searchTerm ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
