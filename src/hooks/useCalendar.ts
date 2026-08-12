import { useState, useEffect, useMemo, useCallback } from 'react';
import { CalendarEvent, CalendarEventType } from '../types';
import { calendarService, WorkloadSummary } from '../services/calendarService';
import { calendarIntegrationsService, ExternalCalendarAdapter } from '../services/calendarIntegrationsService';

export function useCalendar(selectedDateStr?: string) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [workdayHours, setWorkdayHoursState] = useState<number>(8);
  const [adapters, setAdapters] = useState<ExternalCalendarAdapter[]>([]);
  const [loading, setLoading] = useState(true);

  const currentDateStr = selectedDateStr || new Date().toISOString().split('T')[0];

  const updateState = useCallback(() => {
    setEvents(calendarService.getEvents());
    setWorkdayHoursState(calendarService.getWorkdayHours());
    setAdapters(calendarIntegrationsService.getAdapters());
    setLoading(false);
  }, []);

  useEffect(() => {
    updateState();
    const unsubscribe = calendarService.subscribe(updateState);
    return () => unsubscribe();
  }, [updateState]);

  // Conflict map for all events
  const conflictMap = useMemo(() => {
    return calendarService.detectConflicts(events);
  }, [events]);

  // Daily workload for currentDateStr
  const todayWorkload: WorkloadSummary = useMemo(() => {
    return calendarService.calculateWorkload(currentDateStr, events);
  }, [currentDateStr, events, workdayHours]);

  // Helper to create a Time Block (Bloco de Foco)
  const createFocusBlock = useCallback(
    (data: {
      title: string;
      description?: string;
      date: string;
      startTime: string;
      endTime: string;
      project_id?: string;
      task_id?: string;
    }) => {
      return calendarService.addEvent({
        ...data,
        type: 'focus',
        location: 'Sessão de Foco',
      });
    },
    []
  );

  return {
    events,
    workdayHours,
    adapters,
    loading,
    conflictMap,
    todayWorkload,
    // Workload calculation helper for arbitrary date
    getWorkloadForDate: (dateStr: string) => calendarService.calculateWorkload(dateStr, events),
    // Actions
    addEvent: calendarService.addEvent.bind(calendarService),
    updateEvent: calendarService.updateEvent.bind(calendarService),
    deleteEvent: calendarService.deleteEvent.bind(calendarService),
    setWorkdayHours: (hours: number) => {
      const val = calendarService.setWorkdayHours(hours);
      setWorkdayHoursState(val);
    },
    createFocusBlock,
    prepareIntegration: calendarIntegrationsService.prepareIntegration.bind(calendarIntegrationsService),
  };
}
