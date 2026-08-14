import React, { useState, useEffect } from 'react';
import { Project, ProjectStatus, ProjectPriority } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (projectData: any) => void;
  initialData?: Project | null;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    department: 'Engenharia de Software',
    status: 'active' as ProjectStatus,
    priority: 'medium' as ProjectPriority,
    assignee: 'Carlos Eduardo',
    manager: 'Jonathan Müller',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
    baseline: new Date(Date.now() + 25 * 24 * 3600 * 1000).toISOString().split('T')[0],
    progress: 0,
    membersCount: 4,
    isAtRisk: false,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description || '',
        department: initialData.department,
        status: initialData.status,
        priority: initialData.priority || 'medium',
        assignee: initialData.assignee || 'Carlos Eduardo',
        manager: initialData.manager || 'Jonathan Müller',
        startDate: initialData.startDate,
        endDate: initialData.endDate,
        baseline: initialData.baseline || initialData.endDate,
        progress: initialData.progress || 0,
        membersCount: initialData.membersCount || 4,
        isAtRisk: !!initialData.isAtRisk,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        department: 'Engenharia de Software',
        status: 'active',
        priority: 'medium',
        assignee: 'Carlos Eduardo',
        manager: 'Jonathan Müller',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
        baseline: new Date(Date.now() + 25 * 24 * 3600 * 1000).toISOString().split('T')[0],
        progress: 0,
        membersCount: 4,
        isAtRisk: false,
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Nome do projeto é obrigatório';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Data inicial é obrigatória';
    }
    if (!formData.endDate) {
      newErrors.endDate = 'Prazo final é obrigatório';
    }
    if (formData.endDate < formData.startDate) {
      newErrors.endDate = 'Prazo final não pode ser anterior à data inicial';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Editar Projeto' : 'Novo Projeto'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nome do Projeto */}
        <Input
          label="Nome do Projeto *"
          placeholder="Ex: Redesign da Intranet Corporativa"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
        />

        {/* Descrição */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Descrição do Projeto
          </label>
          <textarea
            rows={3}
            placeholder="Detalhamento do escopo, objetivos e entregáveis..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-accent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none transition-all"
          />
        </div>

        {/* Grid Status, Prioridade e Departamento */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
            options={[
              { value: 'planning', label: 'Em Planejamento' },
              { value: 'active', label: 'Em Andamento (Ativo)' },
              { value: 'paused', label: 'Pausado' },
              { value: 'completed', label: 'Concluído' },
              { value: 'cancelled', label: 'Cancelado' },
            ]}
          />

          <Select
            label="Prioridade"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as ProjectPriority })}
            options={[
              { value: 'low', label: 'Baixa' },
              { value: 'medium', label: 'Média' },
              { value: 'high', label: 'Alta' },
              { value: 'critical', label: 'Crítica' },
            ]}
          />

          <Select
            label="Departamento"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            options={[
              { value: 'Engenharia de Software', label: 'Engenharia de Software' },
              { value: 'Recursos Humanos', label: 'Recursos Humanos' },
              { value: 'Marketing & Design', label: 'Marketing & Design' },
              { value: 'Data & Analytics', label: 'Data & Analytics' },
              { value: 'Financeiro', label: 'Financeiro' },
              { value: 'Segurança & Conformidade', label: 'Segurança & Conformidade' },
            ]}
          />
        </div>

        {/* Responsável e Manager */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Responsável (Assignee)"
            value={formData.assignee}
            onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
            options={[
              { value: 'Carlos Eduardo', label: 'Carlos Eduardo' },
              { value: 'Ana Beatriz', label: 'Ana Beatriz' },
              { value: 'Lucas Silveira', label: 'Lucas Silveira' },
              { value: 'Mariana Souza', label: 'Mariana Souza' },
              { value: 'Fernanda Lima', label: 'Fernanda Lima' },
              { value: 'Jonathan Müller', label: 'Jonathan Müller' },
            ]}
          />

          <Select
            label="Manager / Gestor"
            value={formData.manager}
            onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
            options={[
              { value: 'Jonathan Müller', label: 'Jonathan Müller' },
              { value: 'Mariana Souza', label: 'Mariana Souza' },
              { value: 'Carlos Eduardo', label: 'Carlos Eduardo' },
            ]}
          />
        </div>

        {/* Datas: Inicial, Prazo (Prazo Final), Baseline */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            type="date"
            label="Data Inicial *"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            error={errors.startDate}
          />

          <Input
            type="date"
            label="Prazo Final *"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            error={errors.endDate}
          />

          <Input
            type="date"
            label="Baseline de Entrega"
            value={formData.baseline}
            onChange={(e) => setFormData({ ...formData, baseline: e.target.value })}
          />
        </div>

        {/* Progresso Slider & Em Risco Toggle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 items-center">
          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <span>Progresso Direto (%)</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">{formData.progress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.progress}
              onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2 pt-3 sm:pt-0">
            <input
              type="checkbox"
              id="isAtRisk"
              checked={formData.isAtRisk}
              onChange={(e) => setFormData({ ...formData, isAtRisk: e.target.checked })}
              className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500 dark:border-slate-700 dark:bg-slate-900 cursor-pointer"
            />
            <label htmlFor="isAtRisk" className="text-xs font-medium text-slate-800 dark:text-slate-200 cursor-pointer">
              Sinalizar como Projeto em Risco
            </label>
          </div>
        </div>

        {/* Botões */}
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            {initialData ? 'Salvar Alterações' : 'Criar Projeto'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
