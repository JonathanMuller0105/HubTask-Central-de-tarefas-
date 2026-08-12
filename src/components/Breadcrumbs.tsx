import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const routeNames: Record<string, string> = {
  dashboard: 'Visão Geral',
  demands: 'Demandas',
  projects: 'Projetos',
  calendar: 'Agenda',
  team: 'Equipe',
  settings: 'Configurações',
  login: 'Login',
};

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const currentRouteKey = pathnames[0] || 'dashboard';
  const pageTitle = routeNames[currentRouteKey] || 'HubTask';

  return (
    <div className="flex flex-col">
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <Link
          to="/dashboard"
          className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1"
        >
          <Home className="w-3.5 h-3.5" />
          <span>HubTask</span>
        </Link>

        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const label = routeNames[name] || name;

          return (
            <React.Fragment key={routeTo}>
              <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600" />
              {isLast ? (
                <span className="font-medium text-slate-800 dark:text-slate-200">{label}</span>
              ) : (
                <Link
                  to={routeTo}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {label}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </nav>
      <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-0.5">
        {pageTitle}
      </h1>
    </div>
  );
};
