import type { CalendarEvent } from '../../types';

export interface CalendarRepository {
  listEvents(): Promise<CalendarEvent[]>;
  getWorkdayHours(): Promise<number>;
  setWorkdayHours(hours: number): Promise<number>;
  createEvent(data: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent>;
  updateEvent(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent | null>;
  deleteEvent(id: string): Promise<boolean>;
}
