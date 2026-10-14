import React, { useState, useEffect, useMemo } from 'react';
import { useBetting } from '../context/BettingContext';
import { ApiService } from '../services/api';
import { Jogo } from '../types/betting';
import { Search, X, Radio, Plus, Calendar, Clock, MapPin } from 'lucide-react';

export const MatchTable: React.FC = () => {
  const {
    filtros,
    setDataFiltro,
    setTermoBusca,
    toggleSelecao,
    isOddSelecionada,
    setJogoMercadosAberto
  } = useBetting();

  const [jogos, setJogos] = useState<Jogo[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Busca jogos com base nos filtros
  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    ApiService.getJogos({
      idEsporte: filtros.idEsporte,
      idCampeonato: filtros.idCampeonato,
      pais: filtros.paisFiltro,
      filtro: filtros.dataFiltro,
      busca: filtros.termoBusca
    }).then(res => {
      if (ativo) {
        setJogos(res);
        setCarregando(false);
      }
    });

    return () => {
      ativo = false;
    };
  }, [filtros.idEsporte, filtros.idCampeonato, filtros.paisFiltro, filtros.dataFiltro, filtros.termoBusca]);

  // Filtra jogos para o painel de apostas: apenas jogos ativos (agendados ou ao vivo)
  const jogosAtivos = useMemo(() => {
    return jogos.filter(j => j.status !== 'finalizado');
  }, [jogos]);

  // Agrupa jogos por Campeonato e coloca SEMPRE o Brasil no topo
  const jogosPorCampeonato = useMemo(() => {
    const mapa = new Map<string, { idCampeonato: number; nome: string; pais: string; bandeira: string; jogos: Jogo[] }>();
    jogosAtivos.forEach(jogo => {
      const key = `${jogo.idCampeonato}_${jogo.campeonatoNome}`;
      if (!mapa.has(key)) {
        mapa.set(key, {
          idCampeonato: jogo.idCampeonato,
          nome: jogo.campeonatoNome,
          pais: jogo.pais || '',
          bandeira: jogo.bandeira,
          jogos: []
        });
      }
      mapa.get(key)!.jogos.push(jogo);
    });

    const grupos = Array.from(mapa.values());

    // Regra estrita: Brasil SEMPRE no topo absoluto!
    const getPrio = (idCamp: number, nome: string, pais: string) => {
      const n = (nome || '').toLowerCase();
      const p = (pais || '').toLowerCase();

      // Prioridade 0: Brasileirão Série A
      if (idCamp === 574584 || ((n.includes('série a') || n.includes('serie a')) && (n.includes('brasil') || p.includes('brasil')))) {
        return 0;
      }
      // Prioridade 1: Brasileirão Série B
      if (idCamp === 574585 || ((n.includes('série b') || n.includes('serie b')) && (n.includes('brasil') || p.includes('brasil')))) {
        return 1;
      }
      // Prioridade 2: Qualquer outro torneio do Brasil
      if (p.includes('brasil') || n.includes('brasil')) {
        return 2;
      }
      // Prioridade 3: Libertadores
      if (n.includes('libertadores')) {
        return 3;
      }
      // Prioridade 4: Copa Sul-Americana
      if (n.includes('sul-americana') || n.includes('sudamericana')) {
        return 4;
      }
      // Prioridade 5: Champions League
      if (n.includes('champions')) {
        return 5;
      }
      // Prioridade 6: Premier League
      if (n.includes('premier') || n.includes('inglaterra')) {
        return 6;
      }
      // Prioridade 7: La Liga
      if (n.includes('la liga') || n.includes('espanha')) {
        return 7;
      }
      // Prioridade 8: Serie A (Itália)
      if (n.includes('itália') || n.includes('italia')) {
        return 8;
      }
      // Prioridade 9: Bundesliga
      if (n.includes('bundesliga') || n.includes('alemanha')) {
        return 9;
      }
      return 20;
    };

    grupos.sort((a, b) => {
      const prioA = getPrio(a.idCampeonato, a.nome, a.pais);
      const prioB = getPrio(b.idCampeonato, b.nome, b.pais);
      if (prioA !== prioB) return prioA - prioB;
      return a.nome.localeCompare(b.nome);
    });

    // Ordena os jogos dentro do campeonato cronologicamente por horário
    grupos.forEach(g => {
      g.jogos.sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime());
    });

    return grupos;
  }, [jogos]);

  return (
    <div className="space-y-4">
      {/* Search Bar & Header Area (Matching user photo) */}
      <div className="bg-[#0D1424] border border-[#1B2742] rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-3 shadow">
        {/* Title & Count */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-sm font-black text-white flex items-center gap-2">
                <span>Jogos Disponíveis</span>
                <span className="bg-[#00227B] text-yellow-400 px-2 py-0.5 rounded text-xs font-mono font-bold">
                  ({jogosAtivos.length})
                </span>
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-600/50 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ⏰ Horário de Brasília (BRT)
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              Terminal de Cotações 1X2 e Mercados Especiais • Brasil no Topo
            </p>
          </div>
        </div>

        {/* Search input field */}
        <div className="w-full md:w-80 relative">
          <input
            type="text"
            placeholder="Buscar jogos, times ou campeonatos..."
            value={filtros.termoBusca || ''}
            onChange={e => setTermoBusca(e.target.value)}
            className="w-full bg-[#070B13] border border-[#1E2B4A] rounded-lg pl-9 pr-8 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5 pointer-events-none" />
          {filtros.termoBusca && (
            <button
              onClick={() => setTermoBusca('')}
              className="absolute right-2.5 top-2.5 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Filters Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setDataFiltro('todos')}
          className={`px-3 py-1.5 rounded-md font-bold whitespace-nowrap transition-colors ${
            filtros.dataFiltro === 'todos'
              ? 'bg-[#00227B] text-yellow-400 border border-blue-500/50'
              : 'bg-[#0E1526] text-gray-300 hover:text-white hover:bg-[#152038]'
          }`}
        >
          Todos os Jogos ({jogosAtivos.length})
        </button>

        <button
          onClick={() => setDataFiltro('ao_vivo')}
          className={`px-3 py-1.5 rounded-md font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            filtros.dataFiltro === 'ao_vivo'
              ? 'bg-red-900/90 text-red-200 border border-red-600'
              : 'bg-[#0E1526] text-gray-300 hover:text-white hover:bg-[#152038]'
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
          <span>Ao Vivo</span>
        </button>

        <button
          onClick={() => setDataFiltro('hoje')}
          className={`px-3 py-1.5 rounded-md font-bold whitespace-nowrap transition-colors ${
            filtros.dataFiltro === 'hoje'
              ? 'bg-[#00227B] text-yellow-400 border border-blue-500/50'
              : 'bg-[#0E1526] text-gray-300 hover:text-white hover:bg-[#152038]'
          }`}
        >
          Hoje
        </button>

        <button
          onClick={() => setDataFiltro('semana')}
          className={`px-3 py-1.5 rounded-md font-bold whitespace-nowrap transition-colors ${
            filtros.dataFiltro === 'semana'
              ? 'bg-[#00227B] text-yellow-400 border border-blue-500/50'
              : 'bg-[#0E1526] text-gray-300 hover:text-white hover:bg-[#152038]'
          }`}
        >
          Próximos Dias
        </button>
      </div>

      {/* Loading state */}
      {carregando && (
        <div className="p-12 text-center text-gray-400 bg-[#0E1526] rounded-xl border border-[#1A253D]">
          <div className="inline-block w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-xs font-semibold">Atualizando cotações do terminal...</p>
        </div>
      )}

      {/* Empty State */}
      {!carregando && jogos.length === 0 && (
        <div className="p-10 text-center text-gray-400 bg-[#0E1526] rounded-xl border border-[#1A253D] space-y-3">
          {filtros.dataFiltro === 'ao_vivo' ? (
            <>
              <div className="w-12 h-12 rounded-full bg-blue-950/60 border border-blue-800/60 flex items-center justify-center mx-auto text-xl">
                ⏳
              </div>
              <p className="text-sm font-bold text-gray-200">Nenhuma partida ao vivo no momento (madrugada)</p>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                No Brasil e nas principais ligas mundiais não há partidas profissionais na madrugada. As partidas de hoje começam a partir das 11:45 e 16:00 (Palmeiras x Corinthians às 17:30)!
              </p>
              <button
                onClick={() => setDataFiltro('hoje')}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Ver Jogos de Hoje
              </button>
            </>
          ) : (
            <>
              <p className="text-sm font-bold text-gray-300">Nenhuma partida encontrada para este filtro.</p>
              <p className="text-xs text-gray-500">Tente buscar por outro time ou selecione "Todos os Jogos".</p>
              <button
                onClick={() => {
                  setDataFiltro('todos');
                  setTermoBusca('');
                }}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-bold"
              >
                Limpar Filtros
              </button>
            </>
          )}
        </div>
      )}

      {/* Dense High-Density Match Groups (Style of escanteiobet/terminal) */}
      {!carregando && jogosPorCampeonato.map(grupo => (
        <div 
          key={grupo.nome} 
          className="rounded-xl overflow-hidden border border-[#19243C] bg-[#0E1526] shadow-md mb-4"
        >
          {/* Championship Category Header (Navy Banner) */}
          <div className="bg-[#001D6E] px-4 py-2.5 flex items-center justify-between text-white border-b border-[#0D2D8F]">
            <div className="flex items-center gap-2 font-black text-xs sm:text-sm tracking-wide">
              <span className="text-base">{grupo.bandeira}</span>
              <span>{grupo.nome}</span>
              {(grupo.pais === 'Brasil' || grupo.nome.toLowerCase().includes('brasil')) && (
                <span className="ml-2 text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                  <span>🇧🇷</span>
                  <span>BRASIL NO TOPO</span>
                </span>
              )}
            </div>

            {/* Odds Column Labels Header for Desktop */}
            <div className="hidden sm:flex items-center gap-2 text-[11px] font-bold text-blue-200">
              <span className="w-16 text-center">Casa</span>
              <span className="w-16 text-center">Empate</span>
              <span className="w-16 text-center">Fora</span>
              <span className="w-16 text-center">Mais</span>
            </div>
          </div>

          {/* Matches List */}
          <div className="divide-y divide-[#172238]">
            {grupo.jogos.map(jogo => {
              const casaOdd = jogo.mercadoPrincipal.casa;
              const empateOdd = jogo.mercadoPrincipal.empate;
              const foraOdd = jogo.mercadoPrincipal.fora;

              const isCasaSel = isOddSelecionada(jogo.id, casaOdd.rotulo);
              const isEmpateSel = isOddSelecionada(jogo.id, empateOdd.rotulo);
              const isForaSel = isOddSelecionada(jogo.id, foraOdd.rotulo);

              return (
                <div
                  key={jogo.id}
                  className="p-3 sm:px-4 sm:py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#121B30] transition-colors"
                >
                  {/* Match Info: Date/Time + Teams + Status */}
                  <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                    {/* Date / Time */}
                    <div className="text-center shrink-0 w-20">
                      <div className="text-[11px] font-mono font-bold text-gray-200">
                        {jogo.dataHoraFormatada}
                      </div>
                      {jogo.status === 'ao_vivo' ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black text-red-400 bg-red-950/80 px-1 rounded border border-red-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                          AO VIVO
                        </span>
                      ) : (
                        <div className="text-[10px] text-emerald-400/90 font-semibold flex items-center justify-center gap-1 mt-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          <span>BRT</span>
                        </div>
                      )}
                    </div>

                    {/* Confronto (Teams & Scores) */}
                    <div className="flex-1 min-w-0 space-y-1">
                      {/* Mandante */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 truncate">
                          {jogo.mandanteEscudo ? (
                            <img
                              src={jogo.mandanteEscudo}
                              alt={jogo.mandante}
                              className="w-5 h-5 object-contain shrink-0 rounded-sm bg-white/5"
                              loading="lazy"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <span className="text-xs">⚽</span>
                          )}
                          <span className="text-xs sm:text-sm font-bold text-gray-100 truncate">
                            {jogo.mandante}
                          </span>
                        </div>
                        {jogo.status === 'ao_vivo' && (
                          <span className="font-mono font-black text-xs text-yellow-400 px-1 bg-black/40 rounded">
                            {jogo.placarMandante ?? 0}
                          </span>
                        )}
                      </div>

                      {/* Visitante */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 truncate">
                          {jogo.visitanteEscudo ? (
                            <img
                              src={jogo.visitanteEscudo}
                              alt={jogo.visitante}
                              className="w-5 h-5 object-contain shrink-0 rounded-sm bg-white/5"
                              loading="lazy"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <span className="text-xs">⚽</span>
                          )}
                          <span className="text-xs sm:text-sm font-bold text-gray-100 truncate">
                            {jogo.visitante}
                          </span>
                        </div>
                        {jogo.status === 'ao_vivo' && (
                          <span className="font-mono font-black text-xs text-yellow-400 px-1 bg-black/40 rounded">
                            {jogo.placarVisitante ?? 0}
                          </span>
                        )}
                      </div>

                      {/* Stadium */}
                      <div className="flex items-center gap-1 text-[10px] text-gray-500">
                        <MapPin className="w-2.5 h-2.5 text-gray-500" />
                        <span className="truncate">{jogo.estadio}</span>
                      </div>
                    </div>
                  </div>

                  {/* Odds Buttons (Casa, Empate, Fora, +X Mercados) */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    {/* Casa Odd */}
                    <button
                      onClick={() =>
                        toggleSelecao({
                          jogoId: jogo.id,
                          jogoDescricao: `${jogo.mandante} x ${jogo.visitante}`,
                          mandante: jogo.mandante,
                          visitante: jogo.visitante,
                          campeonatoNome: jogo.campeonatoNome,
                          dataHoraFormatada: jogo.dataHoraFormatada,
                          mercadoId: '1x2',
                          mercadoNome: 'Resultado Final (1X2)',
                          palpiteRotulo: casaOdd.rotulo,
                          oddValor: casaOdd.valor,
                          statusPalpite: 'pendente'
                        })
                      }
                      className={`w-[4.25rem] h-11 rounded-lg flex flex-col items-center justify-center font-mono transition-all ${
                        isCasaSel
                          ? 'bg-yellow-400 text-[#0a1628] ring-2 ring-yellow-300 scale-[1.02]'
                          : 'bg-[#161f30] hover:bg-[#1c2838] border border-[#23334d] hover:border-[#3d5278]'
                      }`}
                      title={`Apostar em ${casaOdd.rotulo}`}
                    >
                      <span className="text-[9px] uppercase tracking-wider text-gray-400 font-sans font-semibold">
                        {isCasaSel ? '✓ Mandante' : '1 (Casa)'}
                      </span>
                      <span className={`text-sm font-bold ${isCasaSel ? 'text-[#0a1628]' : 'text-amber-100'}`}>
                        {casaOdd.valor.toFixed(2)}
                      </span>
                    </button>

                    {/* Empate Odd */}
                    <button
                      onClick={() =>
                        toggleSelecao({
                          jogoId: jogo.id,
                          jogoDescricao: `${jogo.mandante} x ${jogo.visitante}`,
                          mandante: jogo.mandante,
                          visitante: jogo.visitante,
                          campeonatoNome: jogo.campeonatoNome,
                          dataHoraFormatada: jogo.dataHoraFormatada,
                          mercadoId: '1x2',
                          mercadoNome: 'Resultado Final (1X2)',
                          palpiteRotulo: empateOdd.rotulo,
                          oddValor: empateOdd.valor,
                          statusPalpite: 'pendente'
                        })
                      }
                      className={`w-[4.25rem] h-11 rounded-lg flex flex-col items-center justify-center font-mono transition-all ${
                        isEmpateSel
                          ? 'bg-yellow-400 text-[#0a1628] ring-2 ring-yellow-300 scale-[1.02]'
                          : 'bg-[#161f30] hover:bg-[#1c2838] border border-[#23334d] hover:border-[#3d5278]'
                      }`}
                      title="Apostar no Empate"
                    >
                      <span className="text-[9px] uppercase tracking-wider text-gray-400 font-sans font-semibold">
                        {isEmpateSel ? '✓ Empate' : 'X (Empate)'}
                      </span>
                      <span className={`text-sm font-bold ${isEmpateSel ? 'text-[#0a1628]' : 'text-amber-100'}`}>
                        {empateOdd.valor.toFixed(2)}
                      </span>
                    </button>

                    {/* Fora Odd */}
                    <button
                      onClick={() =>
                        toggleSelecao({
                          jogoId: jogo.id,
                          jogoDescricao: `${jogo.mandante} x ${jogo.visitante}`,
                          mandante: jogo.mandante,
                          visitante: jogo.visitante,
                          campeonatoNome: jogo.campeonatoNome,
                          dataHoraFormatada: jogo.dataHoraFormatada,
                          mercadoId: '1x2',
                          mercadoNome: 'Resultado Final (1X2)',
                          palpiteRotulo: foraOdd.rotulo,
                          oddValor: foraOdd.valor,
                          statusPalpite: 'pendente'
                        })
                      }
                      className={`w-[4.25rem] h-11 rounded-lg flex flex-col items-center justify-center font-mono transition-all ${
                        isForaSel
                          ? 'bg-yellow-400 text-[#0a1628] ring-2 ring-yellow-300 scale-[1.02]'
                          : 'bg-[#161f30] hover:bg-[#1c2838] border border-[#23334d] hover:border-[#3d5278]'
                      }`}
                      title={`Apostar em ${foraOdd.rotulo}`}
                    >
                      <span className="text-[9px] uppercase tracking-wider text-gray-400 font-sans font-semibold">
                        {isForaSel ? '✓ Visitante' : '2 (Fora)'}
                      </span>
                      <span className={`text-sm font-bold ${isForaSel ? 'text-[#0a1628]' : 'text-amber-100'}`}>
                        {foraOdd.valor.toFixed(2)}
                      </span>
                    </button>

                    <button
                      onClick={() => setJogoMercadosAberto(jogo)}
                      className="w-[4.25rem] h-11 rounded-lg bg-[#121a2e] hover:bg-[#1a2438] text-gray-300 font-mono text-xs flex flex-col items-center justify-center transition-colors border border-[#2a3654]"
                      title="Ver todos os mercados adicionais (Gols, Ambas Marcam, Escanteios)"
                    >
                      <span className="flex items-center gap-0.5">
                        <Plus className="w-3 h-3" />
                        <span>
                          {jogo.totalMercadosDisponiveis ||
                            jogo.mercadosAdicionais?.reduce((n, m) => n + m.odds.length, 0) ||
                            0}
                        </span>
                      </span>
                      <span className="text-[8px] uppercase tracking-tighter text-gray-500">
                        Mercados
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
