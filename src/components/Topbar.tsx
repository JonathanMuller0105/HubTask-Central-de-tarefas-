import React from 'react';
import { Menu, Search, Bell, Shield, User as UserIcon } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { UserAvatar } from './UserAvatar';
import { Breadcrumbs } from './Breadcrumbs';
import { useUserRole } from '../context/UserRoleContext';

interface TopbarProps {
  onToggleSidebar: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar }) => {
  const { role, toggleRole, isManager } = useUserRole();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Abrir Menu Lateral"
          className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Breadcrumbs />
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Role Switcher Pill */}
        <button
          onClick={toggleRole}
          title={`Alternar Visão: Atual (${isManager ? 'Gestor' : 'Membro'}). Clique para alternar.`}
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border ${
            isManager
              ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/60 hover:bg-indigo-100'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60 hover:bg-emerald-100'
          }`}
        >
          {isManager ? (
            <>
              <Shield className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Visão Gestor</span>
            </>
          ) : (
            <>
              <UserIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Visão Membro</span>
            </>
          )}
        </button>

        {/* Search Input */}
        <div className="relative hidden md:flex items-center w-56 lg:w-72">
          <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar projetos, tarefas... (Ctrl + K)"
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100/70 dark:bg-slate-800/60 border border-transparent focus:border-brand-accent focus:bg-white dark:focus:bg-slate-900 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none transition-all"
          />
        </div>

        {/* Notifications */}
        <button
          aria-label="Notificações"
          className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Notificações"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-accent ring-2 ring-white dark:ring-slate-900" />
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />

        <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-800 mx-0.5" />

        {/* User Avatar */}
        <UserAvatar />
      </div>
    </header>
  );
};

