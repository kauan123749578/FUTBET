import React, { useCallback, useEffect, useState } from 'react';
import { ApiService } from '../services/api';
import { Bilhete } from '../types/betting';
import { useBetting } from '../context/BettingContext';
import { Clock, CheckCircle, Trophy, XCircle, RefreshCw, Ticket } from 'lucide-react';

function statusLabel(status: Bilhete['status']): { text: string; className: string; Icon: typeof Clock } {
  switch (status) {
    case 'validado':
      return {
        text: 'Validado na banca',
        className: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/40',
        Icon: CheckCircle,
      };
    case 'premiado':
      return {
        text: 'Premiado',
        className: 'text-yellow-300 bg-yellow-500/15 border-yellow-500/40',
        Icon: Trophy,
      };
    case 'perdido':
      return {
        text: 'Perdeu',
        className: 'text-red-300 bg-red-500/15 border-red-500/40',
        Icon: XCircle,
      };
    case 'cancelado':
      return {
        text: 'Cancelado',
        className: 'text-gray-400 bg-gray-500/15 border-gray-500/40',
        Icon: XCircle,
      };
    default:
      return {
        text: 'Aguardando validação (PIX enviado?)',
        className: 'text-amber-300 bg-amber-500/15 border-amber-500/40',
        Icon: Clock,
      };
  }
}

export const ClienteMinhasApostas: React.FC = () => {
  const { sessaoCliente, abrirModalComBilhete } = useBetting();
  const [lista, setLista] = useState<Bilhete[]>([]);
  const [carregando, setCarregando] = useState(false);

  const carregar = useCallback(async () => {
    if (!sessaoCliente?.telefone) return;
    setCarregando(true);
    try {
      const rows = await ApiService.listarBilhetesCliente(sessaoCliente.telefone);
      setLista(rows);
    } finally {
      setCarregando(false);
    }
  }, [sessaoCliente?.telefone]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  if (!sessaoCliente) return null;

  return (
    <div className="bg-[#0E1526] border border-[#1B2742] rounded-2xl overflow-hidden shadow-lg">
      <div className="bg-[#001D6E] px-4 py-3 flex items-center justify-between gap-2 border-b border-[#0D2D8F]">
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-wide">Minhas apostas</h3>
          <p className="text-[10px] text-blue-200 mt-0.5">
            Acompanhe códigos e status — após o PIX, aguardamos validação do dono.
          </p>
        </div>
        <button
          type="button"
          onClick={carregar}
          disabled={carregando}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white disabled:opacity-50"
          title="Atualizar"
        >
          <RefreshCw className={`w-4 h-4 ${carregando ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {lista.length === 0 ? (
        <p className="text-xs text-gray-500 p-6 text-center">
          {carregando ? 'Carregando...' : 'Nenhum bilhete ainda. Finalize uma aposta no cupom.'}
        </p>
      ) : (
        <ul className="divide-y divide-[#1A253C] max-h-[420px] overflow-y-auto">
          {lista.map(b => {
            const st = statusLabel(b.status);
            const StIcon = st.Icon;
            return (
              <li key={b.codigo} className="p-4 hover:bg-[#121A2D] transition-colors">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <span className="font-mono font-black text-yellow-400 text-sm">{b.codigo}</span>
                    {b.pin && (
                      <span className="ml-2 text-[10px] text-gray-500 font-mono">PIN {b.pin}</span>
                    )}
                    <p className="text-[10px] text-gray-500 mt-1">
                      {b.criadoEm ? new Date(b.criadoEm).toLocaleString('pt-BR') : '—'} · R${' '}
                      {b.valorApostado.toFixed(2)} · odd {b.cotacaoTotal.toFixed(2)}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border ${st.className}`}
                  >
                    <StIcon className="w-3 h-3" />
                    {st.text}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => abrirModalComBilhete(b)}
                  className="mt-2 text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  Ver detalhes / WhatsApp
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
