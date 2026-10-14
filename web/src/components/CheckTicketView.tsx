import React, { useState, useEffect } from 'react';
import { ApiService, bilheteAdminParaFrontend } from '../services/api';
import { Bilhete } from '../types/betting';
import { useBetting } from '../context/BettingContext';
import { Search, ShieldAlert, CheckCircle, Clock, Trophy, Ticket } from 'lucide-react';
import { ClienteMinhasApostas } from './ClienteMinhasApostas';
import { mapStatusBilheteApi } from '../utils/whatsappBilhete';


export const CheckTicketView: React.FC = () => {
  const { abrirModalComBilhete, sessaoCliente } = useBetting();
  const [codigoInput, setCodigoInput] = useState('');
  const [bilheteEncontrado, setBilheteEncontrado] = useState<Bilhete | null>(null);
  const [buscado, setBuscado] = useState(false);
  const [carregando, setCarregando] = useState(false);

  // Se tiver um código pré-selecionado da busca rápida na sidebar
  useEffect(() => {
    const salvo = sessionStorage.getItem('radar_bet_codigo_pesquisa');
    if (salvo) {
      setCodigoInput(salvo);
      sessionStorage.removeItem('radar_bet_codigo_pesquisa');
      pesquisarCodigo(salvo);
    }
  }, []);

  const pesquisarCodigo = async (codigo: string) => {
    if (!codigo.trim()) return;
    setCarregando(true);
    setBuscado(true);
    try {
      const res = await ApiService.getBilhetePorCodigo(codigo);
      if (res) {
        const bAdaptado = bilheteAdminParaFrontend(res);
        bAdaptado.status = mapStatusBilheteApi(res.status);
        setBilheteEncontrado(bAdaptado);
      } else {
        setBilheteEncontrado(null);
      }
    } finally {
      setCarregando(false);
    }
  };

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    pesquisarCodigo(codigoInput);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {sessaoCliente && <ClienteMinhasApostas />}

      {/* Header */}
      <div className="bg-[#0E1526] border border-[#1B2742] rounded-2xl p-6 text-center space-y-3 shadow-lg">
        <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 mx-auto">
          <Search className="w-6 h-6" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white">
          Conferir Bilhete de Aposta
        </h2>
        <p className="text-xs sm:text-sm text-gray-400 max-w-lg mx-auto">
          Digite o código de 7 caracteres do seu bilhete (ex: <span className="font-mono text-yellow-400 font-bold">A9X-4821</span>) para consultar os palpites e o status oficial de validação e premiação.
        </p>

        {/* Form */}
        <form onSubmit={handleBuscar} className="max-w-md mx-auto flex gap-2 pt-2">
          <input
            type="text"
            placeholder="Digite o código (ex: A9X-4821)"
            value={codigoInput}
            onChange={e => setCodigoInput(e.target.value.toUpperCase())}
            className="flex-1 bg-[#070B13] border border-[#233352] rounded-xl px-4 py-3 text-sm font-mono font-bold text-white placeholder-gray-500 uppercase focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={carregando || !codigoInput.trim()}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase px-5 py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            {carregando ? 'Buscando...' : 'Consultar'}
          </button>
        </form>

        {/* Quick test pills */}
        <div className="flex items-center justify-center gap-2 pt-2 text-xs text-gray-400">
          <span>Bilhetes de Teste:</span>
          <button
            onClick={() => {
              setCodigoInput('A9X-4821');
              pesquisarCodigo('A9X-4821');
            }}
            className="font-mono text-yellow-400 hover:underline"
          >
            A9X-4821 (Pendente)
          </button>
          <span>•</span>
          <button
            onClick={() => {
              setCodigoInput('B7K-9012');
              pesquisarCodigo('B7K-9012');
            }}
            className="font-mono text-emerald-400 hover:underline"
          >
            B7K-9012 (Validado)
          </button>
        </div>
      </div>

      {/* Result Card */}
      {buscado && !bilheteEncontrado && !carregando && (
        <div className="bg-[#141C2E] border border-red-900/40 rounded-xl p-8 text-center text-gray-400 space-y-2">
          <ShieldAlert className="w-10 h-10 text-red-400 mx-auto mb-2" />
          <h3 className="text-base font-bold text-gray-200">Bilhete Não Encontrado</h3>
          <p className="text-xs text-gray-400">
            Nenhum bilhete com o código <span className="font-mono text-white">"{codigoInput}"</span> foi registrado no terminal.
          </p>
        </div>
      )}

      {bilheteEncontrado && (
        <div className="bg-[#0E1526] border border-[#1E2B47] rounded-2xl overflow-hidden shadow-xl">
          {/* Top banner of ticket */}
          <div className="bg-[#001D6E] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white border-b border-[#0D2D8F]">
            <div>
              <span className="text-[10px] text-blue-200 uppercase tracking-widest font-bold">
                Consulta de Terminal
              </span>
              <h3 className="text-lg font-black flex items-center gap-2">
                <span>Bilhete #{bilheteEncontrado.codigo}</span>
                <span className="text-xs font-mono font-normal text-blue-200">
                  ({new Date(bilheteEncontrado.criadoEm).toLocaleString('pt-BR')})
                </span>
              </h3>
            </div>

            {/* Status pill */}
            <div className="flex items-center gap-2">
              {bilheteEncontrado.status === 'pendente' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-black">
                  <Clock className="w-3.5 h-3.5 animate-pulse" />
                  AGUARDANDO VALIDAÇÃO
                </span>
              )}
              {bilheteEncontrado.status === 'validado' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-black">
                  <CheckCircle className="w-3.5 h-3.5" />
                  VALIDADO NA BANCA
                </span>
              )}
              {bilheteEncontrado.status === 'premiado' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 text-xs font-black">
                  <Trophy className="w-3.5 h-3.5" />
                  PREMIADO (GREEN)
                </span>
              )}
            </div>
          </div>

          {/* Bettor & Details */}
          <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-[#1A253C] bg-[#0A0F1B] text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-500 block">Apostador</span>
              <span className="font-bold text-gray-200">{bilheteEncontrado.apostadorNome}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-500 block">Cotação Total</span>
              <span className="font-mono font-black text-yellow-400 text-sm">
                {bilheteEncontrado.cotacaoTotal.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-500 block">Valor da Aposta</span>
              <span className="font-mono font-black text-gray-200 text-sm">
                R$ {bilheteEncontrado.valorApostado.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-500 block">Retorno Potencial</span>
              <span className="font-mono font-black text-[#00E676] text-sm">
                R$ {bilheteEncontrado.retornoPotencial.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Picks List */}
          <div className="p-6 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">
              Palpites no Bilhete ({bilheteEncontrado.itens.length})
            </h4>

            <div className="space-y-2">
              {bilheteEncontrado.itens.map((it, idx) => (
                <div
                  key={idx}
                  className="bg-[#121B2F] border border-[#1E2B47] rounded-xl p-3 flex items-center justify-between gap-4"
                >
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-blue-300 uppercase">
                      {it.campeonatoNome} • {it.dataHoraFormatada}
                    </span>
                    <h5 className="text-sm font-bold text-white">
                      {it.jogoDescricao}
                    </h5>
                    <p className="text-xs text-yellow-400 font-semibold">
                      Mercado: {it.mercadoNome} ➔ Palpite: <span className="font-black underline">{it.palpiteRotulo}</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 block font-semibold">Cotação</span>
                    <span className="font-mono font-black text-sm text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                      {it.oddValor.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer action */}
          <div className="bg-[#0A0F1B] p-4 border-t border-[#1A253C] flex items-center justify-between">
            <span className="text-xs font-mono text-gray-500">
              Hash: {bilheteEncontrado.hashSeguranca}
            </span>
            <button
              onClick={() => abrirModalComBilhete(bilheteEncontrado)}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Ver Comprovante Térmico</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
