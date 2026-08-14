import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useDemands } from '../hooks/useDemands';
import { urgencyWeightMap, impactWeightMap, calculatePriorityFromScore } from '../services/demandsService';
import { AlertCircle, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isNewDemandModalOpen, setIsNewDemandModalOpen] = useState(false);
  const { createDemand, getAutoAssigneeForCategory } = useDemands();

  // Form state for new demand modal
  const [demandTitle, setDemandTitle] = useState('');
  const [demandCategory, setDemandCategory] = useState<'Tecnologia' | 'Marketing' | 'Administrativo' | 'Financeiro' | 'Operacional' | 'Outro'>('Tecnologia');
  const [demandDescription, setDemandDescription] = useState('');
  const [demandUrgency, setDemandUrgency] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [demandImpact, setDemandImpact] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [demandDesiredDate, setDemandDesiredDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });

  // Conditional fields
  const [systemAffected, setSystemAffected] = useState('');
  const [channel, setChannel] = useState('');
  const [justification, setJustification] = useState('');
  const [manualAssignee, setManualAssignee] = useState('Carlos Eduardo');

  // Automatic assignment lookup
  const autoAssignee = getAutoAssigneeForCategory(demandCategory);

  // Score calculation
  const urgVal = urgencyWeightMap[demandUrgency] || 1;
  const impVal = impactWeightMap[demandImpact] || 1;
  const calculatedScore = urgVal * impVal;
  const { label: priorityLabel } = calculatePriorityFromScore(calculatedScore);

  const isHighImpact = demandImpact === 'high' || demandImpact === 'critical';

  const resetForm = () => {
    setDemandTitle('');
    setDemandCategory('Tecnologia');
    setDemandDescription('');
    setDemandUrgency('medium');
    setDemandImpact('medium');
    setSystemAffected('');
    setChannel('');
    setJustification('');
  };

  const handleCreateDemand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demandTitle.trim() || !demandDescription.trim()) return;

    if (isHighImpact && !justification.trim()) {
      alert('Justificativa é obrigatória para demandas de Alto ou Crítico Impacto.');
      return;
    }

    createDemand({
      title: demandTitle.trim(),
      category: demandCategory,
      description: demandDescription.trim(),
      urgency: demandUrgency,
      impact: demandImpact,
      desired_date: demandDesiredDate,
      requester: 'Jonathan Müller',
      manualAssignee: autoAssignee ? undefined : manualAssignee,
      system_affected: demandCategory === 'Tecnologia' ? systemAffected.trim() : undefined,
      channel: demandCategory === 'Marketing' ? channel.trim() : undefined,
      justification: isHighImpact ? justification.trim() : undefined,
    });

    setIsNewDemandModalOpen(false);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-page-light dark:bg-dark-base text-text-primary dark:text-slate-100 flex flex-col lg:flex-row transition-colors">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={() => setSidebarCollapsed((previous) => !previous)}
        onOpenNewDemandModal={() => setIsNewDemandModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Topbar */}
        <Topbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ onOpenNewDemandModal: () => setIsNewDemandModalOpen(true) }} />
        </main>
      </div>

      {/* Global New Demand Modal */}
      <Modal
        isOpen={isNewDemandModalOpen}
        onClose={() => setIsNewDemandModalOpen(false)}
        title="Cadastrar Nova Demanda para Triagem"
        description="Preencha os dados solicitados. A prioridade e atribuição serão calculadas automaticamente."
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsNewDemandModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleCreateDemand}>
              Enviar Demanda
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateDemand} className="space-y-4">
          <Input
            label="Título da Demanda"
            placeholder="Ex: Atualização dos microsserviços de cobrança"
            value={demandTitle}
            onChange={(e) => setDemandTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Categoria"
              value={demandCategory}
              onChange={(e) => setDemandCategory(e.target.value as any)}
              options={[
                { value: 'Tecnologia', label: 'Tecnologia' },
                { value: 'Marketing', label: 'Marketing' },
                { value: 'Administrativo', label: 'Administrativo' },
                { value: 'Financeiro', label: 'Financeiro' },
                { value: 'Operacional', label: 'Operacional' },
                { value: 'Outro', label: 'Outro' },
              ]}
            />

            <Input
              label="Data Desejada"
              type="date"
              value={demandDesiredDate}
              onChange={(e) => setDemandDesiredDate(e.target.value)}
              required
            />
          </div>

          {/* LÓGICA CONDICIONAL: CATEGORIA */}
          {demandCategory === 'Tecnologia' && (
            <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-xl border border-indigo-200/80 dark:border-indigo-800/50 space-y-2">
              <label className="block text-xs font-bold text-indigo-900 dark:text-indigo-200">
                Sistema Afetado (Campo Condicional - Tecnologia)
              </label>
              <Input
                placeholder="Ex: ERP Senior, CRM Sales, Portal Interno, API OAuth"
                value={systemAffected}
                onChange={(e) => setSystemAffected(e.target.value)}
                required
              />
            </div>
          )}

          {demandCategory === 'Marketing' && (
            <div className="p-3 bg-purple-50/60 dark:bg-purple-950/30 rounded-xl border border-purple-200/80 dark:border-purple-800/50 space-y-2">
              <label className="block text-xs font-bold text-purple-900 dark:text-purple-200">
                Canal (Campo Condicional - Marketing)
              </label>
              <Input
                placeholder="Ex: Redes Sociais, E-mail Marketing, Eventos, Mídia Paga"
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                required
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Urgência"
              value={demandUrgency}
              onChange={(e) => setDemandUrgency(e.target.value as any)}
              options={[
                { value: 'low', label: 'Baixa (1)' },
                { value: 'medium', label: 'Média (2)' },
                { value: 'high', label: 'Alta (3)' },
                { value: 'critical', label: 'Crítica (4)' },
              ]}
            />

            <Select
              label="Impacto"
              value={demandImpact}
              onChange={(e) => setDemandImpact(e.target.value as any)}
              options={[
                { value: 'low', label: 'Baixo (1)' },
                { value: 'medium', label: 'Médio (2)' },
                { value: 'high', label: 'Alto (3)' },
                { value: 'critical', label: 'Crítico (4)' },
              ]}
            />
          </div>

          {/* CÁLCULO DE SCORE DE PRIORIDADE */}
          <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl flex items-center justify-between border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <div>
                <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">
                  Cálculo de Prioridade (priority_score)
                </span>
                <span className="text-[10px] text-slate-500">
                  Fórmula: Urgência ({urgVal}) × Impacto ({impVal}) = {calculatedScore}
                </span>
              </div>
            </div>
            <Badge
              variant={
                calculatedScore >= 13
                  ? 'danger'
                  : calculatedScore >= 9
                  ? 'warning'
                  : calculatedScore >= 5
                  ? 'info'
                  : 'default'
              }
            >
              {priorityLabel} ({calculatedScore} pts)
            </Badge>
          </div>

          {/* LÓGICA CONDICIONAL: IMPACTO ALTO OU CRÍTICO */}
          {isHighImpact && (
            <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 rounded-xl border border-amber-300 dark:border-amber-800/60 space-y-1.5">
              <label className="block text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                Justificativa Obrigatória (Impacto Alto/Crítico)
              </label>
              <textarea
                rows={2}
                placeholder="Explique detalhadamente o porquê este pedido tem impacto relevante nos negócios..."
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            </div>
          )}

          {/* CONSULTA DE REGRAS DE ATRIBUIÇÃO (assignment_rules) */}
          <div className="p-3 rounded-xl border bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold flex items-center gap-1 text-slate-700 dark:text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Regra de Atribuição (assignment_rules)
              </span>
              {autoAssignee ? (
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                  Automático
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
                  Manual Requerido
                </span>
              )}
            </div>

            {autoAssignee ? (
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Atribuído automaticamente para <strong className="text-slate-900 dark:text-slate-100">{autoAssignee}</strong> com base na regra de categoria <span className="text-indigo-600 font-semibold">{demandCategory}</span>.
              </p>
            ) : (
              <div className="space-y-1 pt-1">
                <p className="text-[11px] text-slate-500">
                  Nenhuma regra específica para a categoria "{demandCategory}". Selecione o responsável manualmente:
                </p>
                <Select
                  value={manualAssignee}
                  onChange={(e) => setManualAssignee(e.target.value)}
                  options={[
                    { value: 'Carlos Eduardo', label: 'Carlos Eduardo (Tech Lead)' },
                    { value: 'Ana Beatriz', label: 'Ana Beatriz (Product Designer)' },
                    { value: 'Mariana Souza', label: 'Mariana Souza (Marketing)' },
                    { value: 'Lucas Silveira', label: 'Lucas Silveira (Full Stack)' },
                    { value: 'Fernanda Lima', label: 'Fernanda Lima (Financeiro)' },
                  ]}
                />
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Descrição Detalhada
            </label>
            <textarea
              rows={3}
              placeholder="Descreva o objetivo, contexto e expectativas..."
              value={demandDescription}
              onChange={(e) => setDemandDescription(e.target.value)}
              required
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
