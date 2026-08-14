import React, { useRef, useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useWorkspacePreferences } from '../hooks/useWorkspacePreferences';
import { Sun, Moon, Laptop, User, Save, Check, Camera, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AccentColor, Theme, VisualIntensity } from '../types';

export const Settings: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { accentColor, intensity, profile, setAccentColor, setIntensity, setProfile } = useWorkspacePreferences();
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile Form State
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [department, setDepartment] = useState(profile.department);
  const [photo, setPhoto] = useState<string | null>(profile.photo);

  const handleSave = () => {
    setProfile({ name: name.trim() || profile.name, email, department: department.trim(), photo });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Escolha uma imagem de até 2 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const accents: { value: AccentColor; label: string; className: string }[] = [
    { value: 'indigo', label: 'Índigo', className: 'bg-indigo-600' },
    { value: 'blue', label: 'Azul', className: 'bg-blue-600' },
    { value: 'emerald', label: 'Verde', className: 'bg-emerald-600' },
    { value: 'rose', label: 'Rosa', className: 'bg-rose-600' },
    { value: 'amber', label: 'Âmbar', className: 'bg-amber-600' },
  ];

  const intensities: { value: VisualIntensity; label: string }[] = [
    { value: 'soft', label: 'Suave' },
    { value: 'balanced', label: 'Equilibrada' },
    { value: 'vivid', label: 'Vibrante' },
  ];

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
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  {opt.icon}
                  {theme === opt.value && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
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

      <Card>
        <CardHeader>
          <CardTitle>Personalização da área de trabalho</CardTitle>
          <CardDescription>Escolha a cor de destaque e a intensidade das superfícies do HubTask.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">Cor de destaque</span>
            <div className="flex flex-wrap gap-3">
              {accents.map((accent) => (
                <button
                  key={accent.value}
                  type="button"
                  onClick={() => setAccentColor(accent.value)}
                  aria-label={`Usar cor ${accent.label}`}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                    accentColor === accent.value
                      ? 'border-slate-700 dark:border-slate-200 ring-2 ring-slate-400/30'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full ${accent.className}`} />
                  {accent.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">Intensidade visual</span>
            <div className="grid grid-cols-3 gap-2 max-w-md">
              {intensities.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setIntensity(option.value)}
                  className={`px-3 py-2 rounded-lg border text-xs font-semibold ${
                    intensity === option.value
                      ? 'workspace-accent-surface border-[var(--workspace-accent)] workspace-accent-text'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
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
          <div className="flex items-center gap-4 pb-2">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 ring-2 ring-slate-200 dark:ring-slate-700 flex items-center justify-center">
              {photo ? (
                <img src={photo} alt="Foto de perfil" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-slate-400" />
              )}
            </div>
            <div className="space-y-2">
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} leftIcon={<Camera className="w-4 h-4" />}>
                Escolher foto
              </Button>
              {photo && (
                <Button variant="ghost" size="sm" onClick={() => setPhoto(null)} className="text-rose-600" leftIcon={<Trash2 className="w-4 h-4" />}>
                  Remover
                </Button>
              )}
              <p className="text-[10px] text-slate-500 dark:text-slate-400">JPG, PNG ou WebP, até 2 MB.</p>
            </div>
          </div>
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
