import React, { useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import { Sun, Moon, Laptop, User, Bell, Shield, Save, Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Theme } from '../types';

export const Settings: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [saved, setSaved] = useState(false);

  // Profile Form State
  const [name, setName] = useState('Jonathan Müller');
  const [email, setEmail] = useState('jonathan.muller@grupounico.com');
  const [department, setDepartment] = useState('Gerência de Projetos');

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const themeOptions: { value: Theme; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      value: 'light',
      label: 'Tema Claro',
      desc: 'Ideal para ambientes com iluminação abundante.',
      icon: <Sun className="w-5 h-5 text-amber-500" />,
    },
    {
      value: 'dark',
      label: 'Tema Escuro',
      desc: 'Reduz o cansaço visual em ambientes de pouca luz.',
      icon: <Moon className="w-5 h-5 text-indigo-400" />,
    },
    {
      value: 'system',
      label: 'Sistema',
      desc: 'Sincroniza automaticamente com a preferência do sistema operacional.',
      icon: <Laptop className="w-5 h-5 text-slate-400" />,
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Configurações do Sistema
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Gerencie preferências visuais, perfil e parâmetros do HubTask
        </p>
      </div>

      {/* Tema Claro/Escuro/Sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Aparência & Tema</CardTitle>
          <CardDescription>
            Escolha o modo de exibição de sua preferência. A escolha é salva automaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {themeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  theme === opt.value
                    ? 'border-brand-accent dark:border-brand-accent bg-sky-50/50 dark:bg-sky-950/30 ring-2 ring-brand-accent/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  {opt.icon}
                  {theme === opt.value && (
                    <span className="w-2 h-2 rounded-full bg-brand-accent dark:bg-sky-400" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {opt.label}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {opt.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Perfil do Usuário */}
      <Card>
        <CardHeader>
          <CardTitle>Perfil do Colaborador</CardTitle>
          <CardDescription>
            Informações corporativas exibidas aos demais membros no HubTask
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nome Completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
            />
            <Input
              label="E-mail Corporativo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled
              helperText="E-mail gerenciado via diretório de usuários SSO"
            />
          </div>

          <Input
            label="Departamento / Setor"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />

          <div className="pt-2 flex justify-end">
            <Button
              variant="primary"
              onClick={handleSave}
              leftIcon={saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            >
              {saved ? 'Salvo com sucesso!' : 'Salvar Alterações'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sobre o HubTask */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
          <p>
            <strong>Aplicação:</strong> HubTask Front-End Foundation
          </p>
          <p>
            <strong>Versão:</strong> 1.0.0-production
          </p>
          <p>
            <strong>Compatibilidade:</strong> GitHub Pages HashRouter Ready
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
