import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority, Project } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: any) => void;
  initialData?: Task | null;
  projects: Project[];
  defaultProjectId?: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  projects,
  defaultProjectId,
}) => {
  const [formData, setFormData] = useState({
    projectId: defaultProjectId || (projects[0]?.id || ''),
    title: '',
    description: '',
    status: 'todo' as TaskStatus,
    priority: 'medium' as TaskPriority,
    assignee: 'Carlos Eduardo',
    progress: 0,
    startDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        projectId: initialData.projectId,
        title: initialData.title,
        description: initialData.description || '',
        status: initialData.status,
        priority: initialData.priority || 'medium',
        assignee: initialData.assignee || 'Carlos Eduardo',
        progress: initialData.progress || 0,
        startDate: initialData.startDate || new Date().toISOString().split('T')[0],
        dueDate: initialData.dueDate || new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0],
      });
    } else {
      setFormData({
        projectId: defaultProjectId || (projects[0]?.id || ''),
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        assignee: 'Carlos Eduardo',
        progress: 0,
        startDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0],
      });
    }
    setErrors({});
  }, [initialData, isOpen, defaultProjectId, projects]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Título da tarefa é obrigatório';
    }
    if (!formData.projectId) {
      newErrors.projectId = 'Selecione um projeto para esta tarefa';
    }
    if (!formData.dueDate) {
      newErrors.dueDate = 'Prazo de conclusão é obrigatório';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Auto set progress to 100 if status is done
    let finalProgress = formData.progress;
    if (formData.status === 'done') finalProgress = 100;

    onSubmit({
      ...formData,
      progress: finalProgress,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Editar Tarefa' : 'Nova Tarefa'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Projeto Relacionado */}
        <Select
          label="Projeto Vinculado *"
          value={formData.projectId}
          onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
          options={projects.map((p) => ({
            value: p.id,
            label: `${p.code} - ${p.name}`,
          }))}
          error={errors.projectId}
        />

        {/* Título da Tarefa */}
        <Input
          label="Título da Tarefa *"
          placeholder="Ex: Implementar testes de integração com API"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          error={errors.title}
        />

        {/* Descrição */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Descrição / Requisitos
          </label>
          <textarea
            rows={3}
            placeholder="Detalhes adicionais da atividade..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-accent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none transition-all"
          />
        </div>

        {/* Grid Status & Prioridade */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => {
              const newStatus = e.target.value as TaskStatus;
              let newProg = formData.progress;
              if (newStatus === 'done') newProg = 100;
              else if (newStatus === 'todo') newProg = 0;
              else if (newStatus === 'in_progress' && newProg === 0) newProg = 25;
              setFormData({ ...formData, status: newStatus, progress: newProg });
            }}
            options={[
              { value: 'todo', label: 'A Fazer (To Do)' },
              { value: 'in_progress', label: 'Em Andamento' },
              { value: 'blocked', label: 'Bloqueado' },
              { value: 'done', label: 'Concluído (Done)' },
            ]}
          />

          <Select
            label="Prioridade"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
            options={[
              { value: 'low', label: 'Baixa' },
              { value: 'medium', label: 'Média' },
              { value: 'high', label: 'Alta' },
              { value: 'critical', label: 'Crítica' },
            ]}
          />
        </div>

        {/* Atribuído a */}
        <Select
          label="Atribuído a (Responsável)"
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

        {/* Datas: Inicio e Conclusão */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            type="date"
            label="Data de Início"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          />

          <Input
            type="date"
            label="Prazo de Conclusão *"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            error={errors.dueDate}
          />
        </div>

        {/* Slider de Progresso */}
        <div>
          <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            <span>Progresso da Tarefa</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">{formData.progress}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={formData.progress}
            onChange={(e) => {
              const val = Number(e.target.value);
              let st = formData.status;
              if (val === 100) st = 'done';
              else if (val > 0 && st === 'todo') st = 'in_progress';
              setFormData({ ...formData, progress: val, status: st });
            }}
            className="w-full accent-indigo-600 cursor-pointer"
          />
        </div>

        {/* Botões */}
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            {initialData ? 'Salvar Alterações' : 'Criar Tarefa'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
