import React, { useEffect, useState } from 'react';
import { useBetting } from '../context/BettingContext';
import { ApiService, CONFIGS_PADRAO } from '../services/api';
import { ConfiguracoesBanca } from '../types/betting';
import {
  Trash2,
  X,
  Ticket,
  Zap,
  LogIn,
  Copy,
  MessageCircle,
  Check,
  Clock,
  ListOrdered,
} from 'lucide-react';
import { abrirWhatsAppBilhete, sanitizeConfiguracoesBanca } from '../utils/whatsappBilhete';

export const BettingSlip: React.FC = () => {
  const {
    itensCupom,
    tipoAposta,
    setTipoAposta,
    valorApostado,
    setValorApostado,
    cotacaoTotal,
    retornoPotencial,
    removerItem,
    limparCupom,
    simularAposta,
    isSimulando,
    sessaoCliente,
    abrirCadastroCliente,
    bilheteGerado,
    abrirModalComBilhete,
    setAbaAtiva,
  } = useBetting();

  const [configs, setConfigs] = useState<ConfiguracoesBanca>(CONFIGS_PADRAO);
  const [copiadoCodigo, setCopiadoCodigo] = useState(false);

  useEffect(() => {
    ApiService.getConfiguracoes().then(c => setConfigs(sanitizeConfiguracoesBanca(c)));
  }, [bilheteGerado?.codigo]);

  const handleFinalizar = async () => {
    if (itensCupom.length === 0) return;
    if (!sessaoCliente) {
      abrirCadastroCliente('login', 'Faça login para gerar seu bilhete.');
      return;
    }
    if (valorApostado <= 0) {
      setValorApostado(10);
    }
    await simularAposta();
  };

  const showUltimoBilhete = Boolean(bilheteGerado && itensCupom.length === 0);

  const copiarCodigo = () => {
    if (!bilheteGerado) return;
    const pin = bilheteGerado.pin || '';
    navigator.clipboard.writeText(
      `Código: ${bilheteGerado.codigo}${pin ? ` | PIN: ${pin}` : ''}`
    );
    setCopiadoCodigo(true);
    setTimeout(() => setCopiadoCodigo(false), 2500);
  };

  const enviarWhatsApp = () => {
    if (!bilheteGerado) return;
    abrirWhatsAppBilhete(bilheteGerado, configs);
  };

  return (
    <aside
      id="cupom-sidebar"
      className="w-full lg:w-80 bg-[#0E1422] border-l border-[#1A253D] flex flex-col shrink-0 text-white select-none shadow-2xl lg:sticky lg:top-[54px] lg:h-[calc(100vh-54px)] lg:max-h-[calc(100vh-54px)]"
    >
      <div className="bg-[#001D6E] px-3.5 py-2.5 border-b border-[#0D2D8F] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Ticket className="w-4 h-4 text-yellow-400" />
          <h2 className="text-xs font-black tracking-wide uppercase">
            Cupom de Apostas {itensCupom.length > 0 && `(${itensCupom.length})`}
          </h2>
        </div>

        {itensCupom.length > 0 && (
          <button
            onClick={limparCupom}
            className="text-blue-200 hover:text-red-400 text-[11px] flex items-center gap-1 transition-colors"
            title="Limpar seleções"
          >
            <Trash2 className="w-3 h-3" />
            <span>Limpar</span>
          </button>
        )}
      </div>

      {!sessaoCliente && (
        <div className="mx-3 mt-3 p-2.5 rounded-lg bg-amber-950/40 border border-amber-700/50 text-[11px] text-amber-100">
          <strong className="block text-amber-300 mb-1">Conta necessária</strong>
          Cadastre-se ou entre para montar o cupom e gerar bilhete.
          <button
            type="button"
            onClick={() => abrirCadastroCliente('cadastro')}
            className="mt-2 w-full py-1.5 rounded-md bg-amber-400 text-[#0a1628] font-bold text-xs"
          >
            Criar conta / Entrar
          </button>
        </div>
      )}

      {sessaoCliente && (
        <div className="mx-3 mt-3 px-2.5 py-2 rounded-lg bg-[#0a1528] border border-[#1e2d4a] text-[11px] text-gray-300 flex items-center justify-between gap-2">
          <span>
            Apostador: <span className="text-white font-bold">{sessaoCliente.nome}</span>
          </span>
          <button
            type="button"
            onClick={() => setAbaAtiva('conferir')}
            className="text-[10px] font-bold text-blue-400 hover:text-blue-300 shrink-0"
          >
            Minhas apostas
          </button>
        </div>
      )}

      <div className="p-3 flex-1 overflow-y-auto space-y-2.5 custom-scrollbar">
        {showUltimoBilhete && bilheteGerado && (
          <div className="rounded-xl border border-emerald-600/40 bg-emerald-950/25 p-3 space-y-3">
            <div className="flex items-center gap-2 text-emerald-300">
              <Check className="w-4 h-4 shrink-0" />
              <span className="text-xs font-black uppercase">Bilhete gerado</span>
            </div>

            <div className="bg-[#0a1628] rounded-lg p-2.5 border border-[#1e3a5f] space-y-2">
              <div>
                <span className="text-[9px] uppercase text-gray-500 font-bold">Código</span>
                <p className="font-mono font-black text-lg text-yellow-400">{bilheteGerado.codigo}</p>
              </div>
              {bilheteGerado.pin && (
                <div>
                  <span className="text-[9px] uppercase text-gray-500 font-bold">PIN (validação)</span>
                  <p className="font-mono font-bold text-white">{bilheteGerado.pin}</p>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-[10px] text-amber-200 bg-amber-950/40 border border-amber-700/40 rounded-md px-2 py-1.5">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                Envie no WhatsApp e pague o PIX. O dono valida o código antes da aposta valer.
              </div>
              <div className="text-[10px] text-gray-400 space-y-0.5">
                <p>
                  Odd total: <span className="text-yellow-400 font-mono">{bilheteGerado.cotacaoTotal.toFixed(2)}</span>
                </p>
                <p>
                  Valor: <span className="text-white font-mono">R$ {bilheteGerado.valorApostado.toFixed(2)}</span>
                </p>
                <p>
                  Retorno:{' '}
                  <span className="text-emerald-400 font-mono">R$ {bilheteGerado.retornoPotencial.toFixed(2)}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={enviarWhatsApp}
                className="w-full py-2.5 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-xs flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Enviar no WhatsApp (21) 99080-8924
              </button>
              <button
                type="button"
                onClick={copiarCodigo}
                className="w-full py-2 rounded-lg bg-[#141E33] hover:bg-[#1a2844] border border-[#233354] text-xs font-bold flex items-center justify-center gap-2"
              >
                {copiadoCodigo ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copiadoCodigo ? 'Copiado!' : 'Copiar código e PIN'}
              </button>
              <button
                type="button"
                onClick={() => abrirModalComBilhete(bilheteGerado)}
                className="w-full py-2 rounded-lg text-[11px] font-bold text-blue-300 hover:text-blue-200 flex items-center justify-center gap-1"
              >
                <ListOrdered className="w-3.5 h-3.5" />
                Ver palpites completos
              </button>
            </div>
          </div>
        )}

        {itensCupom.length === 0 && !showUltimoBilhete ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#141C2E] border border-[#222E48] flex items-center justify-center text-2xl text-yellow-400">
              🎟️
            </div>
            <div>
              <p className="text-xs font-bold text-gray-200">Seu cupom está vazio</p>
              <p className="text-[11px] text-gray-500 mt-1">
                {sessaoCliente
                  ? 'Clique nas cotações dos jogos para adicionar seleções.'
                  : 'Entre na sua conta e clique nas odds para apostar.'}
              </p>
            </div>
          </div>
        ) : null}

        {itensCupom.length > 0 && (
          <>
            <div className="grid grid-cols-2 gap-1 bg-[#090E17] p-1 rounded-lg border border-[#19243C]">
              <button
                type="button"
                onClick={() => setTipoAposta('multipla')}
                className={`py-1 text-xs font-bold rounded-md transition-colors ${
                  tipoAposta === 'multipla'
                    ? 'bg-[#00227B] text-yellow-400 shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Múltipla ({itensCupom.length})
              </button>
              <button
                type="button"
                onClick={() => setTipoAposta('simples')}
                className={`py-1 text-xs font-bold rounded-md transition-colors ${
                  tipoAposta === 'simples'
                    ? 'bg-[#00227B] text-yellow-400 shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Simples
              </button>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
              {itensCupom.map(item => (
                <div
                  key={`${item.jogoId}_${item.mercadoId}_${item.palpiteRotulo}`}
                  className="bg-[#131B2D] border border-[#1F2C47] rounded-lg p-2 space-y-1 relative group hover:border-blue-500/50 transition-colors"
                >
                  <button
                    onClick={() => removerItem(item.jogoId, item.mercadoId)}
                    className="absolute top-1.5 right-1.5 text-gray-400 hover:text-red-400 p-0.5 rounded transition-colors"
                    title="Remover seleção"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  <div className="text-[10px] text-gray-400 uppercase font-semibold truncate pr-5">
                    {item.campeonatoNome}
                  </div>
                  <div className="text-xs font-bold text-gray-100 truncate pr-5">{item.jogoDescricao}</div>

                  <div className="flex items-center justify-between pt-1 border-t border-[#1C263D]">
                    <span className="text-[11px] text-yellow-400 font-bold truncate">{item.palpiteRotulo}</span>
                    <span className="font-mono text-xs font-black text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/50">
                      {item.oddValor.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[#121A2B] border border-[#1E2B47] rounded-xl p-2.5 space-y-2">
              <div>
                <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Valores Rápidos:</label>
                <div className="grid grid-cols-4 gap-1">
                  {[5, 10, 20, 50].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setValorApostado(val)}
                      className={`py-1 text-xs font-mono font-bold rounded border transition-colors ${
                        valorApostado === val
                          ? 'bg-yellow-400 text-blue-950 border-yellow-400 font-black'
                          : 'bg-[#0A0F19] text-gray-300 border-[#22304F] hover:bg-[#18233C]'
                      }`}
                    >
                      +R${val}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Valor da Aposta (R$):</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-xs text-gray-400 font-bold">R$</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={valorApostado || ''}
                    onChange={e => setValorApostado(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#070B13] border border-[#233150] rounded-lg pl-8 pr-3 py-1.5 text-sm font-mono font-black text-white focus:outline-none focus:border-emerald-400"
                    placeholder="10,00"
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {itensCupom.length > 0 && (
        <div className="p-3 bg-[#080D17] border-t border-[#1C263D] shrink-0 space-y-2 shadow-lg pb-20 lg:pb-3">
          <div className="flex items-center justify-between text-xs bg-[#0F1626] p-2 rounded-lg border border-[#1E2B45]">
            <div>
              <span className="text-[9px] text-gray-400 uppercase font-bold block">Odd Total</span>
              <span className="font-mono font-black text-sm text-yellow-400">{cotacaoTotal.toFixed(2)}</span>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-emerald-400 uppercase font-bold block">Possível Retorno</span>
              <span className="font-mono font-black text-sm text-[#00E676]">R$ {retornoPotencial.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleFinalizar}
            disabled={isSimulando || !sessaoCliente}
            className="w-full py-3 px-3 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500 hover:from-emerald-400 hover:to-green-300 text-gray-950 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 transition-all"
          >
            {isSimulando ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-950 border-t-transparent rounded-full animate-spin" />
                <span>Gerando bilhete...</span>
              </>
            ) : !sessaoCliente ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Entrar para apostar</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current text-gray-950 shrink-0" />
                <span>Finalizar e gerar código</span>
              </>
            )}
          </button>
          <p className="text-[9px] text-center text-gray-500">
            Depois você envia no WhatsApp e copia o código aqui no cupom.
          </p>
        </div>
      )}
    </aside>
  );
};
