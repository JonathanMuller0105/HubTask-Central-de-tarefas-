import React, { useEffect, useMemo, useState } from 'react';
import { UserPlus, Search, CheckCircle2, ClipboardList, LockKeyhole, ShieldCheck, UserRoundPlus } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useUserRole } from '../context/UserRoleContext';
import { useDemands } from '../hooks/useDemands';
import { useWorkspacePreferences } from '../hooks/useWorkspacePreferences';
import { PrivateDiversityProfile, TeamMember } from '../types';
import { teamService } from '../services/teamService';

const emptyRegistration = {
  name: '',
  email: '',
  role: '',
  department: '',
  workdayHours: 8,
  functions: '',
  assignedDemandIds: [] as string[],
};

export const Team: React.FC = () => {
  const { isManager, userName } = useUserRole();
  const { profile, setProfile } = useWorkspacePreferences();
  const { demands, assignDemand } = useDemands();
  const [members, setMembers] = useState<TeamMember[]>(() => teamService.getMembers());
  const [searchTerm, setSearchTerm] = useState('');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isPrivateProfileOpen, setIsPrivateProfileOpen] = useState(false);
  const [registration, setRegistration] = useState(emptyRegistration);
  const [privacyAcknowledged, setPrivacyAcknowledged] = useState(false);
  const [saved, setSaved] = useState(false);
  const memberId = `self-${userName.toLocaleLowerCase('pt-BR').replace(/\s+/g, '-')}`;
  const defaultPrivateProfile: PrivateDiversityProfile = {
    memberId,
    pronouns: 'nao_informado',
    genderIdentity: 'nao_informado',
    sexualOrientation: 'nao_informado',
  };
  const [privateProfile, setPrivateProfile] = useState<PrivateDiversityProfile>(defaultPrivateProfile);

  useEffect(() => {
    if (!isManager) {
      setPrivateProfile(teamService.getMyPrivateProfile(memberId) || defaultPrivateProfile);
    }
  }, [isManager, memberId]);

  const filteredMembers = useMemo(
    () => members.filter((member) =>
      [member.name, member.role, member.department].some((value) =>
        value.toLocaleLowerCase('pt-BR').includes(searchTerm.toLocaleLowerCase('pt-BR'))
      )
    ),
    [members, searchTerm]
  );

  const toggleDemand = (id: string) => setRegistration((current) => ({
    ...current,
    assignedDemandIds: current.assignedDemandIds.includes(id)
      ? current.assignedDemandIds.filter((item) => item !== id)
      : [...current.assignedDemandIds, id],
  }));

  const handlePreRegister = () => {
    if (!registration.name.trim() || !registration.email.trim() || !registration.role.trim() || !registration.department.trim()) return;
    const member = teamService.createPreRegistration({
      ...registration,
      name: registration.name.trim(),
      email: registration.email.trim(),
      role: registration.role.trim(),
      department: registration.department.trim(),
      functions: registration.functions.split(',').map((item) => item.trim()).filter(Boolean),
    });
    registration.assignedDemandIds.forEach((id) => assignDemand(id, member.name));
    setMembers(teamService.getMembers());
    setRegistration(emptyRegistration);
    setIsRegisterOpen(false);
  };

  const handleSavePrivateProfile = () => {
    if (!privacyAcknowledged || isManager) return;
    const data = { ...privateProfile, memberId, consentedAt: new Date().toISOString() };
    teamService.saveMyPrivateProfile(data);
    if (data.socialName?.trim()) setProfile({ ...profile, name: data.socialName.trim() });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setIsPrivateProfileOpen(false);
    }, 1200);
  };

  const fieldClass = 'w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100';

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

        {isManager && (
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setIsInviteOpen(true)} variant="outline" leftIcon={<UserPlus className="w-4 h-4" />}>
              Convidar Membro
            </Button>
            <Button onClick={() => setIsRegisterOpen(true)} variant="primary" leftIcon={<UserRoundPlus className="w-4 h-4" />}>
              Cadastrar Membro
            </Button>
          </div>
        )}
      </div>

      {!isManager && (
        <Card className="border-indigo-200 dark:border-indigo-900 bg-indigo-50/40 dark:bg-indigo-950/20">
          <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex gap-3">
              <LockKeyhole className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Autodeclaração opcional e privada</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
                  Informe somente se desejar nome social, pronomes, identidade de gênero e orientação sexual. Esses dados não são exibidos na visão Gestor.
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={() => setIsPrivateProfileOpen(true)}>Completar meu cadastro</Button>
          </CardContent>
        </Card>
      )}

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

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
              {getStatusIndicator(member.status)}
              <Badge variant="outline" size="sm">
                {member.activeTasksCount} tarefas ativas
              </Badge>
              {member.workdayHours && <Badge variant="outline" size="sm">{member.workdayHours}h/dia</Badge>}
              {member.registrationStatus === 'pre_registered' && <Badge variant="warning" size="sm">Pré-cadastro</Badge>}
            </div>
            {isManager && member.functions && member.functions.length > 0 && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3">Funções: {member.functions.join(', ')}</p>
            )}
            {isManager && member.assignedDemandIds && member.assignedDemandIds.length > 0 && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Demandas atribuídas: {member.assignedDemandIds.length}</p>
            )}
          </Card>
        ))}
      </div>

      <Modal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title="Convidar Novo Integrante"
        description="Simulação de convite: nenhum e-mail será enviado neste MVP."
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsInviteOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={() => setIsInviteOpen(false)}>Registrar convite simulado</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Nome para identificação" placeholder="Ex.: Roberto Alves" />
          <Input label="E-mail corporativo" type="email" placeholder="roberto.alves@empresa.com" />
          <p className="text-xs text-amber-700 dark:text-amber-300">Este fluxo apenas representa um convite pendente. A integração real por e-mail não está implementada.</p>
        </div>
      </Modal>

      <Modal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        title="Pré-cadastrar novo membro"
        description="Cadastre somente informações operacionais. A autodeclaração privada pertence ao próprio membro."
        maxWidth="xl"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsRegisterOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handlePreRegister}>Salvar pré-cadastro</Button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="p-3 rounded-lg bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900 text-xs text-sky-900 dark:text-sky-200">
            <ShieldCheck className="w-4 h-4 inline mr-2" />
            O nome civil não é coletado neste fluxo operacional. Seu tratamento deve ficar restrito às obrigações legais do RH.
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Input label="Nome de uso *" value={registration.name} onChange={(e) => setRegistration({ ...registration, name: e.target.value })} />
            <Input label="E-mail corporativo *" type="email" value={registration.email} onChange={(e) => setRegistration({ ...registration, email: e.target.value })} />
            <Input label="Cargo / função principal *" value={registration.role} onChange={(e) => setRegistration({ ...registration, role: e.target.value })} />
            <Input label="Departamento *" value={registration.department} onChange={(e) => setRegistration({ ...registration, department: e.target.value })} />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Carga diária
              <select className={`${fieldClass} mt-1.5`} value={registration.workdayHours} onChange={(e) => setRegistration({ ...registration, workdayHours: Number(e.target.value) })}>
                {[4, 6, 8, 10, 12].map((hours) => <option key={hours} value={hours}>{hours} horas/dia</option>)}
              </select>
            </label>
            <Input label="Funções adicionais" placeholder="Revisor, aprovador, suporte" value={registration.functions} onChange={(e) => setRegistration({ ...registration, functions: e.target.value })} helperText="Separe as funções por vírgulas." />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2"><ClipboardList className="w-4 h-4" />Atribuir demandas</span>
            <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800">
              {demands.map((demand) => (
                <label key={demand.id} className="flex items-center gap-3 p-2.5 text-xs cursor-pointer">
                  <input type="checkbox" checked={registration.assignedDemandIds.includes(demand.id)} onChange={() => toggleDemand(demand.id)} />
                  <span className="font-mono text-slate-500">{demand.code}</span>
                  <span>{demand.title}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!isManager && isPrivateProfileOpen}
        onClose={() => setIsPrivateProfileOpen(false)}
        title="Minha autodeclaração"
        description="Todos os campos são opcionais. Use “Prefiro não responder” sempre que desejar."
        maxWidth="xl"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsPrivateProfileOpen(false)}>Cancelar</Button>
            <Button variant="primary" disabled={!privacyAcknowledged} onClick={handleSavePrivateProfile} leftIcon={saved ? <CheckCircle2 className="w-4 h-4" /> : undefined}>
              {saved ? 'Salvo' : 'Salvar com privacidade'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-900 text-xs text-violet-900 dark:text-violet-200">
            <LockKeyhole className="w-4 h-4 inline mr-2" />
            Finalidade: ações internas de diversidade, inclusão e tratamento respeitoso. Não utilizar para avaliação, promoção, remuneração ou decisões discriminatórias.
          </div>
          <Input label="Nome social (opcional)" value={privateProfile.socialName || ''} onChange={(e) => setPrivateProfile({ ...privateProfile, socialName: e.target.value })} helperText="Quando informado, será usado nas áreas de identificação do HubTask." />
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Pronomes
            <select className={`${fieldClass} mt-1.5`} value={privateProfile.pronouns} onChange={(e) => setPrivateProfile({ ...privateProfile, pronouns: e.target.value as PrivateDiversityProfile['pronouns'] })}>
              <option value="nao_informado">Prefiro não responder</option><option value="ele/dele">ele/dele</option><option value="ela/dela">ela/dela</option><option value="elu/delu">elu/delu</option><option value="outro">Outro</option>
            </select>
          </label>
          {privateProfile.pronouns === 'outro' && <Input label="Como prefere ser tratado(a/e)?" value={privateProfile.customPronouns || ''} onChange={(e) => setPrivateProfile({ ...privateProfile, customPronouns: e.target.value })} />}
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Identidade de gênero
            <select className={`${fieldClass} mt-1.5`} value={privateProfile.genderIdentity} onChange={(e) => setPrivateProfile({ ...privateProfile, genderIdentity: e.target.value as PrivateDiversityProfile['genderIdentity'] })}>
              <option value="nao_informado">Prefiro não responder</option><option value="mulher_cis">Mulher cisgênero</option><option value="homem_cis">Homem cisgênero</option><option value="mulher_trans">Mulher transgênero</option><option value="homem_trans">Homem transgênero</option><option value="travesti">Travesti</option><option value="nao_binario">Pessoa não-binária</option><option value="outro">Outra identidade</option>
            </select>
          </label>
          {privateProfile.genderIdentity === 'outro' && <Input label="Como você descreve sua identidade?" value={privateProfile.customGenderIdentity || ''} onChange={(e) => setPrivateProfile({ ...privateProfile, customGenderIdentity: e.target.value })} />}
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Orientação sexual
            <select className={`${fieldClass} mt-1.5`} value={privateProfile.sexualOrientation} onChange={(e) => setPrivateProfile({ ...privateProfile, sexualOrientation: e.target.value as PrivateDiversityProfile['sexualOrientation'] })}>
              <option value="nao_informado">Prefiro não responder</option><option value="heterossexual">Heterossexual</option><option value="homossexual">Homossexual</option><option value="bissexual">Bissexual</option><option value="pansexual">Pansexual</option><option value="assexual">Assexual</option><option value="outro">Outra orientação</option>
            </select>
          </label>
          {privateProfile.sexualOrientation === 'outro' && <Input label="Como você descreve sua orientação?" value={privateProfile.customSexualOrientation || ''} onChange={(e) => setPrivateProfile({ ...privateProfile, customSexualOrientation: e.target.value })} />}
          <label className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
            <input className="mt-0.5" type="checkbox" checked={privacyAcknowledged} onChange={(e) => setPrivacyAcknowledged(e.target.checked)} />
            <span>Li e compreendi a finalidade. Sei que o preenchimento é voluntário e que posso escolher não responder.</span>
          </label>
          <p className="text-[10px] text-amber-700 dark:text-amber-300">Ambiente MVP: esta separação é somente de frontend/localStorage e não representa proteção server-side ou RBAC real.</p>
        </div>
      </Modal>
    </div>
  );
};
