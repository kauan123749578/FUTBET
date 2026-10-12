import React from 'react';
import { CambistaTerminalView } from './CambistaTerminalView';
import { ArrowLeft, Briefcase, RefreshCw, LogOut } from 'lucide-react';
import { useBetting } from '../context/BettingContext';

interface Props {
  onVoltarSimulador: () => void;
}

export const CambistaPainelView: React.FC<Props> = ({ onVoltarSimulador }) => {
  const { sessaoOperador, logoutOperador } = useBetting();

  return (
    <div className="min-h-screen bg-[#070A12] text-gray-100 flex flex-col font-sans">
      {/* Top Header do Cambista */}
      <header className="bg-[#001D6E] border-b border-[#0D2D8F] text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-[1920px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onVoltarSimulador}
              className="flex items-center gap-2 bg-[#001552] hover:bg-[#00288E] border border-[#0A267A] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow"
            >
              <ArrowLeft className="w-4 h-4 text-yellow-400" />
              <span>Voltar às Apostas</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-black text-white">
                  Painel do Cambista
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs text-blue-200">
                  Operador: <strong className="text-yellow-300">{sessaoOperador?.nome || 'Operador Credenciado'}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={logoutOperador}
              className="flex items-center gap-1.5 bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-[1920px] w-full mx-auto p-3 sm:p-6 flex-1 overflow-y-auto">
        <CambistaTerminalView />
      </main>
    </div>
  );
};
