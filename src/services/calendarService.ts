import { CalendarEvent, CalendarEventType } from '../types';
import { mockEvents } from './mockData';

const STORAGE_EVENTS_KEY = 'hubtask_calendar_events_v1';
const STORAGE_WORKDAY_KEY = 'hubtask_workday_hours_v1';

export interface ConflictInfo {
  eventId: string;
  conflictingEvents: CalendarEvent[];
  hasConflict: boolean;
}

export interface WorkloadSummary {
  date: string;
  scheduledMinutes: number;
  scheduledHours: number;
  workdayHours: number;
  availableHours: number;
  occupancyRate: number; // e.g. 75
  conflictCount: number;
  status: 'optimal' | 'light' | 'heavy' | 'overload';
}

type CalendarListener = () => void;

function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(':').map((p) => parseInt(p, 10) || 0);
  return parts[0] * 60 + (parts[1] || 0);
}

class CalendarService {
  private events: CalendarEvent[] = [];
  private workdayHours: number = 8;
  private listeners: CalendarListener[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const savedEvents = localStorage.getItem(STORAGE_EVENTS_KEY);
      if (savedEvents) {
        this.events = JSON.parse(savedEvents);
      } else {
        this.events = [...mockEvents];
        this.saveEventsToStorage();
      }

      const savedWorkday = localStorage.getItem(STORAGE_WORKDAY_KEY);
      if (savedWorkday) {
        this.workdayHours = parseFloat(savedWorkday) || 8;
      } else {
        this.workdayHours = 8;
      }
    } catch (e) {
      console.error('Error loading calendar data from storage:', e);
      this.events = [...mockEvents];
      this.workdayHours = 8;
    }
  }

  private saveEventsToStorage() {
    try {
      localStorage.setItem(STORAGE_EVENTS_KEY, JSON.stringify(this.events));
    } catch (e) {
      console.error('Error saving calendar events to storage:', e);
    }
    this.notifyListeners();
  }

  private saveWorkdayToStorage() {
    try {
      localStorage.setItem(STORAGE_WORKDAY_KEY, this.workdayHours.toString());
    } catch (e) {
      console.error('Error saving workday hours to storage:', e);
    }
    this.notifyListeners();
  }

  public subscribe(listener: CalendarListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((l) => l());
  }

  public getEvents(): CalendarEvent[] {
    return [...this.events];
  }

  public getWorkdayHours(): number {
    return this.workdayHours;
  }

  public setWorkdayHours(hours: number): number {
    const clamped = Math.max(1, Math.min(24, hours));
    this.workdayHours = clamped;
    this.saveWorkdayToStorage();
    return clamped;
  }

  public addEvent(newEventData: Omit<CalendarEvent, 'id'>): CalendarEvent {
    const newId = `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    
    // Ensure startTime and endTime formats
    const startTime = newEventData.startTime || '09:00';
    const endTime = newEventData.endTime || '10:00';
    const timeDisplay = `${startTime} - ${endTime}`;

    const newEvent: CalendarEvent = {
      ...newEventData,
      id: newId,
      startTime,
      endTime,
      time: newEventData.time || timeDisplay,
    };

    this.events.push(newEvent);
    this.saveEventsToStorage();
    return newEvent;
  }

  public updateEvent(id: string, updatedData: Partial<CalendarEvent>): CalendarEvent | null {
    const index = this.events.findIndex((e) => e.id === id);
    if (index === -1) return null;

    const current = this.events[index];
    const startTime = updatedData.startTime || current.startTime;
    const endTime = updatedData.endTime || current.endTime;
    const timeDisplay = `${startTime} - ${endTime}`;

    const updatedEvent: CalendarEvent = {
      ...current,
      ...updatedData,
      startTime,
      endTime,
      time: updatedData.time || timeDisplay,
    };

    this.events[index] = updatedEvent;
    this.saveEventsToStorage();
    return updatedEvent;
  }

  public deleteEvent(id: string): boolean {
    const initialLen = this.events.length;
    this.events = this.events.filter((e) => e.id !== id);
    if (this.events.length !== initialLen) {
      this.saveEventsToStorage();
      return true;
    }
    return false;
  }

  /**
   * Detects schedule conflicts between events.
   * Condition: eventoA.start < eventoB.end AND eventoA.end > eventoB.start
   */
  public detectConflicts(events: CalendarEvent[] = this.events): Map<string, CalendarEvent[]> {
    const conflictMap = new Map<string, CalendarEvent[]>();

    for (let i = 0; i < events.length; i++) {
      for (let j = i + 1; j < events.length; j++) {
        const a = events[i];
        const b = events[j];

        if (a.date === b.date) {
          const startA = timeToMinutes(a.startTime);
          const endA = timeToMinutes(a.endTime);
          const startB = timeToMinutes(b.startTime);
          const endB = timeToMinutes(b.endTime);

          // Check overlap: startA < endB AND endA > startB
          if (startA < endB && endA > startB) {
            const listA = conflictMap.get(a.id) || [];
            if (!listA.some((item) => item.id === b.id)) {
              listA.push(b);
            }
            conflictMap.set(a.id, listA);

            const listB = conflictMap.get(b.id) || [];
            if (!listB.some((item) => item.id === a.id)) {
              listB.push(a);
            }
            conflictMap.set(b.id, listB);
          }
        }
      }
    }

    return conflictMap;
  }

  /**
   * Calculates daily workload (Carga de trabalho):
   * - horas agendadas (scheduled hours)
   * - horas disponíveis (available hours)
   * - taxa de ocupação (%)
   * - conflitos identificados
   */
  public calculateWorkload(dateStr: string, events: CalendarEvent[] = this.events): WorkloadSummary {
    const dayEvents = events.filter((e) => e.date === dateStr);
    let totalMinutes = 0;

    dayEvents.forEach((e) => {
      const start = timeToMinutes(e.startTime);
      const end = timeToMinutes(e.endTime);
      if (end > start) {
        totalMinutes += end - start;
      }
    });

    const scheduledHours = Math.round((totalMinutes / 60) * 10) / 10;
    const availableHours = Math.max(0, Math.round((this.workdayHours - scheduledHours) * 10) / 10);
    const occupancyRate = this.workdayHours > 0 ? Math.round((scheduledHours / this.workdayHours) * 100) : 0;

    const conflicts = this.detectConflicts(dayEvents);

    let status: 'optimal' | 'light' | 'heavy' | 'overload' = 'optimal';
    if (occupancyRate > 100) status = 'overload';
    else if (occupancyRate >= 80) status = 'heavy';
    else if (occupancyRate < 40) status = 'light';

    return {
      date: dateStr,
      scheduledMinutes: totalMinutes,
      scheduledHours,
      workdayHours: this.workdayHours,
      availableHours,
      occupancyRate,
      conflictCount: conflicts.size,
      status,
    };
  }
}

export const calendarService = new CalendarService();
