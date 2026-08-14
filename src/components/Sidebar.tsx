import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  Calendar,
  Users,
  Settings,
  X,
  Layers,
  Sparkles,
  PlusCircle,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
  onOpenNewDemandModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  isCollapsed,
  onClose,
  onToggleCollapse,
  onOpenNewDemandModal,
}) => {
  const navItems = [
    {
      title: 'Visão Geral',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Demandas',
      path: '/demands',
      icon: CheckSquare,
      badge: '12',
    },
    {
      title: 'Projetos',
      path: '/projects',
      icon: FolderKanban,
      badge: '5',
    },
    {
      title: 'Agenda',
      path: '/calendar',
      icon: Calendar,
    },
    {
      title: 'Equipe',
      path: '/team',
      icon: Users,
    },
    {
      title: 'Configurações',
      path: '/settings',
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={cn(
          'fixed lg:static top-0 left-0 z-50 h-screen w-64 bg-brand-primary dark:bg-dark-base text-slate-100 flex flex-col border-r border-slate-800 transition-[width,transform] duration-200 ease-in-out shrink-0',
          isCollapsed && 'lg:w-20',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className={cn('flex items-center justify-between h-16 px-5 border-b border-slate-800', isCollapsed && 'lg:px-2')}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-tr from-brand-primary via-brand-secondary to-brand-accent flex items-center justify-center text-white shadow-md shadow-brand-secondary/20">
              <Layers className="w-5 h-5" />
            </div>
            <div className={cn(isCollapsed && 'lg:hidden')}>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-white">HubTask</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase tracking-widest">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Gestão & Demandas</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Fechar menu lateral"
            className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
            title={isCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
            className="hidden lg:inline-flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick Action Button */}
        <div className={cn('p-4 pb-2', isCollapsed && 'lg:px-3')}>
          <button
            onClick={() => {
              if (onOpenNewDemandModal) onOpenNewDemandModal();
              if (isOpen) onClose();
            }}
            aria-label="Nova Demanda"
            title={isCollapsed ? 'Nova Demanda' : undefined}
            className={cn('w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-brand-accent hover:bg-sky-600 text-white font-medium text-xs shadow-md shadow-brand-accent/25 transition-all cursor-pointer active:scale-98 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent', isCollapsed && 'lg:px-0')}
          >
            <PlusCircle className="w-4 h-4" />
            <span className={cn(isCollapsed && 'lg:hidden')}>Nova Demanda</span>
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 px-3 py-3 overflow-y-auto space-y-1">
          <div className={cn('px-3 pb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider', isCollapsed && 'lg:hidden')}>
            Menu Principal
          </div>

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              title={isCollapsed ? item.title : undefined}
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group',
                  isCollapsed && 'lg:justify-center lg:px-2',
                  isActive
                    ? 'bg-brand-accent/15 text-sky-400 font-semibold border-l-2 border-brand-accent pl-2.5'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <item.icon
                      className={cn(
                        'w-4 h-4 transition-colors',
                        isActive
                          ? 'text-sky-400'
                          : 'text-slate-400 group-hover:text-slate-200'
                      )}
                    />
                    <span className={cn(isCollapsed && 'lg:hidden')}>{item.title}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-[10px] font-bold',
                        isCollapsed && 'lg:hidden',
                        isActive
                          ? 'bg-brand-accent text-white'
                          : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Footer / System Status */}
        <div className={cn('p-4 border-t border-slate-800/80 bg-slate-950/40', isCollapsed && 'lg:px-3')}>
          <div className={cn('p-3 rounded-xl bg-slate-800/50 border border-slate-800 flex items-center justify-between', isCollapsed && 'lg:justify-center lg:p-2')}>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <div className={cn(isCollapsed && 'lg:hidden')}>
                <p className="text-[11px] font-semibold text-slate-200">HubTask v1.0.0</p>
                <p className="text-[10px] text-slate-400">Servidores Operacionais</p>
              </div>
            </div>
            <span className={cn('w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20', isCollapsed && 'lg:hidden')} />
          </div>
        </div>
      </aside>
    </>
  );
};
