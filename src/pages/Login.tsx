
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../App";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }
    
    setLoading(true);
    
    try {
      if (isSignUp) {
        // Registrar novo usuário
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) {
          toast.error(`Erro ao criar conta: ${error.message}`);
        } else {
          toast.success("Conta criada com sucesso! Faça login para continuar.");
          setIsSignUp(false);
        }
      } else {
        // Login
        const success = await login(email, password);
        
        if (success) {
          toast.success("Login realizado com sucesso!");
          navigate("/dashboard");
        } else {
          toast.error("Email ou senha incorretos.");
        }
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Ocorreu um erro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-blue-700">
            {isSignUp ? "Crie sua conta" : "Gerenciador de Cobranças"}
          </CardTitle>
          <p className="text-gray-500">
            {isSignUp ? "Preencha os dados abaixo para criar sua conta" : "Entre para gerenciar seus clientes e cobranças"}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Carregando..." : isSignUp ? "Criar conta" : "Entrar"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col">
          <Button
            variant="ghost"
            className="w-full text-sm"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? "Já tem uma conta? Entre" : "Não tem uma conta? Cadastre-se"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
