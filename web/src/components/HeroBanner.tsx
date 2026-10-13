import React from 'react';
import { ChevronRight, Radio, Search } from 'lucide-react';
import { useBetting } from '../context/BettingContext';

export const HeroBanner: React.FC = () => {
  const { setDataFiltro, setAbaAtiva } = useBetting();

  const irParaJogos = (filtro: string) => {
    setDataFiltro(filtro);
    document.getElementById('lista-jogos')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="mb-4 rounded-xl border border-[#1c2844] bg-[#0b1220] overflow-hidden">
      <div className="px-4 py-5 sm:px-6 sm:py-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-400/90">
            FUTBET · Só futebol
          </p>
          <h1 className="mt-1.5 text-xl sm:text-2xl font-black text-white leading-snug">
            Odds reais · Brasileirão, Libertadores e Sul-Americana
          </h1>
          <p className="mt-2 text-sm text-gray-400 max-w-xl leading-relaxed">
            Crie sua conta para montar o cupom. Depois do PIX, valide o bilhete com o cambista usando o PIN.
          </p>
        </div>

        <div className="flex flex-col xs:flex-row flex-wrap gap-2 shrink-0 w-full lg:w-auto">
          <button
            type="button"
            onClick={() => irParaJogos('hoje')}
            className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-[#0a1628] font-bold text-sm px-4 py-2.5 transition-colors"
          >
            Jogos de hoje
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => irParaJogos('ao_vivo')}
            className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 rounded-lg bg-[#151d30] hover:bg-[#1c2740] border border-[#2a3654] text-white font-semibold text-sm px-4 py-2.5 transition-colors"
          >
            <Radio className="w-4 h-4 text-red-400" />
            Ao vivo
          </button>
          <button
            type="button"
            onClick={() => setAbaAtiva('conferir')}
            className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 rounded-lg bg-[#151d30] hover:bg-[#1c2740] border border-[#2a3654] text-white font-semibold text-sm px-4 py-2.5 transition-colors"
          >
            <Search className="w-4 h-4 text-blue-300" />
            Conferir bilhete
          </button>
        </div>
      </div>
    </section>
  );
};
