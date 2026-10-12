import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Radio, 
  ShieldCheck, 
  Zap, 
  Smartphone, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight, 
  ChevronRight,
  Clock,
  Award
} from 'lucide-react';
import { useBetting } from '../context/BettingContext';

export const HeroBanner: React.FC = () => {
  const { setDataFiltro, setAbaAtiva } = useBetting();
  const [slideAtivo, setSlideAtivo] = useState(0);

  const slides = [
    {
      badge: '🔥 COTAÇÕES TURBINADAS',
      badgeColor: 'from-amber-500/20 to-yellow-500/10 text-yellow-300 border-amber-400/30',
      titulo: 'BRASILEIRÃO & ELITE DO FUTEBOL',
      destaque: 'ODDS MAXIMIZADAS',
      descricao: 'As melhores cotações 1X2, Dupla Chance, Ambas Marcam e Mais/Menos Gols do mercado nacional com liquidação rápida.',
      acaoTexto: 'Explorar Jogos de Hoje',
      acaoFiltro: 'hoje',
      icone: Flame
    },
    {
      badge: '🔴 COBERTURA EM TEMPO REAL',
      badgeColor: 'from-red-500/20 to-rose-500/10 text-red-300 border-red-500/30',
      titulo: 'APOSTAS AO VIVO & PLACAR DINÂMICO',
      destaque: 'RADAR 24/7',
      descricao: 'Acompanhe as partidas minuto a minuto com variação automática de odds e mais de 300 mercados disponíveis por jogo.',
      acaoTexto: 'Ver Partidas Ao Vivo',
      acaoFiltro: 'ao_vivo',
      icone: Radio
    },
    {
      badge: '⚡ AGILIDADE & SEGURANÇA',
      badgeColor: 'from-emerald-500/20 to-teal-500/10 text-emerald-300 border-emerald-400/30',
      titulo: 'VALIVAÇÃO INSTANTÂNEA DE BILHETES',
      destaque: 'PIX & WHATSAPP',
      descricao: 'Monte seus palpites, gere seu código PIN de segurança oficial e ative direto com seu cambista de confiança.',
      acaoTexto: 'Conferir Bilhete',
      acaoAba: 'conferir',
      icone: Zap
    }
  ];

  // Alterna automaticamente os slides a cada 6 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideAtivo((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slideAtual = slides[slideAtivo];
  const IconeDestaque = slideAtual.icone;

  const handleAction = () => {
    if (slideAtual.acaoAba) {
      setAbaAtiva(slideAtual.acaoAba as any);
    } else if (slideAtual.acaoFiltro) {
      setDataFiltro(slideAtual.acaoFiltro);
      const el = document.getElementById('lista-jogos');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#030919] via-[#07163D] to-[#0A225C] border border-[#162F6E]/80 shadow-2xl mb-5 text-white">
      {/* Background radial effects e malha esportiva sutil */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-72 h-72 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none" />
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '18px 18px' }} 
      />

      <div className="relative z-10 p-5 sm:p-6 lg:p-7 flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Lado Esquerdo: Banner Principal com Transição Fluida */}
        <div className="flex-1 w-full text-center lg:text-left">
          {/* Header Tag / Badge */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-3">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r ${slideAtual.badgeColor} border text-xs font-black tracking-wide uppercase shadow-sm`}>
              <IconeDestaque className="w-3.5 h-3.5" />
              <span>{slideAtual.badge}</span>
            </div>

            <div className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-blue-300/80 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Terminal Oficial & Banca Segura</span>
            </div>
          </div>

          {/* Título Principal de Alto Impacto */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white drop-shadow-md leading-tight">
            {slideAtual.titulo}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500">
              {slideAtual.destaque}
            </span>
          </h1>

          {/* Descrição Comercial Clara e Objetiva */}
          <p className="text-xs sm:text-sm text-blue-100/80 mt-2 max-w-2xl leading-relaxed">
            {slideAtual.descricao}
          </p>

          {/* Botões de Ação e Navegação rápida de slides */}
          <div className="mt-5 flex flex-wrap items-center justify-center lg:justify-start gap-3">
            <button
              onClick={handleAction}
              className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-blue-950 font-black text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-lg hover:shadow-yellow-500/20 transition-all flex items-center gap-2 group transform active:scale-95"
            >
              <span>{slideAtual.acaoTexto}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => {
                setDataFiltro('todos');
                const el = document.getElementById('lista-jogos');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl backdrop-blur-sm transition-all flex items-center gap-2"
            >
              <span>Todos os Confrontos</span>
            </button>

            {/* Marcadores de Slides */}
            <div className="flex items-center gap-1.5 ml-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setSlideAtivo(idx)}
                  className={`h-2 rounded-full transition-all ${
                    slideAtivo === idx ? 'w-6 bg-yellow-400' : 'w-2 bg-white/30 hover:bg-white/50'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Lado Direito: Grid de Cartões de Recursos Modernos (Estilo Glassmorphism Premium) */}
        <div className="grid grid-cols-2 gap-2.5 w-full lg:w-[420px] shrink-0">
          {/* Card 1: Odds Turbinadas */}
          <div 
            onClick={() => {
              setDataFiltro('hoje');
              const el = document.getElementById('lista-jogos');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="cursor-pointer group p-3 rounded-xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 hover:border-yellow-400/50 hover:bg-white/[0.1] transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-1.5 rounded-lg bg-yellow-400/10 text-yellow-400 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-md">
                1X2 & Mais
              </span>
            </div>
            <div>
              <h4 className="text-xs font-black text-white group-hover:text-yellow-300 transition-colors uppercase">
                Cotações Reais
              </h4>
              <p className="text-[10px] text-blue-200/70 mt-0.5">
                Odds atualizadas segundo mercado mundial
              </p>
            </div>
          </div>

          {/* Card 2: Ao Vivo Dinâmico */}
          <div 
            onClick={() => {
              setDataFiltro('ao_vivo');
              const el = document.getElementById('lista-jogos');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="cursor-pointer group p-3 rounded-xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 hover:border-red-400/50 hover:bg-white/[0.1] transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-1.5 rounded-lg bg-red-500/10 text-red-400 group-hover:scale-110 transition-transform">
                <span className="relative flex h-3.5 w-3.5 items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-400/10 px-2 py-0.5 rounded-md">
                Lance a Lance
              </span>
            </div>
            <div>
              <h4 className="text-xs font-black text-white group-hover:text-red-300 transition-colors uppercase">
                Jogos Ao Vivo
              </h4>
              <p className="text-[10px] text-blue-200/70 mt-0.5">
                Placar dinâmico e cotações ativas
              </p>
            </div>
          </div>

          {/* Card 3: Validação WhatsApp & PIN */}
          <div 
            onClick={() => {
              const el = document.getElementById('cupom-sidebar');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="cursor-pointer group p-3 rounded-xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 hover:border-emerald-400/50 hover:bg-white/[0.1] transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                <Smartphone className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md">
                WhatsApp
              </span>
            </div>
            <div>
              <h4 className="text-xs font-black text-white group-hover:text-emerald-300 transition-colors uppercase">
                PIN de Validação
              </h4>
              <p className="text-[10px] text-blue-200/70 mt-0.5">
                Envie o bilhete direto para o operador
              </p>
            </div>
          </div>

          {/* Card 4: PIX & Garantia Oficial */}
          <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500/20 via-yellow-600/10 to-amber-500/5 border border-yellow-500/30 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="p-1.5 rounded-lg bg-yellow-400 text-blue-950 font-black">
                <Award className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-yellow-300 bg-yellow-400/20 px-2 py-0.5 rounded-md">
                100% Seguro
              </span>
            </div>
            <div>
              <h4 className="text-xs font-black text-yellow-300 uppercase">
                Prêmios Garantidos
              </h4>
              <p className="text-[10px] text-blue-200/70 mt-0.5">
                Pagamento instantâneo via PIX
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Barra Inferior com Micro-Ticker de Benefícios */}
      <div className="border-t border-[#142A61] bg-[#020713]/70 px-5 py-2.5 flex flex-wrap items-center justify-between text-[11px] text-blue-200/70 gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <strong className="text-white">Banca FUTBET</strong> Licenciada
          </span>
          <span className="hidden sm:flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span>Odds calculadas em tempo real</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-blue-400" />
            <span>Horário de Brasília (BRT)</span>
          </span>
          <span className="hidden md:inline text-gray-500">•</span>
          <span className="hidden md:inline text-blue-300 font-semibold">
            Suporte via WhatsApp 24/7
          </span>
        </div>
      </div>
    </div>
  );
};
