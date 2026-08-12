import React, { useState } from 'react';
import { Users, Mail, UserPlus, Search, CheckCircle2, Circle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { mockTeamMembers } from '../services/mockData';

export const Team: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewMemberModalOpen, setIsNewMemberModalOpen] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [memberRole, setMemberRole] = useState('');

  const filteredMembers = mockTeamMembers.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'online':
        return (
          <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Online
          </span>
        );
      case 'busy':
        return (
          <span className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Ocupado
          </span>
        );
      case 'away':
        return (
          <span className="flex items-center gap-1.5 text-xs text-sky-600 dark:text-sky-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-sky-500" /> Ausente
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-slate-400" /> Offline
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Equipe Corporativa
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Membros ativos, atribuições e disponibilidade
          </p>
        </div>

        <Button
          onClick={() => setIsNewMemberModalOpen(true)}
          variant="primary"
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          Convidar Membro
        </Button>
      </div>

      {/* Search */}
      <div className="w-full max-w-md">
        <Input
          placeholder="Buscar colaborador por nome, cargo ou departamento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      {/* Grid of Team Members */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map((member) => (
          <Card key={member.id} hoverable className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-bold text-base flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/20">
                {member.avatar}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {member.name}
                  </h3>
                </div>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium truncate">
                  {member.role}
                </p>
                <p className="text-[11px] text-slate-400">{member.department}</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              {getStatusIndicator(member.status)}
              <Badge variant="outline" size="sm">
                {member.activeTasksCount} tarefas ativas
              </Badge>
            </div>
          </Card>
        ))}
      </div>

      {/* Invite Member Modal */}
      <Modal
        isOpen={isNewMemberModalOpen}
        onClose={() => setIsNewMemberModalOpen(false)}
        title="Convidar Novo Integrante"
        description="Envie um convite de acesso para o e-mail corporativo do colaborador."
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsNewMemberModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setIsNewMemberModalOpen(false);
                setMemberName('');
                setMemberRole('');
              }}
            >
              Enviar Convite
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Nome Completo"
            placeholder="Ex: Roberto Alves"
            value={memberName}
            onChange={(e) => setMemberName(e.target.value)}
          />
          <Input
            label="E-mail Corporativo"
            type="email"
            placeholder="roberto.alves@hubtask.com"
          />
          <Input
            label="Cargo / Função"
            placeholder="Ex: Desenvolvedor Frontend"
            value={memberRole}
            onChange={(e) => setMemberRole(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};
