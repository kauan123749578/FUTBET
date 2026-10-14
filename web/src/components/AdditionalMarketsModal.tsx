import React, { useMemo, useState, useEffect } from 'react';
import { useBetting } from '../context/BettingContext';
import { X, Layers, Check, ChevronDown, ChevronUp, Search } from 'lucide-react';

export const AdditionalMarketsModal: React.FC = () => {
  const {
    jogoMercadosAberto: jogo,
    setJogoMercadosAberto,
    toggleSelecao,
    isOddSelecionada,
  } = useBetting();

  const [filtro, setFiltro] = useState('');
  const [abertos, setAbertos] = useState<Record<string, boolean>>({});

  const mercados = jogo?.mercadosAdicionais ?? [];
  const totalOpcoes = useMemo(
    () => mercados.reduce((acc, m) => acc + m.odds.length, 0),
    [mercados]
  );

  useEffect(() => {
    if (!jogo) return;
    setFiltro('');
    const init: Record<string, boolean> = {};
    jogo.mercadosAdicionais?.slice(0, 4).forEach(m => {
      init[m.id] = true;
    });
    setAbertos(init);
  }, [jogo?.id]);

  const mercadosFiltrados = useMemo(() => {
    const q = filtro.trim().toLowerCase();
    if (!q) return mercados;
    return mercados.filter(
      m =>
        m.nome.toLowerCase().includes(q) ||
        m.odds.some(o => o.rotulo.toLowerCase().includes(q))
    );
  }, [mercados, filtro]);

  if (!jogo) return null;

  const abrirTodos = () => {
    const all: Record<string, boolean> = {};
    mercados.forEach(m => {
      all[m.id] = true;
    });
    setAbertos(all);
  };

  const fecharTodos = () => setAbertos({});

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#0F1626] border border-[#1E2C48] sm:rounded-2xl rounded-t-2xl w-full max-w-3xl max-h-[92vh] sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="bg-[#001D6E] p-4 text-white flex items-start justify-between gap-3 border-b border-[#0D2D8F] shrink-0">
          <div className="flex items-start gap-2.5 min-w-0">
            <Layers className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] text-blue-200 uppercase tracking-widest font-bold truncate">
                  {jogo.campeonatoNome} • {jogo.dataHoraFormatada}
                </span>
                <span className="text-[9px] bg-emerald-950/80 text-emerald-300 border border-emerald-600/50 px-1.5 py-0.5 rounded font-bold">
                  BRT
                </span>
                <span className="text-[9px] bg-white/10 text-white px-1.5 py-0.5 rounded font-bold">
                  {mercados.length} mercados · {totalOpcoes || jogo.totalMercadosDisponiveis} opções
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black leading-snug mt-1">
                {jogo.mandante} <span className="text-yellow-400">vs</span> {jogo.visitante}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setJogoMercadosAberto(null)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white shrink-0"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-3 py-2.5 border-b border-[#1C2844] bg-[#0B101C] flex flex-col sm:flex-row gap-2 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={filtro}
              onChange={e => setFiltro(e.target.value)}
              placeholder="Filtro de mercados"
              className="w-full bg-[#141E33] border border-[#233354] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={abrirTodos}
              className="flex-1 sm:flex-none text-xs font-bold px-3 py-2 rounded-lg bg-[#00227B] hover:bg-[#003099] text-white border border-[#0A267A]"
            >
              + Abrir todos
            </button>
            <button
              type="button"
              onClick={fecharTodos}
              className="flex-1 sm:flex-none text-xs font-bold px-3 py-2 rounded-lg bg-[#141E33] hover:bg-[#1a2844] text-gray-300 border border-[#233354]"
            >
              − Fechar todos
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-3 space-y-2">
          {mercadosFiltrados.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-8">Nenhum mercado encontrado.</p>
          ) : (
            mercadosFiltrados.map(mercado => {
              const expandido = !!abertos[mercado.id];
              return (
                <div key={mercado.id} className="rounded-xl overflow-hidden border border-[#1F2E4F]">
                  <button
                    type="button"
                    onClick={() => setAbertos(prev => ({ ...prev, [mercado.id]: !expandido }))}
                    className="w-full flex items-center justify-between gap-2 bg-[#00227B] hover:bg-[#002a94] px-3.5 py-2.5 text-left transition-colors"
                  >
                    <span className="text-xs font-black text-white uppercase tracking-wide">{mercado.nome}</span>
                    <span className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-blue-200 font-mono">{mercado.odds.length} opções</span>
                      {expandido ? (
                        <ChevronUp className="w-4 h-4 text-white" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-white" />
                      )}
                    </span>
                  </button>

                  {expandido && (
                    <div className="bg-[#0B1220] divide-y divide-[#172238]">
                      {mercado.odds.map(odd => {
                        const isSel = isOddSelecionada(jogo.id, odd.rotulo, mercado.id);
                        return (
                          <button
                            key={odd.id}
                            type="button"
                            onClick={() =>
                              toggleSelecao({
                                jogoId: jogo.id,
                                jogoDescricao: `${jogo.mandante} x ${jogo.visitante}`,
                                mandante: jogo.mandante,
                                visitante: jogo.visitante,
                                campeonatoNome: jogo.campeonatoNome,
                                dataHoraFormatada: jogo.dataHoraFormatada,
                                mercadoId: mercado.id,
                                mercadoNome: mercado.nome,
                                palpiteRotulo: odd.rotulo,
                                oddValor: odd.valor,
                                statusPalpite: 'pendente',
                              })
                            }
                            className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-left transition-colors ${
                              isSel ? 'bg-yellow-400/15 hover:bg-yellow-400/20' : 'hover:bg-[#121a2e]'
                            }`}
                          >
                            <span className={`text-xs font-medium truncate ${isSel ? 'text-yellow-200' : 'text-gray-300'}`}>
                              {odd.rotulo}
                            </span>
                            <span className="flex items-center gap-2 shrink-0">
                              <span
                                className={`min-w-[3.25rem] text-center text-sm font-mono font-bold px-2 py-1 rounded-md border ${
                                  isSel
                                    ? 'bg-yellow-400 text-[#0a1628] border-yellow-300'
                                    : 'bg-[#161f30] text-amber-100 border-[#23334d]'
                                }`}
                              >
                                {odd.valor.toFixed(2)}
                              </span>
                              {isSel && <Check className="w-4 h-4 text-yellow-400" />}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="bg-[#0B101C] p-3 border-t border-[#1C2844] flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0 pb-[env(safe-area-inset-bottom)]">
          <span className="text-xs text-gray-400 text-center sm:text-left">
            Toque na cotação para adicionar ou remover do cupom
          </span>
          <button
            type="button"
            onClick={() => setJogoMercadosAberto(null)}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-2.5 rounded-lg"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
