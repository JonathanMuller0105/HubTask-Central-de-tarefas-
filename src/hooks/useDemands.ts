import { useState, useEffect } from 'react';
import { demandsService } from '../services/demandsService';
import { Demand, DemandStatus } from '../types';

export function useDemands() {
  const [demands, setDemands] = useState<Demand[]>(() => demandsService.getDemands());
  const [metrics, setMetrics] = useState(() => demandsService.getMetrics());
  const rules = demandsService.getAssignmentRules();

  useEffect(() => {
    const unsubscribe = demandsService.subscribe(() => {
      setDemands(demandsService.getDemands());
      setMetrics(demandsService.getMetrics());
    });
    return unsubscribe;
  }, []);

  const createDemand = (input: Parameters<typeof demandsService.createDemand>[0]) => {
    return demandsService.createDemand(input);
  };

  const updateDemandStatus = (
    id: string,
    newStatus: DemandStatus,
    commentText?: string,
    authorName?: string
  ) => {
    return demandsService.updateDemandStatus(id, newStatus, commentText, authorName);
  };

  const addComment = (id: string, author: string, text: string) => {
    return demandsService.addComment(id, author, text);
  };

  const assignDemand = (id: string, assignee: string) => {
    return demandsService.assignDemand(id, assignee);
  };

  const convertDemandToProject = (id: string, managerName?: string) => {
    return demandsService.convertDemandToProject(id, managerName);
  };

  const calculateSLA = (demand: Demand) => {
    return demandsService.calculateDemandSLA(demand);
  };

  return {
    demands,
    metrics,
    rules,
    createDemand,
    updateDemandStatus,
    addComment,
    assignDemand,
    convertDemandToProject,
    calculateSLA,
    getAutoAssigneeForCategory: (cat: string) => demandsService.getAutoAssigneeForCategory(cat),
  };
}
