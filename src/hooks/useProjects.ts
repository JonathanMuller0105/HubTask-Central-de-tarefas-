import { useState, useEffect } from 'react';
import { Project, Task, ProjectFile, TaskDependency } from '../types';
import { projectsService } from '../services/projectsService';
import { useUserRole } from '../context/UserRoleContext';

export function useProjects() {
  const { role, userName, isManager } = useUserRole();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dependencies, setDependencies] = useState<TaskDependency[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const updateData = () => {
      setProjects(projectsService.getProjects());
      setTasks(projectsService.getTasks());
      setDependencies(projectsService.getDependencies());
      setLoading(false);
    };

    updateData();
    const unsubscribe = projectsService.subscribe(updateData);
    return () => unsubscribe();
  }, []);

  // Filter projects based on role
  // Manager: visualizes all projects
  // Member: visualizes projects assigned to member or managed by member or where member has tasks
  const filteredProjects = projects.filter((p) => {
    if (isManager) return true;
    const isAssignee = p.assignee?.toLowerCase() === userName.toLowerCase();
    const isManagerPerson = p.manager?.toLowerCase() === userName.toLowerCase();
    const hasTaskAssigned = tasks.some(
      (t) => t.projectId === p.id && t.assignee?.toLowerCase() === userName.toLowerCase()
    );
    return isAssignee || isManagerPerson || hasTaskAssigned;
  });

  // Filter tasks based on role
  const filteredTasks = tasks.filter((t) => {
    if (isManager) return true;
    return t.assignee?.toLowerCase() === userName.toLowerCase();
  });

  return {
    projects: filteredProjects,
    allProjects: projects,
    tasks: filteredTasks,
    allTasks: tasks,
    dependencies,
    loading,
    role,
    isManager,
    userName,
    // Service methods
    createProject: projectsService.createProject.bind(projectsService),
    updateProject: projectsService.updateProject.bind(projectsService),
    deleteProject: projectsService.deleteProject.bind(projectsService),
    getProjectById: projectsService.getProjectById.bind(projectsService),
    getTasks: projectsService.getTasks.bind(projectsService),
    createTask: projectsService.createTask.bind(projectsService),
    updateTask: projectsService.updateTask.bind(projectsService),
    deleteTask: projectsService.deleteTask.bind(projectsService),
    getDependencies: projectsService.getDependencies.bind(projectsService),
    addDependency: projectsService.addDependency.bind(projectsService),
    deleteDependency: projectsService.deleteDependency.bind(projectsService),
    getFiles: projectsService.getFiles.bind(projectsService),
    addFile: projectsService.addFile.bind(projectsService),
    deleteFile: projectsService.deleteFile.bind(projectsService),
    isProjectOverdue: projectsService.isProjectOverdue.bind(projectsService),
    isProjectAtRisk: projectsService.isProjectAtRisk.bind(projectsService),
    isTaskOverdue: projectsService.isTaskOverdue.bind(projectsService),
  };
}
