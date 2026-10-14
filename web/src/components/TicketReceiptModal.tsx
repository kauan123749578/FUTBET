import React, { useState, useEffect } from 'react';
import { useBetting } from '../context/BettingContext';
import { ApiService } from '../services/api';
import { ConfiguracoesBanca } from '../types/betting';
import { 
  X, 
  Copy, 
  Printer, 
  Check, 
  QrCode, 
  Clock, 
  ShieldCheck, 
  Smartphone,
  Trophy,
  MessageCircle,
  Zap,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CONFIGS_PADRAO } from '../services/api';
import {
  abrirWhatsAppBilhete,
  formatarMensagemBilheteWhatsApp,
  sanitizeConfiguracoesBanca,
} from '../utils/whatsappBilhete';

export const TicketReceiptModal: React.FC = () => {
  const { bilheteGerado, modalBilheteAberto, fecharModalBilhete } = useBetting();
  const [copiadoTexto, setCopiadoTexto] = useState(false);
  const [copiadoPix, setCopiadoPix] = useState(false);
  const [copiadoCodigo, setCopiadoCodigo] = useState(false);
  const [copiadoPin, setCopiadoPin] = useState(false);
  const [configs, setConfigs] = useState<ConfiguracoesBanca>(CONFIGS_PADRAO);

  useEffect(() => {
    ApiService.getConfiguracoes().then(c => setConfigs(sanitizeConfiguracoesBanca(c)));
  }, [modalBilheteAberto]);

  if (!modalBilheteAberto || !bilheteGerado) return null;

  const chavePixEfetiva = configs.chave_pix || bilheteGerado.chavePixBanca || CONFIGS_PADRAO.chave_pix;
  const pinEfetivo = bilheteGerado.pin || '—';

  const formatarTextoWhatsApp = () => formatarMensagemBilheteWhatsApp(bilheteGerado, configs);

  const handleCompartilharWhatsApp = () => {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 }
    });
    abrirWhatsAppBilhete(bilheteGerado, configs);
  };

  const handleCopiarTexto = () => {
    navigator.clipboard.writeText(formatarTextoWhatsApp());
    setCopiadoTexto(true);
    setTimeout(() => setCopiadoTexto(false), 2500);
  };

  const handleCopiarPix = () => {
    navigator.clipboard.writeText(chavePixEfetiva);
    setCopiadoPix(true);
    setTimeout(() => setCopiadoPix(false), 2500);
  };

  const handleCopiarCodigo = () => {
    navigator.clipboard.writeText(bilheteGerado.codigo);
    setCopiadoCodigo(true);
    setTimeout(() => setCopiadoCodigo(false), 2500);
  };

  const handleCopiarPin = () => {
    navigator.clipboard.writeText(pinEfetivo);
    setCopiadoPin(true);
    setTimeout(() => setCopiadoPin(false), 2500);
  };

  const handleImprimir = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#101726] border border-[#202E48] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-auto">
        {/* Header Oficial */}
        <div className="bg-[#001D6E] px-4 py-3 text-white flex items-center justify-between border-b border-[#0D2D8F]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-yellow-400" />
            <div>
              <span className="text-[10px] text-blue-200 uppercase tracking-widest font-bold">
                Cupom Oficial de Aposta
              </span>
              <h3 className="text-base font-black">
                Bilhete <span className="text-yellow-400">#{bilheteGerado.codigo}</span>
              </h3>
            </div>
          </div>
          <button
            onClick={fecharModalBilhete}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ==================== BOTÃO GIGANTE DE WHATSAPP NO TOPO (DESTAQUE MÁXIMO) ==================== */}
        <div className="p-3 bg-gradient-to-r from-emerald-950 via-[#0B2E1D] to-emerald-950 border-b border-emerald-800/60 text-center space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-black uppercase tracking-wider animate-pulse">
            <Zap className="w-4 h-4 fill-emerald-400" />
            <span>BILHETE GERADO COM SUCESSO! PASSO FINAL:</span>
          </div>

          <button
            onClick={handleCompartilharWhatsApp}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-400 hover:to-green-400 text-gray-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-emerald-900/40 transform active:scale-98 transition-all border-2 border-emerald-300"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            <span>ENVIAR CÓDIGO E PAGAR PELO WHATSAPP</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-[11px] text-emerald-200">
            Aperte no botão verde acima para enviar o cupom <strong className="text-white bg-emerald-900/60 px-1 py-0.5 rounded font-mono">#{bilheteGerado.codigo}</strong> e o PIN <strong className="text-yellow-300 bg-emerald-900/60 px-1 py-0.5 rounded font-mono">🔐 {pinEfetivo}</strong> no WhatsApp para validação imediata!
          </p>
        </div>

        {/* Box de Cupom, PIN e Chave PIX */}
        <div className="p-3 bg-[#0A101D] border-b border-[#1C2844] space-y-2">
          {/* Cupom & PIN destacados lado a lado */}
          <div className="grid grid-cols-2 gap-2 bg-[#060A14] p-2.5 rounded-xl border border-[#19243C]">
            <div className="border-r border-[#19243C] pr-2">
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">
                CUPOM DE APOSTA:
              </span>
              <span className="text-sm font-mono font-black text-amber-400">
                #{bilheteGerado.codigo}
              </span>
            </div>
            <div className="pl-2">
              <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider block">
                PIN DO CAMBISTA:
              </span>
              <span className="text-sm font-mono font-black text-emerald-400 tracking-wider">
                🔐 {pinEfetivo}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1">
            <div className="text-left w-full sm:w-auto">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                Chave PIX da Banca (Dono):
              </span>
              <span className="text-xs font-mono font-black text-yellow-400">
                {chavePixEfetiva}
              </span>
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end flex-wrap">
              <button
                onClick={handleCopiarPin}
                className="flex-1 sm:flex-initial py-1.5 px-2.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                title="Copiar PIN numérico para o Cambista validar"
              >
                {copiadoPin ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiadoPin ? 'PIN Copiado!' : 'Copiar PIN'}</span>
              </button>

              <button
                onClick={handleCopiarCodigo}
                className="flex-1 sm:flex-initial py-1.5 px-2.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
              >
                {copiadoCodigo ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiadoCodigo ? 'Copiado!' : 'Copiar Cupom'}</span>
              </button>

              <button
                onClick={handleCopiarPix}
                className="flex-1 sm:flex-initial py-1.5 px-2.5 rounded-lg bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
              >
                {copiadoPix ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiadoPix ? 'PIX Copiado!' : 'Copiar PIX'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Printable Thermal Receipt Box (58mm/80mm format) */}
        <div className="p-4 bg-[#080D17]">
          <div className="thermal-receipt p-5 rounded-lg text-xs leading-relaxed border border-gray-300 shadow-md">
            {/* Header Receipt */}
            <div className="text-center pb-3 border-b-2 border-dashed border-gray-400">
              <h2 className="text-base font-black tracking-wider uppercase">
                {configs.nome_banca}
              </h2>
              <p className="text-[10px] text-gray-600 font-semibold">
                SISTEMA INTEGRADO DE APOSTAS
              </p>
              <p className="text-[12px] font-mono font-black text-blue-950 mt-1">
                CUPOM: {bilheteGerado.codigo} | PIN: {pinEfetivo}
              </p>
              <p className="text-[10px] text-amber-700 font-bold uppercase">
                [ AGUARDANDO VALIDAÇÃO DO PIN PELO CAMBISTA ]
              </p>
              <p className="text-[10px] text-gray-600">
                Data: {new Date(bilheteGerado.criadoEm).toLocaleString('pt-BR')}
              </p>
              <p className="text-[11px] font-bold">
                Apostador: {bilheteGerado.apostadorNome}
              </p>
            </div>

            {/* Picks list */}
            <div className="py-3 border-b-2 border-dashed border-gray-400 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
                JOGOS & PALPITES ({bilheteGerado.itens.length})
              </div>
              {bilheteGerado.itens.map((it, idx) => (
                <div key={idx} className="text-[11px] font-mono leading-tight">
                  <div className="font-bold">
                    {idx + 1}. {it.jogoDescricao}
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-700 pl-3">
                    <span>{it.palpiteRotulo}</span>
                    <span className="font-bold">Odd: {it.oddValor.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Totals */}
            <div className="py-3 border-b-2 border-dashed border-gray-400 space-y-1 font-mono">
              <div className="flex justify-between text-xs">
                <span>COTAÇÃO TOTAL:</span>
                <span className="font-black text-green-800">{bilheteGerado.cotacaoTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>VALOR APOSTADO:</span>
                <span className="font-black text-blue-800">R$ {bilheteGerado.valorApostado.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-black pt-1 border-t border-gray-400 text-red-600">
                <span>RETORNO POSSÍVEL:</span>
                <span>R$ {bilheteGerado.retornoPotencial.toFixed(2)}</span>
              </div>
            </div>

            {/* Security Hash & QR Code Simulation */}
            <div className="pt-3 text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-gray-800">
                <QrCode className="w-12 h-12 stroke-[1.5]" />
              </div>
              <p className="text-[9px] font-mono text-gray-600">
                Hash: {bilheteGerado.hashSeguranca}
              </p>
              <div className="p-1.5 bg-yellow-100 rounded border border-yellow-300 text-[10px] font-bold text-yellow-900">
                CHAVE PIX: {chavePixEfetiva}
              </div>
              <p className="text-[8px] text-gray-500 uppercase">
                Apresente este código ao administrador para confirmação e pagamento do prêmio.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-3 bg-[#0F1626] border-t border-[#1C2844] space-y-2">
          {/* Secondary WhatsApp button in case user scrolled */}
          <button
            onClick={handleCompartilharWhatsApp}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-colors"
          >
            <Smartphone className="w-4 h-4" />
            <span>Enviar no WhatsApp do Dono</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopiarTexto}
              className="py-2 px-3 rounded-lg bg-[#1B273F] hover:bg-[#233352] text-gray-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-[#273859]"
            >
              {copiadoTexto ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Texto Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Mensagem</span>
                </>
              )}
            </button>

            <button
              onClick={handleImprimir}
              className="py-2 px-3 rounded-lg bg-[#1B273F] hover:bg-[#233352] text-gray-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-[#273859]"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Térmica</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
