import React from 'react';
import { ChevronRight, Radio, Search } from 'lucide-react';
import { useBetting } from '../context/BettingContext';

export const HeroBanner: React.FC = () => {
  const { setDataFiltro, setAbaAtiva, totalAoVivo } = useBetting();

  const irParaJogos = (filtro: string) => {
    setDataFiltro(filtro);
    document.getElementById('lista-jogos')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative mb-4 rounded-xl overflow-hidden border border-[#1c2844] shadow-lg min-h-[180px] sm:min-h-[220px]">
      <img
        src="/banner.jpg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-center"
        fetchPriority="high"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#050a14]/70 via-[#0b1220]/45 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b1220]/50 via-transparent to-transparent sm:hidden" />

      <div className="relative z-10 px-4 py-5 sm:px-6 sm:py-7 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div className="min-w-0 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-300 drop-shadow">
              FUTBET · Só futebol
            </span>
            {totalAoVivo > 0 && (
              <span className="text-[10px] font-bold text-red-100 bg-red-600/90 border border-red-400/50 px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                {totalAoVivo} ao vivo
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white leading-snug drop-shadow-md">
            Brasileirão, Libertadores e Sul-Americana
          </h1>
          <p className="mt-2 text-sm text-gray-100 max-w-xl drop-shadow">
            Cadastre-se, monte o cupom e valide o bilhete com PIN após o PIX.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full lg:w-auto">
          <button
            type="button"
            onClick={() => irParaJogos('hoje')}
            className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-[#0a1628] font-bold text-sm px-4 py-2.5 shadow-md"
          >
            Jogos de hoje
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => irParaJogos('ao_vivo')}
            className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 rounded-lg bg-black/45 hover:bg-black/55 backdrop-blur-sm border border-red-500/45 text-white font-semibold text-sm px-4 py-2.5"
          >
            <Radio className="w-4 h-4 text-red-400" />
            Ao vivo
            {totalAoVivo > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-black px-1.5 rounded">{totalAoVivo}</span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setAbaAtiva('conferir')}
            className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 rounded-lg bg-black/45 hover:bg-black/55 backdrop-blur-sm border border-white/25 text-white font-semibold text-sm px-4 py-2.5"
          >
            <Search className="w-4 h-4 text-blue-200" />
            Conferir bilhete
          </button>
        </div>
      </div>
    </section>
  );
};
