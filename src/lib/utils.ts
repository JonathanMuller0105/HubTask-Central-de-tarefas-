/**
 * Combines CSS class names filtering falsy values
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export const BRAZIL_TIME_ZONE = 'America/Sao_Paulo';
export const BRAZIL_LOCALE = 'pt-BR';

/** Current calendar date in Brasília as YYYY-MM-DD for controls and local calculations. */
export function getBrasiliaDateString(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: BRAZIL_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value || '';
  return `${value('year')}-${value('month')}-${value('day')}`;
}

/** Adds calendar days without allowing the host machine timezone to shift the date. */
export function addDaysToDateString(dateString: string, days: number): string {
  const [year, month, day] = dateString.split('-').map(Number);
  if (![year, month, day].every(Number.isFinite)) return dateString;
  const date = new Date(Date.UTC(year, month - 1, day + days, 12));
  return date.toISOString().slice(0, 10);
}

function parseForBrazil(dateString: string): Date {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateString)
    ? new Date(`${dateString}T12:00:00Z`)
    : new Date(dateString);
}

/**
 * Format date to Brazilian locale format (DD/MM/YYYY)
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = parseForBrazil(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat(BRAZIL_LOCALE, {
    timeZone: BRAZIL_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(dateString: string): string {
  if (!dateString) return '';
  const date = parseForBrazil(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat(BRAZIL_LOCALE, {
    timeZone: BRAZIL_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

export function formatTime(value: string): string {
  if (!value) return '';
  const timeOnly = value.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (timeOnly) {
    const hour = Number(timeOnly[1]);
    const minute = Number(timeOnly[2]);
    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    }
    return value;
  }

  const date = new Date(value);
  if (isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(BRAZIL_LOCALE, {
    timeZone: BRAZIL_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}
