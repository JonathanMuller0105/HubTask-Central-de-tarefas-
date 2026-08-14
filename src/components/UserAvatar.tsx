import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, Settings, HelpCircle, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWorkspacePreferences } from '../hooks/useWorkspacePreferences';

export const UserAvatar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { profile } = useWorkspacePreferences();
  const initials = profile.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'U';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none cursor-pointer"
      >
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-semibold text-xs flex items-center justify-center ring-2 ring-indigo-500/20 overflow-hidden">
            {profile.photo ? (
              <img src={profile.photo} alt="" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
        </div>
        <div className="hidden md:flex flex-col text-left pr-1">
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-none">
            {profile.name}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            {profile.department}
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg py-2 z-50 divide-y divide-slate-100 dark:divide-slate-800">
          <div className="px-4 py-2">
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              {profile.name}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {profile.email}
            </p>
            <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              <Shield className="w-2.5 h-2.5" /> Administrador
            </span>
          </div>

          <div className="py-1">
            <button
              onClick={() => {
                navigate('/settings');
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-xs flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              Configurações da Conta
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-xs flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-slate-400" />
              Suporte & Documentação
            </button>
          </div>

          <div className="py-1">
            <button
              onClick={() => {
                navigate('/login');
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-xs flex items-center gap-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer font-medium"
            >
              <LogOut className="w-4 h-4" />
              Sair do HubTask
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
