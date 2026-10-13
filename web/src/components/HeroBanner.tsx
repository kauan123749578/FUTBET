import React from 'react';
import { ChevronRight, Radio, Search } from 'lucide-react';
import { useBetting } from '../context/BettingContext';

/** Banner: arte à direita; faixa inferior sólida evita texto sobre texto da imagem. */
export const HeroBanner: React.FC = () => {
  const { setDataFiltro, setAbaAtiva, totalAoVivo } = useBetting();

  const irParaJogos = (filtro: string) => {
    setDataFiltro(filtro);
    document.getElementById('lista-jogos')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="mb-4 rounded-xl overflow-hidden border border-[#1c2844] shadow-lg">
      <div className="relative h-[100px] sm:h-[120px] md:h-[140px]">
        <img
          src="/banner.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-[72%_center] sm:object-[78%_center]"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070A12] via-[#070A12]/88 to-[#070A12]/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1220] via-transparent to-transparent" />
      </div>

      <div className="bg-[#0b1220] border-t border-[#1a2744] px-3 py-3 sm:px-5 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          {totalAoVivo > 0 && (
            <span className="text-[10px] font-bold text-red-200 bg-red-950/80 border border-red-800/60 px-2 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
              {totalAoVivo} {totalAoVivo === 1 ? 'partida ao vivo' : 'partidas ao vivo'}
            </span>
          )}
          <p className="text-xs sm:text-sm text-gray-400">
            Escolha o jogo abaixo e monte seu cupom.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => irParaJogos('hoje')}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#2a3654] bg-[#151d30] hover:bg-[#1c2740] text-white font-semibold text-xs sm:text-sm px-3.5 py-2"
          >
            Jogos de hoje
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => irParaJogos('ao_vivo')}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-900/50 bg-[#151d30] hover:bg-[#1c2740] text-white font-semibold text-xs sm:text-sm px-3.5 py-2"
          >
            <Radio className="w-4 h-4 text-red-400" />
            Ao vivo
            {totalAoVivo > 0 && (
              <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 rounded min-w-[1.1rem]">{totalAoVivo}</span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setAbaAtiva('conferir')}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#2a3654] bg-[#151d30] hover:bg-[#1c2740] text-white font-semibold text-xs sm:text-sm px-3.5 py-2"
          >
            <Search className="w-4 h-4 text-gray-400" />
            Conferir bilhete
          </button>
        </div>
      </div>
    </section>
  );
};
