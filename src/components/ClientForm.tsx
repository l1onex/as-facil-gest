
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Client } from "../types/client";
import { clientService } from "../services/clientService";

interface ClientFormProps {
  initialData?: Client;
  onSubmit: (data: Omit<Client, 'id'>) => void;
  isLoading?: boolean;
}

const ClientForm = ({ initialData, onSubmit, isLoading = false }: ClientFormProps) => {
  const [formData, setFormData] = useState<Omit<Client, 'id'>>({
    nomeFantasia: "",
    cnpj: null,
    cpf: null,
    telefone: "",
    email: "",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "",
    plano: "",
    valor: 0,
    vencimento: "",
    statusPagamento: "Pendente"
  });
  
  const [documentType, setDocumentType] = useState<"cpf" | "cnpj">("cnpj");
  const [loadingCep, setLoadingCep] = useState(false);

  // Set initial form data if provided
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setDocumentType(initialData.cnpj ? "cnpj" : "cpf");
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === "valor") {
      // Convert string to number
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleDocumentTypeChange = (type: "cpf" | "cnpj") => {
    setDocumentType(type);
    setFormData({
      ...formData,
      cnpj: type === "cnpj" ? "" : null,
      cpf: type === "cpf" ? "" : null
    });
  };

  const handleCepBlur = async () => {
    const cep = formData.cep.replace(/\D/g, '');
    if (cep.length !== 8) return;

    setLoadingCep(true);
    try {
      const address = await clientService.getAddressByCep(cep);
      setFormData({
        ...formData,
        logradouro: address.logradouro,
        bairro: address.bairro,
        cidade: address.cidade,
        uf: address.uf
      });
    } catch (error) {
      toast.error("CEP não encontrado");
    } finally {
      setLoadingCep(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (
      !formData.nomeFantasia ||
      !formData.telefone ||
      !formData.email ||
      !formData.cep ||
      !formData.logradouro ||
      !formData.numero ||
      !formData.bairro ||
      !formData.cidade ||
      !formData.uf ||
      !formData.plano ||
      formData.valor <= 0 ||
      !formData.vencimento
    ) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    
    // Validate if either CNPJ or CPF is filled
    if (documentType === "cnpj" && !formData.cnpj) {
      toast.error("Preencha o CNPJ");
      return;
    }
    
    if (documentType === "cpf" && !formData.cpf) {
      toast.error("Preencha o CPF");
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Informações Básicas</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nomeFantasia">Nome Fantasia / Nome Completo*</Label>
                <Input
                  id="nomeFantasia"
                  name="nomeFantasia"
                  value={formData.nomeFantasia}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label>Tipo de Documento*</Label>
                <div className="flex space-x-4 mt-2">
                  <Button
                    type="button"
                    variant={documentType === "cnpj" ? "default" : "outline"}
                    onClick={() => handleDocumentTypeChange("cnpj")}
                  >
                    CNPJ
                  </Button>
                  <Button
                    type="button"
                    variant={documentType === "cpf" ? "default" : "outline"}
                    onClick={() => handleDocumentTypeChange("cpf")}
                  >
                    CPF
                  </Button>
                </div>
              </div>

              {documentType === "cnpj" && (
                <div>
                  <Label htmlFor="cnpj">CNPJ*</Label>
                  <Input
                    id="cnpj"
                    name="cnpj"
                    value={formData.cnpj || ""}
                    onChange={handleInputChange}
                    placeholder="00.000.000/0000-00"
                    required={documentType === "cnpj"}
                  />
                </div>
              )}

              {documentType === "cpf" && (
                <div>
                  <Label htmlFor="cpf">CPF*</Label>
                  <Input
                    id="cpf"
                    name="cpf"
                    value={formData.cpf || ""}
                    onChange={handleInputChange}
                    placeholder="000.000.000-00"
                    required={documentType === "cpf"}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="telefone">Telefone*</Label>
                <Input
                  id="telefone"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleInputChange}
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">E-mail*</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Endereço</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="cep">CEP*</Label>
                <div className="flex space-x-2">
                  <Input
                    id="cep"
                    name="cep"
                    value={formData.cep}
                    onChange={handleInputChange}
                    onBlur={handleCepBlur}
                    placeholder="00000-000"
                    required
                  />
                  {loadingCep && <div className="animate-pulse">Buscando...</div>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="logradouro">Logradouro*</Label>
                  <Input
                    id="logradouro"
                    name="logradouro"
                    value={formData.logradouro}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="numero">Número*</Label>
                  <Input
                    id="numero"
                    name="numero"
                    value={formData.numero}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="complemento">Complemento</Label>
                <Input
                  id="complemento"
                  name="complemento"
                  value={formData.complemento}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bairro">Bairro*</Label>
                  <Input
                    id="bairro"
                    name="bairro"
                    value={formData.bairro}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="cidade">Cidade*</Label>
                  <Input
                    id="cidade"
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="uf">UF*</Label>
                <Input
                  id="uf"
                  name="uf"
                  value={formData.uf}
                  onChange={handleInputChange}
                  required
                  maxLength={2}
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Plano e Cobrança</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="plano">Plano*</Label>
                <Input
                  id="plano"
                  name="plano"
                  value={formData.plano}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="valor">Valor (R$)*</Label>
                <Input
                  id="valor"
                  name="valor"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valor}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="vencimento">Dia de Vencimento*</Label>
                <Input
                  id="vencimento"
                  name="vencimento"
                  type="number"
                  min="1"
                  max="31"
                  value={formData.vencimento}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </Card>
    </form>
  );
};

export default ClientForm;
