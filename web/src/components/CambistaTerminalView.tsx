import React, { useState, useEffect } from 'react';
import { ApiService, getResumoCambista } from '../services/api';
import { Bilhete, ResumoBanca } from '../types/betting';
import { useBetting } from '../context/BettingContext';
import { 
  ShieldCheck, 
  DollarSign, 
  Percent, 
  CheckCircle, 
  Trophy, 
  AlertCircle, 
  Search, 
  Ticket, 
  Printer, 
  RefreshCw 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CambistaTerminalView: React.FC = () => {
  const { abrirModalComBilhete } = useBetting();
  const [resumo, setResumo] = useState<ResumoBanca>(getResumoCambista());
  const [bilhetes, setBilhetes] = useState<Bilhete[]>([]);
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [codigoValidar, setCodigoValidar] = useState('');
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);
  const [processando, setProcessando] = useState(false);

  const carregarDados = async () => {
    setResumo(getResumoCambista());
    const lista = await ApiService.listarTodosBilhetes();
    setBilhetes(lista);
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleValidarCodigo = async (codigo: string) => {
    if (!codigo.trim()) return;
    setProcessando(true);
    setMensagemSucesso(null);
    setMensagemErro(null);

    const res = await ApiService.validarBilhete(codigo, 'Cambista Central (PDV 01)');

    setProcessando(false);

    if (res.success && res.bilhete) {
      confetti({ particleCount: 60, spread: 60 });
      setMensagemSucesso(`Bilhete #${res.bilhete.codigo} validado com sucesso! Saldo e comissão atualizados.`);
      setCodigoValidar('');
      await carregarDados();
      abrirModalComBilhete(res.bilhete);
    } else {
      setMensagemErro(res.erro || 'Erro ao validar bilhete.');
    }
  };

  const handlePagarPremio = async (codigo: string) => {
    if (!confirm(`Deseja confirmar o pagamento do prêmio do bilhete #${codigo}?`)) return;
    const res = await ApiService.pagarPremio(codigo);
    if (res.success) {
      alert(`Prêmio do bilhete #${codigo} pago com sucesso!`);
      await carregarDados();
    } else {
      alert(res.erro);
    }
  };

  const bilhetesFiltrados = bilhetes.filter(b => {
    if (filtroStatus === 'todos') return true;
    return b.status === filtroStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Bar Operator Header */}
      <div className="bg-gradient-to-r from-[#001D6E] via-[#082987] to-[#0A3D9E] rounded-2xl p-6 text-white border border-[#143FA4] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-emerald-500 text-gray-950 font-black px-2 py-0.5 rounded uppercase tracking-wider">
                PDV ATIVO
              </span>
              <span className="text-xs text-blue-200">Operador: Cambista Central (PDV 01)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black mt-0.5">
              Terminal Operacional de Caixa
            </h2>
          </div>
        </div>

        <button
          onClick={carregarDados}
          className="self-start md:self-auto bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors border border-white/20"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Atualizar Caixa</span>
        </button>
      </div>

      {/* Financial Metrics Dashboard (The Cambista financial model) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Limite de Saldo */}
        <div className="bg-[#0E1526] border border-[#1E2B47] rounded-xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Limite do Cambista</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg sm:text-xl font-mono font-black text-emerald-400">
            R$ {resumo.saldoLimiteCambista.toFixed(2)}
          </div>
          <div className="text-[10px] text-gray-500 font-semibold">Crédito para validar bilhetes</div>
        </div>

        {/* Total Vendido Hoje */}
        <div className="bg-[#0E1526] border border-[#1E2B47] rounded-xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Vendido</span>
            <Ticket className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-lg sm:text-xl font-mono font-black text-white">
            R$ {resumo.totalVendidoHoje.toFixed(2)}
          </div>
          <div className="text-[10px] text-gray-500 font-semibold">{resumo.totalBilhetesValidados} bilhetes emitidos</div>
        </div>

        {/* Comissão Cambista (10%) */}
        <div className="bg-[#0E1526] border border-[#1E2B47] rounded-xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Sua Comissão ({resumo.comissaoPercentual}%)</span>
            <Percent className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-lg sm:text-xl font-mono font-black text-yellow-400">
            R$ {resumo.totalComissaoHoje.toFixed(2)}
          </div>
          <div className="text-[10px] text-gray-500 font-semibold">Ganho líquido do operador</div>
        </div>

        {/* Prêmios Pagos */}
        <div className="bg-[#0E1526] border border-[#1E2B47] rounded-xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Prêmios Pagos</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg sm:text-xl font-mono font-black text-amber-400">
            R$ {resumo.totalPremiosPagosHoje.toFixed(2)}
          </div>
          <div className="text-[10px] text-gray-500 font-semibold">Saídas pagas aos clientes</div>
        </div>

        {/* Saldo Líquido da Banca */}
        <div className="bg-[#0E1526] border border-[#1E2B47] rounded-xl p-3.5 space-y-1 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Acerto Líquido</span>
            <ShieldCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-lg sm:text-xl font-mono font-black text-blue-400">
            R$ {resumo.lucroLiquidoEstimado.toFixed(2)}
          </div>
          <div className="text-[10px] text-gray-500 font-semibold">Saldo a acertar c/ Gerente</div>
        </div>
      </div>

      {/* Quick Validation Form (Validar Pré-Bilhete enviado pelo cliente via WhatsApp) */}
      <div className="bg-[#0E1526] border border-[#1E2B47] rounded-2xl p-5 shadow-lg space-y-4">
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <span>⚡ Validador de Pré-Bilhetes (WhatsApp / PDV)</span>
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Quando o cliente enviar o código no WhatsApp ou apresentar o comprovante, digite o código abaixo para conferir as odds e ativar a aposta na banca.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleValidarCodigo(codigoValidar);
          }}
          className="flex flex-col sm:flex-row gap-2 max-w-xl"
        >
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Digite o código (ex: A9X-4821)"
              value={codigoValidar}
              onChange={e => setCodigoValidar(e.target.value.toUpperCase())}
              className="w-full bg-[#070B13] border border-[#233352] rounded-xl pl-4 pr-10 py-3 text-sm font-mono font-bold text-white uppercase focus:outline-none focus:border-emerald-400"
            />
            <Search className="w-4 h-4 text-gray-400 absolute right-3 top-3.5" />
          </div>

          <button
            type="submit"
            disabled={processando || !codigoValidar.trim()}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {processando ? 'Validando...' : '✓ Validar e Confirmar PIX'}
          </button>
        </form>

        {mensagemSucesso && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-700/60 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{mensagemSucesso}</span>
          </div>
        )}

        {mensagemErro && (
          <div className="p-3 bg-red-950/80 border border-red-700/60 rounded-xl text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{mensagemErro}</span>
          </div>
        )}
      </div>

      {/* Tickets List Table */}
      <div className="bg-[#0E1526] border border-[#1E2B47] rounded-2xl overflow-hidden shadow-xl space-y-4">
        {/* Table Header & Filters */}
        <div className="p-4 bg-[#0B101C] border-b border-[#1A253C] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Histórico de Bilhetes do Terminal ({bilhetes.length})
            </h3>
            <p className="text-xs text-gray-400">
              Gerencie apostas pendentes, validadas e prêmios a pagar
            </p>
          </div>

          <div className="flex items-center gap-1 text-xs">
            {['todos', 'pendente', 'validado', 'premiado'].map(st => (
              <button
                key={st}
                onClick={() => setFiltroStatus(st)}
                className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-colors ${
                  filtroStatus === st
                    ? 'bg-[#00227B] text-yellow-400'
                    : 'bg-[#141C2E] text-gray-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0A0E1A] text-gray-400 font-bold border-b border-[#1A253C] uppercase text-[10px]">
              <tr>
                <th className="p-3">Código</th>
                <th className="p-3">Data / Hora</th>
                <th className="p-3">Apostador</th>
                <th className="p-3">Jogos</th>
                <th className="p-3 text-right">Odd Total</th>
                <th className="p-3 text-right">Valor (R$)</th>
                <th className="p-3 text-right">Retorno (R$)</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#172136]">
              {bilhetesFiltrados.map(b => (
                <tr key={b.codigo} className="hover:bg-[#121A2D] transition-colors">
                  <td className="p-3 font-mono font-black text-yellow-400">
                    {b.codigo}
                  </td>
                  <td className="p-3 text-gray-400 font-mono">
                    {new Date(b.criadoEm).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-3 font-bold text-gray-200">
                    {b.apostadorNome}
                  </td>
                  <td className="p-3 text-gray-300">
                    <span className="font-semibold">{b.itens.length} palpites</span>
                    <span className="block text-[10px] text-gray-500 truncate max-w-xs">
                      {b.itens.map(i => i.palpiteRotulo).join(', ')}
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-yellow-400">
                    {b.cotacaoTotal.toFixed(2)}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-gray-200">
                    R$ {b.valorApostado.toFixed(2)}
                  </td>
                  <td className="p-3 text-right font-mono font-black text-[#00E676]">
                    R$ {b.retornoPotencial.toFixed(2)}
                  </td>
                  <td className="p-3 text-center">
                    {b.status === 'pendente' && (
                      <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-500/40">
                        PENDENTE
                      </span>
                    )}
                    {b.status === 'validado' && (
                      <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-500/40">
                        VALIDADO
                      </span>
                    )}
                    {b.status === 'premiado' && (
                      <span className="bg-yellow-500/20 text-yellow-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-yellow-500/40">
                        PREMIADO
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-center space-x-1">
                    <button
                      onClick={() => abrirModalComBilhete(b)}
                      className="p-1 rounded bg-[#1B273F] hover:bg-[#253554] text-blue-300 transition-colors"
                      title="Ver Comprovante Térmico"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>

                    {b.status === 'pendente' && (
                      <button
                        onClick={() => handleValidarCodigo(b.codigo)}
                        className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] uppercase transition-colors"
                      >
                        Validar
                      </button>
                    )}

                    {b.status === 'validado' && (
                      <button
                        onClick={() => handlePagarPremio(b.codigo)}
                        className="px-2 py-1 rounded bg-yellow-500 hover:bg-yellow-400 text-blue-950 font-black text-[10px] uppercase transition-colors"
                      >
                        Pagar Prêmio
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
