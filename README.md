# HubTask — Sistema de Gestão de Projetos, Demandas e Cronograma

HubTask é uma plataforma completa para organização de trabalho, acompanhamento de capacidade diária, cronogramas interativos e gestão de execução de projetos.

---

## 🎯 Objetivos do Projeto

- **Demandas e Triagem**: Entrada, classificação de urgência/impacto e aprovação de novas solicitações.
- **Gestão de Projetos e Tarefas**: Planejamento, atribuição de responsáveis e acompanhamento de progresso.
- **Agenda e Time Blocking**: Calendário interno com cálculo de capacidade de carga diária, taxas de ocupação e detecção automática de conflitos de horários.
- **Cronograma e Análise CPM (Gantt)**: Mapa de execução com dependências *Finish-to-Start*, cálculo de Caminho Crítico (CPM) e medições de atrasos.
- **Arquitetura Pronta para Produção**: Deploy simplificado e automatizado no GitHub Pages via GitHub Actions.

---

## 🔒 Relatório de Segurança e Governança: Integração Google Calendar

### Status do Bloco: **BLOQUEADO ATÉ CONFIGURAÇÃO SEGURA (Edge Function / Server-side)**

Conforme diretrizes de segurança da informação e governança de dados para **aplicações estáticas hospedadas no GitHub Pages (SPA)**:

> **REQUISITO DE SEGURANÇA CRÍTICO**: Credenciais privadas (`client_secret`), códigos de autorização OAuth 2.0 e `refresh_tokens` **NUNCA** devem ser expostos ou processados diretamente no bundle JavaScript do navegador.

### Razão do Bloqueio no Frontend Estático
1. **GitHub Pages é um ambiente 100% estático**: Não possui um servidor Node.js/Express para atuar como middleware seguro.
2. **Troca de Tokens OAuth2**: A API do Google Calendar exige o envio do `client_secret` no endpoint `https://oauth2.googleapis.com/token` para obter `access_token` e `refresh_token`. Enviar essa chave no client-side exporia as credenciais de produção publicamente no DevTools do navegador.
3. **Sincronização Bidirecional em Segundo Plano**: Exige armazenamento persistente e criptografado do `refresh_token` de cada usuário, o que não pode ser feito com segurança no `localStorage` do navegador.

---

### 🚀 Proposta Arquitetural: Supabase Edge Functions + Vault RLS

Para habilitar a sincronização real e bidirecional do Google Calendar em produção sem comprometer o deploy estático no GitHub Pages, propõe-se a seguinte infraestrutura backend:

#### 1. Endpoint para Troca Transparente de Token (`/functions/v1/google-calendar-auth`)
```typescript
// Supabase Edge Function (Deno/TypeScript)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const { code, redirect_uri } = await req.json();
  const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");
  const clientId = Deno.env.get("GOOGLE_CLIENT_ID");

  // Troca de autorização realizada estritamente server-side
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId!,
      client_secret: clientSecret!,
      redirect_uri,
      grant_type: "authorization_code",
    }),
  });

  const tokens = await tokenResponse.json();
  // Criptografa e armazena o refresh_token no Supabase DB com RLS
  return new Response(JSON.stringify({ success: true, status: "connected" }), {
    headers: { "Content-Type": "application/json" },
  });
});
```

#### 2. Endpoint para Sincronização Bidirecional (`/functions/v1/google-calendar-sync`)
- **HubTask → Google Calendar**: Escuta alterações na tabela `calendar_events` e faz chamadas para a API do Google Calendar (`POST/PUT/DELETE /calendar/v3/calendars/primary/events`).
- **Google Calendar → HubTask**: Configura webhook (`watch`) no Google Calendar para receber modificações e atualizar o HubTask em tempo real.

#### 3. Tabela de Armazenamento Seguro (`user_oauth_tokens`)
- Tabela do Supabase PostgreSQL com extensão `pgcrypto`.
- **Row Level Security (RLS)** habilitado: Apenas o próprio usuário autenticado via `auth.uid()` pode ler/gravar seus dados de integração.

---

## 🛠️ Stack Tecnológico

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React icons
- **Roteamento**: React Router (HashRouter para compatibilidade total com GitHub Pages)
- **Compilador**: Vite
- **Análise CPM & Gantt**: Algoritmos customizados de ordenação topológica e gráfico de Gantt responsivo
- **CI/CD**: GitHub Actions (`.github/workflows/deploy-pages.yml`)

---

## 💻 Desenvolvimento Local

```bash
# 1. Instalar dependências com o lockfile oficial
bun install --frozen-lockfile

# 2. Executar servidor de desenvolvimento
bun run dev

# 3. Validar testes, TypeScript e build
bun test
bun run lint
bun run build
```

---

## 🚀 Deploy no GitHub Pages

O repositório já conta com workflow automatizado no GitHub Actions em `.github/workflows/deploy-pages.yml`.

### Como Ativar no Repositório do GitHub:
1. Vá em **Settings** > **Pages** do repositório no GitHub.
2. Em **Source**, selecione **GitHub Actions**.
3. Faça um `push` para a branch `main`. O deploy ocorrerá automaticamente!
