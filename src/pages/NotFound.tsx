import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-bold text-2xl flex items-center justify-center border border-indigo-200 dark:border-indigo-900/50">
        404
      </div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
        Página não encontrada
      </h2>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
        O endereço buscado não existe ou foi movido dentro da plataforma HubTask.
      </p>
      <Link to="/dashboard">
        <Button variant="primary" leftIcon={<Home className="w-4 h-4" />}>
          Voltar para a Visão Geral
        </Button>
      </Link>
    </div>
  );
};
