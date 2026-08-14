import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, ArrowRight, Lock, Mail, ShieldCheck } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ThemeToggle } from '../components/ThemeToggle';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('jonathan.muller@grupounico.com');
  const [password, setPassword] = useState('••••••••••••');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/dashboard');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-sky-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar Header */}
      <header className="flex items-center justify-between w-full max-w-6xl mx-auto z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="font-bold text-lg text-white tracking-tight">HubTask</span>
            <span className="block text-[10px] text-slate-400 font-medium">Gestão Integrada</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </header>

      {/* Login Form Container */}
      <main className="w-full max-w-md mx-auto my-auto py-8 z-10">
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white tracking-tight">Acessar o HubTask</h1>
            <p className="text-xs text-slate-400 mt-1">
              Plataforma interna de demandas, projetos e indicadores
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="E-mail Corporativo"
              type="email"
              placeholder="seu.nome@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Senha de Acesso"
              type="password"
              placeholder="Sua senha corporativa"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-slate-700 bg-slate-900 text-brand-accent focus:ring-brand-accent"
                />
                Lembrar neste dispositivo
              </label>
              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Sua solicitação de redefinição de senha foi enviada ao administrador.');
                }}
                className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
              >
                Esqueceu a senha?
              </a>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full mt-2"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Entrar na Aplicação
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-center gap-2 text-slate-500 text-xs text-center">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Ambiente seguro com autenticação SSO integrada</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-[11px] text-slate-500 z-10 max-w-6xl mx-auto w-full">
        &copy; {new Date().getFullYear()} HubTask Corporate Platform. Todos os direitos reservados.
      </footer>
    </div>
  );
};
