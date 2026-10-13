import React from 'react';
import { ChevronRight, Radio, Search } from 'lucide-react';
import { useBetting } from '../context/BettingContext';

/** Só a arte em cima (sem texto HTML); ações na faixa escura embaixo. */
export const HeroBanner: React.FC = () => {
  const { setDataFiltro, setAbaAtiva, totalAoVivo } = useBetting();

  const irParaJogos = (filtro: string) => {
    setDataFiltro(filtro);
    document.getElementById('lista-jogos')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="mb-4 rounded-xl overflow-hidden border border-[#1c2844] shadow-lg">
      <div className="relative h-[140px] sm:h-[180px] md:h-[200px]">
        <img
          src="/banner.jpg"
          alt="FUTBET"
          className="absolute inset-0 w-full h-full object-cover object-center brightness-[1.05] contrast-[1.05]"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1220]/40 via-transparent to-transparent pointer-events-none" />
      </div>

      <div className="bg-[#0b1220] border-t border-[#1a2744] px-3 py-3 sm:px-5 sm:py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {totalAoVivo > 0 ? (
          <span className="text-[11px] font-bold text-red-200 bg-red-950/60 border border-red-800/50 px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
            {totalAoVivo} {totalAoVivo === 1 ? 'partida ao vivo' : 'partidas ao vivo'}
          </span>
        ) : (
          <span className="text-xs text-gray-500 hidden sm:block">Monte seu cupom nos jogos abaixo</span>
        )}

        <div className="flex flex-wrap gap-2 sm:ml-auto">
          <button
            type="button"
            onClick={() => irParaJogos('hoje')}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-[#0a1628] font-bold text-sm px-4 py-2"
          >
            Jogos de hoje
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => irParaJogos('ao_vivo')}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-800/60 bg-[#151d30] hover:bg-[#1c2740] text-white font-semibold text-sm px-4 py-2"
          >
            <Radio className="w-4 h-4 text-red-400" />
            Ao vivo
            {totalAoVivo > 0 && (
              <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 rounded">{totalAoVivo}</span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setAbaAtiva('conferir')}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#2a3654] bg-[#151d30] hover:bg-[#1c2740] text-white font-semibold text-sm px-4 py-2"
          >
            <Search className="w-4 h-4 text-gray-400" />
            Conferir bilhete
          </button>
        </div>
      </div>
    </section>
  );
};
