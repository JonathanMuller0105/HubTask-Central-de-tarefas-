import { Task, TaskDependency } from '../types';

export interface CPMTaskResult {
  taskId: string;
  duration: number; // Em dias
  es: number; // Earliest Start (dia relativo)
  ef: number; // Earliest Finish
  ls: number; // Latest Start
  lf: number; // Latest Finish
  slack: number; // Folga Total
  isCritical: boolean; // slack === 0
  esDate: string; // Data ISO formatada para ES
  efDate: string; // Data ISO formatada para EF
}

export interface CPMResult {
  isValid: boolean;
  reason?: string;
  projectDurationDays?: number;
  criticalPathTaskIds: string[];
  tasksResult: Record<string, CPMTaskResult>;
}

// Helper: parse date to midnight timestamp
function parseDate(dateStr: string): number {
  return new Date(dateStr + 'T00:00:00').getTime();
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function diffDays(startStr: string, endStr: string): number {
  const ms = parseDate(endStr) - parseDate(startStr);
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

/**
  * Cycle detection in directed dependency graph.
  * Checks if adding an edge (newPredId -> newSuccId) would create a cycle.
  */
export function detectCycle(
  existingDependencies: TaskDependency[],
  newPredId: string,
  newSuccId: string
): boolean {
  if (newPredId === newSuccId) return true;

  // Build adjacency list: pred -> list of succs
  const adj: Record<string, string[]> = {};
  existingDependencies.forEach((dep) => {
    if (!adj[dep.predecessorId]) adj[dep.predecessorId] = [];
    adj[dep.predecessorId].push(dep.successorId);
  });

  // Adding new edge: newPredId -> newSuccId
  if (!adj[newPredId]) adj[newPredId] = [];
  adj[newPredId].push(newSuccId);

  // Check for cycles using DFS color marking (0: unvisited, 1: visiting, 2: visited)
  const visited: Record<string, number> = {};

  const dfs = (node: string): boolean => {
    visited[node] = 1; // Visiting
    const neighbors = adj[node] || [];
    for (const neighbor of neighbors) {
      if (visited[neighbor] === 1) {
        return true; // Found back-edge (cycle)
      }
      if (!visited[neighbor]) {
        if (dfs(neighbor)) return true;
      }
    }
    visited[node] = 2; // Visited
    return false;
  };

  // Run DFS from all nodes
  const allNodes = new Set<string>();
  existingDependencies.forEach((dep) => {
    allNodes.add(dep.predecessorId);
    allNodes.add(dep.successorId);
  });
  allNodes.add(newPredId);
  allNodes.add(newSuccId);

  for (const node of allNodes) {
    if (!visited[node]) {
      if (dfs(node)) return true;
    }
  }

  return false;
}

/**
  * Calculates the Critical Path Method (CPM) for a set of project tasks and Finish-to-Start dependencies.
  */
export function calculateCPM(tasks: Task[], dependencies: TaskDependency[]): CPMResult {
  if (!tasks || tasks.length === 0) {
    return {
      isValid: false,
      reason: 'Não há tarefas disponíveis no projeto para calcular o Caminho Crítico.',
      criticalPathTaskIds: [],
      tasksResult: {},
    };
  }

  // 1. Validate dates and consistency
  for (const t of tasks) {
    if (!t.startDate || !t.dueDate) {
      return {
        isValid: false,
        reason: `A tarefa "${t.title}" (${t.code}) não possui datas de início ou término válidas.`,
        criticalPathTaskIds: [],
        tasksResult: {},
      };
    }
    if (parseDate(t.dueDate) < parseDate(t.startDate)) {
      return {
        isValid: false,
        reason: `A data de término da tarefa "${t.title}" (${t.code}) é anterior à data de início.`,
        criticalPathTaskIds: [],
        tasksResult: {},
      };
    }
  }

  // 2. Check for dependency cycles in current dependencies
  const sampleDep = dependencies[0];
  if (sampleDep && detectCycle(dependencies.slice(1), sampleDep.predecessorId, sampleDep.successorId)) {
    return {
      isValid: false,
      reason: 'Cálculo CPM suspenso: existe um ciclo de dependências entre as tarefas.',
      criticalPathTaskIds: [],
      tasksResult: {},
    };
  }

  // Find min project start date
  const minStartDate = tasks.reduce((min, t) => (t.startDate < min ? t.startDate : min), tasks[0].startDate);

  // Filter dependencies to only relevant tasks
  const taskMap = new Map<string, Task>();
  tasks.forEach((t) => taskMap.set(t.id, t));

  const validDeps = dependencies.filter(
    (d) => taskMap.has(d.predecessorId) && taskMap.has(d.successorId)
  );

  // Predecessors and Successors maps
  const predMap: Record<string, string[]> = {};
  const succMap: Record<string, string[]> = {};

  tasks.forEach((t) => {
    predMap[t.id] = [];
    succMap[t.id] = [];
  });

  validDeps.forEach((d) => {
    predMap[d.successorId].push(d.predecessorId);
    succMap[d.predecessorId].push(d.successorId);
  });

  // Calculate duration in days for each task (at least 1 day)
  const durations: Record<string, number> = {};
  tasks.forEach((t) => {
    const days = diffDays(t.startDate, t.dueDate) + 1;
    durations[t.id] = Math.max(1, days);
  });

  // Forward Pass: calculate ES & EF
  const es: Record<string, number> = {};
  const ef: Record<string, number> = {};

  // Topological sorting or iterative relaxation
  let changed = true;
  let iterations = 0;
  const maxIter = tasks.length * 2 + 10;

  // Initialize ES from task startDate relative to minStartDate
  tasks.forEach((t) => {
    const startOffset = Math.max(0, diffDays(minStartDate, t.startDate));
    es[t.id] = startOffset;
    ef[t.id] = es[t.id] + durations[t.id] - 1;
  });

  while (changed && iterations < maxIter) {
    changed = false;
    iterations++;

    for (const t of tasks) {
      const preds = predMap[t.id];
      if (preds.length > 0) {
        let maxPredEF = -1;
        preds.forEach((pId) => {
          if (ef[pId] !== undefined && ef[pId] > maxPredEF) {
            maxPredEF = ef[pId];
          }
        });

        if (maxPredEF !== -1) {
          const reqES = maxPredEF + 1;
          if (reqES > es[t.id]) {
            es[t.id] = reqES;
            ef[t.id] = es[t.id] + durations[t.id] - 1;
            changed = true;
          }
        }
      }
    }
  }

  if (iterations >= maxIter) {
    return {
      isValid: false,
      reason: 'Inconsistência no cálculo do caminho crítico (possível dependência circular oculta).',
      criticalPathTaskIds: [],
      tasksResult: {},
    };
  }

  // Backward Pass: calculate LF & LS
  const maxProjectEF = Math.max(...tasks.map((t) => ef[t.id]));
  const lf: Record<string, number> = {};
  const ls: Record<string, number> = {};

  tasks.forEach((t) => {
    // If terminal node (no successors)
    if (succMap[t.id].length === 0) {
      lf[t.id] = maxProjectEF;
    } else {
      lf[t.id] = maxProjectEF; // Will be relaxed
    }
    ls[t.id] = lf[t.id] - durations[t.id] + 1;
  });

  changed = true;
  iterations = 0;

  while (changed && iterations < maxIter) {
    changed = false;
    iterations++;

    for (const t of tasks) {
      const succs = succMap[t.id];
      if (succs.length > 0) {
        let minSuccLS = Infinity;
        succs.forEach((sId) => {
          if (ls[sId] !== undefined && ls[sId] < minSuccLS) {
            minSuccLS = ls[sId];
          }
        });

        if (minSuccLS !== Infinity) {
          const reqLF = minSuccLS - 1;
          if (reqLF < lf[t.id]) {
            lf[t.id] = reqLF;
            ls[t.id] = lf[t.id] - durations[t.id] + 1;
            changed = true;
          }
        }
      }
    }
  }

  // Calculate Slack and identify Critical Tasks
  const tasksResult: Record<string, CPMTaskResult> = {};
  const criticalPathTaskIds: string[] = [];

  tasks.forEach((t) => {
    const slack = Math.max(0, ls[t.id] - es[t.id]);
    const isCritical = slack === 0;

    if (isCritical) {
      criticalPathTaskIds.push(t.id);
    }

    tasksResult[t.id] = {
      taskId: t.id,
      duration: durations[t.id],
      es: es[t.id],
      ef: ef[t.id],
      ls: ls[t.id],
      lf: lf[t.id],
      slack,
      isCritical,
      esDate: addDays(minStartDate, es[t.id]),
      efDate: addDays(minStartDate, ef[t.id]),
    };
  });

  return {
    isValid: true,
    projectDurationDays: maxProjectEF + 1,
    criticalPathTaskIds,
    tasksResult,
  };
}
