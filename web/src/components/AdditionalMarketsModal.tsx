import React, { useMemo, useState, useEffect } from 'react';
import { useBetting } from '../context/BettingContext';
import { X, Check, ChevronDown, ChevronUp, Search } from 'lucide-react';

function formatOddBr(val: number): string {
  return val.toFixed(2).replace('.', ',');
}

function parseHorarioData(jogo: {
  dataHoraFormatada: string;
  dataIso?: string;
  dataHora?: string;
}): { hora: string; dataPill: string } {
  const parts = jogo.dataHoraFormatada.trim().split(/\s+/);
  const hora = parts.length > 1 ? parts[parts.length - 1] : parts[0] || '—';
  const curto = parts[0] || '';

  if (jogo.dataIso) {
    const [y, mo, d] = jogo.dataIso.split('-').map(Number);
    if (y && mo && d) {
      const meses = [
        'janeiro',
        'fevereiro',
        'março',
        'abril',
        'maio',
        'junho',
        'julho',
        'agosto',
        'setembro',
        'outubro',
        'novembro',
        'dezembro',
      ];
      return { hora, dataPill: `${d}/${meses[mo - 1]}/${y}` };
    }
  }

  if (jogo.dataHora) {
    const dt = new Date(jogo.dataHora);
    if (!Number.isNaN(dt.getTime())) {
      const meses = [
        'janeiro',
        'fevereiro',
        'março',
        'abril',
        'maio',
        'junho',
        'julho',
        'agosto',
        'setembro',
        'outubro',
        'novembro',
        'dezembro',
      ];
      return {
        hora,
        dataPill: `${dt.getDate()}/${meses[dt.getMonth()]}/${dt.getFullYear()}`,
      };
    }
  }

  return { hora, dataPill: curto || '—' };
}

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

  const { hora, dataPill } = useMemo(
    () => (jogo ? parseHorarioData(jogo) : { hora: '—', dataPill: '—' }),
    [jogo]
  );

  useEffect(() => {
    if (!jogo) return;
    setFiltro('');
    const init: Record<string, boolean> = {};
    jogo.mercadosAdicionais?.forEach(m => {
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-stretch justify-center p-0">
      <div className="bg-[#ececec] w-full max-w-4xl sm:my-2 sm:mx-4 sm:rounded-xl max-h-[96vh] sm:max-h-[calc(100vh-1rem)] flex flex-col shadow-2xl overflow-hidden border border-[#ccc]">
        <div className="relative shrink-0 min-h-[168px] sm:min-h-[180px] bg-gradient-to-b from-[#3d8c3a] via-[#2d6b2a] to-[#1e4d1c] overflow-hidden">
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                'repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(0,0,0,0.08) 40px, rgba(0,0,0,0.08) 42px)',
            }}
          />
          <button
            type="button"
            onClick={() => setJogoMercadosAberto(null)}
            className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/40 hover:bg-black/55 text-white"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative z-10 flex flex-col items-center justify-center px-4 pt-6 pb-5">
            <div className="flex items-center gap-2 text-white/95 text-xs font-bold uppercase tracking-wide mb-3">
              <span className="text-lg leading-none">{jogo.bandeira || '🏆'}</span>
              <span className="truncate max-w-[280px] sm:max-w-none text-center">{jogo.campeonatoNome}</span>
            </div>

            <div className="w-full max-w-lg bg-[#3a3a3a]/92 rounded-2xl px-4 py-4 shadow-xl border border-white/10">
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
                <div className="flex flex-col items-center gap-1.5 min-w-0">
                  {jogo.mandanteEscudo ? (
                    <img
                      src={jogo.mandanteEscudo}
                      alt=""
                      className="w-11 h-11 sm:w-12 sm:h-12 object-contain drop-shadow"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-white/20" />
                  )}
                  <span className="text-white text-[10px] sm:text-xs font-bold text-center leading-tight line-clamp-2">
                    {jogo.mandante}
                  </span>
                </div>

                <div className="flex flex-col items-center px-1">
                  <span className="text-2xl sm:text-3xl font-black text-white tabular-nums">{hora}</span>
                </div>

                <div className="flex flex-col items-center gap-1.5 min-w-0">
                  {jogo.visitanteEscudo ? (
                    <img
                      src={jogo.visitanteEscudo}
                      alt=""
                      className="w-11 h-11 sm:w-12 sm:h-12 object-contain drop-shadow"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-white/20" />
                  )}
                  <span className="text-white text-[10px] sm:text-xs font-bold text-center leading-tight line-clamp-2">
                    {jogo.visitante}
                  </span>
                </div>
              </div>

              <div className="flex justify-center mt-3">
                <span className="text-[11px] font-bold text-white bg-black/35 px-3 py-1 rounded-md">
                  {dataPill}
                </span>
              </div>
            </div>

            <p className="text-[10px] text-white/80 mt-2 font-medium">
              {mercados.length} mercados · {totalOpcoes || jogo.totalMercadosDisponiveis} opções de aposta
            </p>
          </div>
        </div>

        <div className="px-3 py-2.5 border-b border-[#ccc] bg-white flex flex-col sm:flex-row gap-2 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={filtro}
              onChange={e => setFiltro(e.target.value)}
              placeholder="Filtro de Mercados"
              className="w-full bg-[#f5f5f5] border border-[#ccc] rounded-lg pl-9 pr-3 py-2 text-xs text-gray-800 placeholder-gray-500 focus:outline-none focus:border-[#00227B]"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={abrirTodos}
              className="flex-1 sm:flex-none text-xs font-bold px-3 py-2 rounded-lg bg-[#00227B] hover:bg-[#003099] text-white"
            >
              + Abrir todos
            </button>
            <button
              type="button"
              onClick={fecharTodos}
              className="flex-1 sm:flex-none text-xs font-bold px-3 py-2 rounded-lg bg-[#555] hover:bg-[#444] text-white"
            >
              − Fechar todos
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-2 sm:p-3 space-y-1.5 bg-[#ececec]">
          {mercadosFiltrados.length === 0 ? (
            <p className="text-center text-sm text-gray-600 py-8">Nenhum mercado encontrado.</p>
          ) : (
            mercadosFiltrados.map(mercado => {
              const expandido = !!abertos[mercado.id];
              const gridMercado =
                mercado.odds.length > 12 || mercado.nome.toLowerCase().includes('resultado exato');

              return (
                <div key={mercado.id} className="rounded overflow-hidden border border-[#b8b8b8] shadow-sm">
                  <button
                    type="button"
                    onClick={() => setAbertos(prev => ({ ...prev, [mercado.id]: !expandido }))}
                    className="w-full flex items-center justify-between gap-2 bg-[#00227B] hover:bg-[#002a94] px-3.5 py-2.5 text-left transition-colors"
                  >
                    <span className="text-xs font-black text-white uppercase tracking-wide pr-2">{mercado.nome}</span>
                    <span className="flex items-center gap-2 shrink-0">
                      {expandido ? (
                        <ChevronUp className="w-4 h-4 text-white" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-white" />
                      )}
                    </span>
                  </button>

                  {expandido && (
                    <div className="bg-white">
                      <div
                        className={
                          gridMercado
                            ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-px bg-[#ddd]'
                            : 'divide-y divide-[#e0e0e0]'
                        }
                      >
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
                              className={`flex items-center justify-between gap-2 px-3 py-2 text-left transition-colors min-h-[40px] ${
                                gridMercado ? 'bg-white hover:bg-[#f0f4ff]' : 'w-full hover:bg-[#f5f5f5]'
                              } ${isSel ? 'bg-yellow-50 ring-1 ring-inset ring-yellow-400' : ''}`}
                            >
                              <span
                                className={`text-[11px] font-medium leading-snug ${isSel ? 'text-[#1a1a1a]' : 'text-gray-700'} ${
                                  gridMercado ? 'line-clamp-2' : 'truncate flex-1'
                                }`}
                              >
                                {odd.rotulo}
                              </span>
                              <span className="flex items-center gap-1 shrink-0">
                                <span
                                  className={`min-w-[2.75rem] text-center text-xs font-mono font-bold px-1.5 py-1 rounded border ${
                                    isSel
                                      ? 'bg-[#333] text-white border-[#222]'
                                      : 'bg-[#4a4a4a] text-white border-[#333]'
                                  }`}
                                >
                                  {formatOddBr(odd.valor)}
                                </span>
                                {isSel && <Check className="w-3.5 h-3.5 text-yellow-600" />}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="bg-white p-3 border-t border-[#ccc] flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0 pb-[env(safe-area-inset-bottom)]">
          <span className="text-xs text-gray-600 text-center sm:text-left">
            Toque na cotação para adicionar ou remover do cupom
          </span>
          <button
            type="button"
            onClick={() => setJogoMercadosAberto(null)}
            className="w-full sm:w-auto bg-[#00227B] hover:bg-[#003099] text-white font-bold text-xs px-5 py-2.5 rounded-lg"
          >
            Voltar aos jogos
          </button>
        </div>
      </div>
    </div>
  );
};
