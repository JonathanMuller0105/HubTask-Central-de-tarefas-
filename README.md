🎯 Objetivo
Oferecer um hub único de controle operacional onde solicitações e demandas brutas passam por triagem, aprovação e conversão em projetos estruturados, permitindo acompanhamento visual em Gantt, análise de caminho crítico e alocação diária sem sobreposição de horários.
🚀 Funcionalidades Principais
Autenticação & Controle de Acesso (RBAC):
Login, logout e persistência de sessão.
Alternância de papéis de usuário (Gestor / Colaborador) com visão contextualizada.
Dashboard de Gestão:
KPIs estratégicos (Demandas Abertas, Projetos Ativos, Taxa de Entrega, Alocação do Time).
Visão consolidada de indicadores e tarefas pendentes.
Módulo de Demandas:
Criação de novas demandas brutas.
Fluxo de Triagem e Aprovação.
Conversão direta de demanda aprovada em projeto estruturado.
Módulo de Projetos & Tarefas:
Gestão de projetos com prazos, orçamentos e responsáveis.
Acompanhamento de progresso e quadro Kanban de tarefas.
Cronograma & Execução (Gantt MVP & CPM):
Visualização Gantt em escalas Dia, Semana e Mês.
Comparação visual de datas reais vs. Baseline.
Dependências entre tarefas (Finish-to-Start) com detecção e bloqueio de ciclos.
Engine de Caminho Crítico (CPM) com cálculo de folga (slack) e destaque de tarefas críticas.
Indicadores de Schedule Variance (dias adiantados/atrasados) e Taxa de Entrega no Prazo.
Agenda & Calendário Interno:
Vistas por Hoje / Dia, Semana e Mês.
Time Blocking (Bloco de Foco) vinculado a projetos/tarefas.
Cálculo automático de Carga de Trabalho (Horas agendadas / Horas disponíveis / % Ocupação).
Detecção de Conflitos de horários sobrepostos (eventoA.start < eventoB.end AND eventoA.end > eventoB.start).
Painel de adaptadores para integrações futuras com Google Calendar e Microsoft Outlook (não conectados).
Gestão de Arquivos:
Upload simulado, listagem, visualização de metadados e download de arquivos vinculados aos projetos.
Experiência Visual & Temas:
Suporte completo a Light Mode e Dark Mode.
Layout fluido e responsivo para Desktop e dispositivos Mobile.
🛠️ Tech Stack
Frontend: React 18, TypeScript, Vite.
Roteamento: React Router DOM (HashRouter otimizado para navegação sem 404 em GitHub Pages).
Estilização: Tailwind CSS v3, Lucide React Icons, Framer Motion.
Persistência: LocalStorage estruturado com fallbacks para inicialização rápida.
CI/CD: GitHub Actions + GitHub Pages (.github/workflows/deploy-pages.yml).
