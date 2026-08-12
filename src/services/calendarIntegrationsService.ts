export interface ExternalCalendarAdapter {
  id: 'google_calendar' | 'outlook';
  name: string;
  provider: 'Google Workspace' | 'Microsoft 365';
  status: 'disconnected' | 'connected' | 'blocked_pending_server';
  description: string;
  connectedAccount?: string;
  lastSyncAt?: string;
  icon: 'google' | 'microsoft';
  securityNotice?: string;
  proposedArchitecture?: {
    edgeFunctionAuth: string;
    edgeFunctionSync: string;
    databaseTable: string;
    requiredScopes: string[];
  };
}

class CalendarIntegrationsService {
  private adapters: ExternalCalendarAdapter[] = [
    {
      id: 'google_calendar',
      name: 'Google Calendar',
      provider: 'Google Workspace',
      status: 'blocked_pending_server',
      description: 'Sincronização bidirecional de compromissos com o Google Calendar.',
      icon: 'google',
      securityNotice:
        'BLOQUEADO até configuração segura: O HubTask é executado como uma aplicação estática (SPA/GitHub Pages). ' +
        'A implementação de OAuth 2.0 bidirecional com Google Calendar exige a troca de código por refresh_token ' +
        'e armazenamento seguro do client_secret em um componente server-side (Supabase Edge Function ou backend equivalente).',
      proposedArchitecture: {
        edgeFunctionAuth: '/functions/v1/google-calendar-auth (Troca de OAuth Code por Refresh Token)',
        edgeFunctionSync: '/functions/v1/google-calendar-sync (Sincronização Bidirecional HubTask ↔ Google)',
        databaseTable: 'user_oauth_tokens (tokens criptografados via Supabase Vault com RLS)',
        requiredScopes: [
          'https://www.googleapis.com/auth/calendar.events',
          'https://www.googleapis.com/auth/calendar.readonly',
        ],
      },
    },
    {
      id: 'outlook',
      name: 'Microsoft Outlook',
      provider: 'Microsoft 365',
      status: 'blocked_pending_server',
      description: 'Integração de eventos e reuniões corporativas via Outlook & Teams.',
      icon: 'microsoft',
      securityNotice:
        'BLOQUEADO até configuração segura: Exige backend seguro para gerenciamento de tokens OAuth Microsoft Graph e webhooks.',
      proposedArchitecture: {
        edgeFunctionAuth: '/functions/v1/outlook-auth',
        edgeFunctionSync: '/functions/v1/outlook-sync',
        databaseTable: 'user_oauth_tokens',
        requiredScopes: ['Calendars.ReadWrite', 'offline_access'],
      },
    },
  ];

  public getAdapters(): ExternalCalendarAdapter[] {
    return this.adapters;
  }

  public getAdapterById(id: string): ExternalCalendarAdapter | undefined {
    return this.adapters.find((a) => a.id === id);
  }

  public async prepareIntegration(id: string): Promise<{ success: boolean; message: string; blockedReason?: string }> {
    const adapter = this.getAdapterById(id);
    if (!adapter) {
      return { success: false, message: 'Provedor não encontrado.' };
    }
    return {
      success: false,
      message: `A integração direta com ${adapter.name} foi marcada como BLOQUEADA por diretriz de segurança em ambientes estáticos (GitHub Pages).`,
      blockedReason: adapter.securityNotice,
    };
  }
}

export const calendarIntegrationsService = new CalendarIntegrationsService();

