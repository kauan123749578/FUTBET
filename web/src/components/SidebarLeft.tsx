import React, { useState, useEffect } from 'react';
import { useBetting } from '../context/BettingContext';
import { ApiService } from '../services/api';
import { Esporte, Campeonato } from '../types/betting';
import { 
  Home, 
  ChevronDown, 
  ChevronRight, 
  Radio, 
  PlusCircle, 
  FileCheck2, 
  Search,
  X
} from 'lucide-react';

export const CountryLogoBadge: React.FC<{ codigo: string; className?: string }> = ({ codigo, className = "w-5 h-5" }) => {
  switch (codigo) {
    case 'brasil':
      return (
        <svg className={`${className} rounded-full shrink-0 shadow-sm border border-black/10`} viewBox="0 0 36 36">
          <circle fill="#009C3B" cx="18" cy="18" r="18" />
          <polygon fill="#FFDF00" points="18,4.5 31.5,18 18,31.5 4.5,18" />
          <circle fill="#002776" cx="18" cy="18" r="7.5" />
          <path d="M11,18.5 Q18,14.5 25,17.5" stroke="#FFFFFF" strokeWidth="1.2" fill="none" />
        </svg>
      );
    case 'inglaterra':
      return (
        <svg className={`${className} rounded-full shrink-0 shadow-sm border border-black/10`} viewBox="0 0 36 36">
          <circle fill="#FFFFFF" cx="18" cy="18" r="18" />
          <rect x="15" y="0" width="6" height="36" fill="#CF142B" />
          <rect x="0" y="15" width="36" height="6" fill="#CF142B" />
        </svg>
      );
    case 'italia':
      return (
        <svg className={`${className} rounded-full shrink-0 shadow-sm border border-black/10 overflow-hidden`} viewBox="0 0 36 36">
          <clipPath id="cp-it"><circle cx="18" cy="18" r="18" /></clipPath>
          <g clipPath="url(#cp-it)">
            <rect x="0" y="0" width="12" height="36" fill="#009246" />
            <rect x="12" y="0" width="12" height="36" fill="#FFFFFF" />
            <rect x="24" y="0" width="12" height="36" fill="#CE2B37" />
          </g>
        </svg>
      );
    case 'espanha':
      return (
        <svg className={`${className} rounded-full shrink-0 shadow-sm border border-black/10 overflow-hidden`} viewBox="0 0 36 36">
          <clipPath id="cp-es"><circle cx="18" cy="18" r="18" /></clipPath>
          <g clipPath="url(#cp-es)">
            <rect x="0" y="0" width="36" height="9" fill="#AA151B" />
            <rect x="0" y="9" width="36" height="18" fill="#F1BF00" />
            <rect x="0" y="27" width="36" height="9" fill="#AA151B" />
            <circle cx="12" cy="18" r="3" fill="#AA151B" opacity="0.8" />
          </g>
        </svg>
      );
    case 'alemanha':
      return (
        <svg className={`${className} rounded-full shrink-0 shadow-sm border border-black/10 overflow-hidden`} viewBox="0 0 36 36">
          <clipPath id="cp-de"><circle cx="18" cy="18" r="18" /></clipPath>
          <g clipPath="url(#cp-de)">
            <rect x="0" y="0" width="36" height="12" fill="#000000" />
            <rect x="0" y="12" width="36" height="12" fill="#DD0000" />
            <rect x="0" y="24" width="36" height="12" fill="#FFCE00" />
          </g>
        </svg>
      );
    case 'holanda':
      return (
        <svg className={`${className} rounded-full shrink-0 shadow-sm border border-black/10 overflow-hidden`} viewBox="0 0 36 36">
          <clipPath id="cp-nl"><circle cx="18" cy="18" r="18" /></clipPath>
          <g clipPath="url(#cp-nl)">
            <rect x="0" y="0" width="36" height="12" fill="#AE1C28" />
            <rect x="0" y="12" width="36" height="12" fill="#FFFFFF" />
            <rect x="0" y="24" width="36" height="12" fill="#21468B" />
          </g>
        </svg>
      );
    case 'franca':
      return (
        <svg className={`${className} rounded-full shrink-0 shadow-sm border border-black/10 overflow-hidden`} viewBox="0 0 36 36">
          <clipPath id="cp-fr"><circle cx="18" cy="18" r="18" /></clipPath>
          <g clipPath="url(#cp-fr)">
            <rect x="0" y="0" width="12" height="36" fill="#0055A4" />
            <rect x="12" y="0" width="12" height="36" fill="#FFFFFF" />
            <rect x="24" y="0" width="12" height="36" fill="#EF4135" />
          </g>
        </svg>
      );
    case 'portugal':
      return (
        <svg className={`${className} rounded-full shrink-0 shadow-sm border border-black/10 overflow-hidden`} viewBox="0 0 36 36">
          <clipPath id="cp-pt"><circle cx="18" cy="18" r="18" /></clipPath>
          <g clipPath="url(#cp-pt)">
            <rect x="0" y="0" width="14" height="36" fill="#046A38" />
            <rect x="14" y="0" width="22" height="36" fill="#DA291C" />
            <circle cx="14" cy="18" r="4.5" fill="#FFDF00" stroke="#002776" strokeWidth="0.8" />
          </g>
        </svg>
      );
    case 'argentina':
      return (
        <svg className={`${className} rounded-full shrink-0 shadow-sm border border-black/10 overflow-hidden`} viewBox="0 0 36 36">
          <clipPath id="cp-ar"><circle cx="18" cy="18" r="18" /></clipPath>
          <g clipPath="url(#cp-ar)">
            <rect x="0" y="0" width="36" height="12" fill="#74ACDF" />
            <rect x="0" y="12" width="36" height="12" fill="#FFFFFF" />
            <rect x="0" y="24" width="36" height="12" fill="#74ACDF" />
            <circle cx="18" cy="18" r="3" fill="#F6B40E" />
          </g>
        </svg>
      );
    case 'mexico':
      return (
        <svg className={`${className} rounded-full shrink-0 shadow-sm border border-black/10 overflow-hidden`} viewBox="0 0 36 36">
          <clipPath id="cp-mx"><circle cx="18" cy="18" r="18" /></clipPath>
          <g clipPath="url(#cp-mx)">
            <rect x="0" y="0" width="12" height="36" fill="#006847" />
            <rect x="12" y="0" width="12" height="36" fill="#FFFFFF" />
            <rect x="24" y="0" width="12" height="36" fill="#CE1126" />
            <circle cx="18" cy="18" r="2.5" fill="#7B5533" />
          </g>
        </svg>
      );
    case 'chile':
      return (
        <svg className={`${className} rounded-full shrink-0 shadow-sm border border-black/10 overflow-hidden`} viewBox="0 0 36 36">
          <clipPath id="cp-cl"><circle cx="18" cy="18" r="18" /></clipPath>
          <g clipPath="url(#cp-cl)">
            <rect x="0" y="0" width="18" height="18" fill="#0039A6" />
            <rect x="18" y="0" width="18" height="18" fill="#FFFFFF" />
            <rect x="0" y="18" width="36" height="18" fill="#D52B1E" />
            <polygon fill="#FFFFFF" points="9,5 10.5,9 14.5,9 11.2,11.5 12.5,15.5 9,13 5.5,15.5 6.8,11.5 3.5,9 7.5,9" />
          </g>
        </svg>
      );
    case 'clubes-internacionais':
      return (
        <svg className={`${className} rounded-full shrink-0 shadow-sm border border-black/10`} viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="18" fill="#10B981" />
          <circle cx="18" cy="18" r="13" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
          <ellipse cx="18" cy="18" rx="7" ry="13" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
          <line x1="5" y1="18" x2="31" y2="18" stroke="#FFFFFF" strokeWidth="1.5" />
        </svg>
      );
    case 'jogos-do-dia':
      return (
        <svg className={`${className} rounded-full shrink-0 shadow-sm border border-black/10`} viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="18" fill="#F59E0B" />
          <rect x="8.5" y="9.5" width="19" height="17" rx="3" fill="#FFFFFF" />
          <rect x="8.5" y="9.5" width="19" height="6" rx="2" fill="#DC2626" />
          <circle cx="13" cy="8" r="1.5" fill="#FFFFFF" />
          <circle cx="23" cy="8" r="1.5" fill="#FFFFFF" />
          <circle cx="13.5" cy="19.5" r="1.3" fill="#374151" />
          <circle cx="18" cy="19.5" r="1.3" fill="#374151" />
          <circle cx="22.5" cy="19.5" r="1.3" fill="#374151" />
          <circle cx="13.5" cy="23" r="1.3" fill="#374151" />
          <circle cx="18" cy="23" r="1.3" fill="#374151" />
        </svg>
      );
    default:
      return <span className={`${className} flex items-center justify-center text-xs`}>⚽</span>;
  }
};

interface PaisMenuItem {
  nome: string;
  codigo: string;
  paisFiltro: string;
}

const PAISES_MENU: PaisMenuItem[] = [
  { nome: 'Brasil', codigo: 'brasil', paisFiltro: 'Brasil' },
  { nome: 'Clubes Internacionais', codigo: 'clubes-internacionais', paisFiltro: 'Clubes Internacionais' },
];

export const SidebarLeft: React.FC = () => {
  const { 
    filtros, 
    setIdEsporte, 
    setIdCampeonato, 
    setPaisFiltro,
    setDataFiltro, 
    abaAtiva, 
    setAbaAtiva,
    sidebarMobileAberto,
    setSidebarMobileAberto,
    totalAoVivo,
    contagemPorCampeonato,
  } = useBetting();

  const [campeonatos, setCampeonatos] = useState<Campeonato[]>([]);
  const [futebolAberto, setFutebolAberto] = useState(true);
  const [jogosDoDiaAberto, setJogosDoDiaAberto] = useState(false);
  const [paisesAbertos, setPaisesAbertos] = useState<Record<string, boolean>>({
    'Brasil': true
  });
  const [codigoBuscaRapida, setCodigoBuscaRapida] = useState('');

  useEffect(() => {
    ApiService.getCampeonatos().then(setCampeonatos);
  }, []);

  const togglePais = (paisNome: string) => {
    setPaisesAbertos(prev => ({
      ...prev,
      [paisNome]: !prev[paisNome]
    }));
  };

  // Monta dinamicamente a lista de dias baseada em new Date()
  const getDiasMenu = () => {
    const agora = new Date();
    const amanha = new Date(agora);
    amanha.setDate(agora.getDate() + 1);

    const dias = [
      { rotulo: 'Todos os Jogos', valor: 'todos' },
      { rotulo: `Hoje - Domingo (${agora.getDate()}/${agora.getMonth() + 1})`, valor: 'hoje' },
      { rotulo: `Amanhã - Segunda-feira (${amanha.getDate()}/${amanha.getMonth() + 1})`, valor: 'amanha' },
    ];

    const diasSemanaNomes = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    for (let i = 2; i <= 7; i++) {
      const d = new Date(agora);
      d.setDate(agora.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      dias.push({
        rotulo: `${diasSemanaNomes[d.getDay()]} (${dd}/${mm})`,
        valor: `${yyyy}-${mm}-${dd}`
      });
    }
    return dias;
  };

  const handleBuscarCodigo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoBuscaRapida.trim()) return;
    setAbaAtiva('conferir');
    sessionStorage.setItem('radar_bet_codigo_pesquisa', codigoBuscaRapida.trim().toUpperCase());
    setCodigoBuscaRapida('');
  };

  const renderMenuContent = (isMobile: boolean = false) => (
    <>
      {/* Mobile Header com Botão Fechar */}
      {isMobile && (
        <div className="p-3.5 bg-[#001552] border-b border-[#0D2D8F] flex items-center justify-between text-white shadow-md">
          <div className="flex items-center gap-2">
            <img src="/logo.jpg" alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-white/20" />
            <div>
              <span className="font-black text-sm uppercase tracking-wider block">Menu & Ligas</span>
              <span className="text-[10px] text-blue-200">Navegue pelas competições</span>
            </div>
          </div>
          <button
            onClick={() => setSidebarMobileAberto(false)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Navigation Menu */}
      <div className="p-2.5 space-y-1.5 flex-1 overflow-y-auto">
        {/* Início (Dark Blue Button conforme Foto 5) */}
        <button
          onClick={() => {
            setAbaAtiva('apostador');
            setIdEsporte(102);
            setIdCampeonato(undefined);
            setPaisFiltro(undefined);
            setDataFiltro('todos');
            if (isMobile) setSidebarMobileAberto(false);
          }}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
            abaAtiva === 'apostador' && !filtros.idCampeonato && !filtros.paisFiltro && filtros.dataFiltro === 'todos'
              ? 'bg-[#00227B] text-white shadow'
              : 'bg-[#001D6E] text-white hover:bg-[#00268F]'
          }`}
        >
          <Home className="w-4 h-4 text-blue-300 shrink-0" />
          <span className="font-extrabold tracking-wide">Início</span>
        </button>

        {/* Futebol Header */}
        <div className="space-y-1 pt-0.5">
          <button
            onClick={() => setFutebolAberto(!futebolAberto)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-black bg-[#001D6E] text-white hover:bg-[#00268F] transition-all shadow"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base">⚽</span>
              <span className="tracking-wide">Futebol</span>
            </div>
            {futebolAberto ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          {futebolAberto && (
            <div className="space-y-1 pl-1 pt-1">
              {/* 📅 JOGOS DO DIA */}
              <div className="rounded-lg overflow-hidden border border-gray-300/30">
                <button
                  onClick={() => setJogosDoDiaAberto(!jogosDoDiaAberto)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold transition-colors ${
                    jogosDoDiaAberto || (filtros.dataFiltro && filtros.dataFiltro !== 'todos')
                      ? 'bg-[#D1D5DB] text-gray-950 font-extrabold'
                      : 'bg-white text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <CountryLogoBadge codigo="jogos-do-dia" className="w-5 h-5" />
                    <span className="truncate">Jogos do Dia</span>
                  </div>
                  {jogosDoDiaAberto ? (
                    <ChevronDown className="w-4 h-4 shrink-0 text-gray-700" />
                  ) : (
                    <ChevronRight className="w-4 h-4 shrink-0 text-gray-500" />
                  )}
                </button>

                {jogosDoDiaAberto && (
                  <div className="bg-[#0A101D] p-1.5 space-y-1 border-t border-[#1A253C]">
                    {getDiasMenu().map(dia => {
                      const ativo = filtros.dataFiltro === dia.valor;
                      return (
                        <button
                          key={dia.valor}
                          onClick={() => {
                            setAbaAtiva('apostador');
                            setDataFiltro(dia.valor);
                            if (isMobile) setSidebarMobileAberto(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded text-[11px] font-semibold transition-colors flex items-center justify-between ${
                            ativo
                              ? 'bg-[#00227B] text-yellow-400 font-bold'
                              : 'text-gray-400 hover:text-white hover:bg-[#162035]'
                          }`}
                        >
                          <span>{dia.rotulo}</span>
                          {ativo && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* LISTA DE PAÍSES COM LOGOS CIRCULARES */}
              {PAISES_MENU.map(paisItem => {
                const isAberto = !!paisesAbertos[paisItem.nome];
                const ligasDoPais = campeonatos.filter(c => c.pais.toLowerCase() === paisItem.paisFiltro.toLowerCase());
                const isPaisAtivo = filtros.paisFiltro === paisItem.paisFiltro;

                return (
                  <div key={paisItem.nome} className="rounded-lg overflow-hidden border border-gray-300/30">
                    <button
                      onClick={() => togglePais(paisItem.nome)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold transition-all ${
                        isPaisAtivo || isAberto
                          ? 'bg-[#D1D5DB] text-gray-950 font-extrabold'
                          : 'bg-white text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <CountryLogoBadge codigo={paisItem.codigo} className="w-5 h-5" />
                        <span className="truncate">{paisItem.nome}</span>
                      </div>
                      {isAberto ? (
                        <ChevronDown className="w-4 h-4 shrink-0 text-gray-700" />
                      ) : (
                        <ChevronRight className="w-4 h-4 shrink-0 text-gray-500" />
                      )}
                    </button>

                    {isAberto && (
                      <div className="bg-[#0A101D] p-1.5 space-y-1 border-t border-[#1A253C]">
                        {/* Botão de todos deste país */}
                        <button
                          onClick={() => {
                            setAbaAtiva('apostador');
                            setIdEsporte(102);
                            setPaisFiltro(paisItem.paisFiltro);
                            setIdCampeonato(undefined);
                            if (isMobile) setSidebarMobileAberto(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded text-[11px] font-semibold transition-colors flex items-center justify-between ${
                            filtros.paisFiltro === paisItem.paisFiltro && !filtros.idCampeonato
                              ? 'bg-[#00227B] text-yellow-400 font-bold'
                              : 'text-gray-400 hover:text-white hover:bg-[#162035]'
                          }`}
                        >
                          <span>Todos de {paisItem.nome}</span>
                        </button>

                        {/* Campeonatos específicos do país */}
                        {ligasDoPais.map(liga => {
                          const ligaAtiva = filtros.idCampeonato === liga.id;
                          return (
                            <button
                              key={liga.id}
                              onClick={() => {
                                setAbaAtiva('apostador');
                                setIdEsporte(102);
                                setIdCampeonato(liga.id);
                                if (isMobile) setSidebarMobileAberto(false);
                              }}
                              className={`w-full text-left px-2.5 py-1.5 rounded text-[11px] font-semibold transition-colors flex items-center justify-between ${
                                ligaAtiva
                                  ? 'bg-[#00227B] text-yellow-400 font-bold'
                                  : 'text-gray-400 hover:text-white hover:bg-[#162035]'
                              }`}
                            >
                              <span className="truncate">{liga.nome}</span>
                              {(() => {
                                const s = contagemPorCampeonato[liga.id];
                                const n = s && s.aoVivo > 0 ? s.aoVivo : s?.total ?? 0;
                                if (n <= 0) return null;
                                return (
                                  <span
                                    className={`text-[10px] font-bold font-mono ml-1 px-1.5 py-0.5 rounded-full ${
                                      s && s.aoVivo > 0
                                        ? 'bg-red-950 text-red-300 border border-red-800'
                                        : 'bg-gray-800 text-gray-400 border border-gray-700'
                                    }`}
                                  >
                                    {n}
                                  </span>
                                );
                              })()}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Ao Vivo */}
        <button
          onClick={() => {
            setAbaAtiva('apostador');
            setDataFiltro('ao_vivo');
            setIdCampeonato(undefined);
            setPaisFiltro(undefined);
            if (isMobile) setSidebarMobileAberto(false);
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-bold transition-colors ${
            filtros.dataFiltro === 'ao_vivo'
              ? 'bg-red-950/80 text-red-300 border border-red-800/60 shadow'
              : 'bg-[#101728] text-gray-300 hover:bg-[#18233C] hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <Radio className="w-4 h-4 text-gray-400" />
            <span>Ao Vivo</span>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border min-w-[1.5rem] text-center ${
              totalAoVivo > 0 ? 'bg-red-600 text-white border-red-400' : 'bg-gray-800 text-gray-400 border-gray-700'
            }`}
          >
            {totalAoVivo}
          </span>
        </button>

        {/* Regulamento */}
        <button
          onClick={() => {
            setAbaAtiva('regulamento');
            if (isMobile) setSidebarMobileAberto(false);
          }}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-colors ${
            abaAtiva === 'regulamento'
              ? 'bg-[#00227B] text-white shadow'
              : 'bg-[#101728] text-gray-300 hover:bg-[#18233C] hover:text-white'
          }`}
        >
          <FileCheck2 className="w-4 h-4 text-yellow-400" />
          <span>Regulamento</span>
        </button>

        {/* Conferir Bilhete */}
        <div className="pt-2">
          <form onSubmit={handleBuscarCodigo} className="bg-[#121A2D] p-2.5 rounded-lg border border-[#1E2942] space-y-2">
            <label className="text-[10px] font-bold text-gray-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Search className="w-3 h-3 text-blue-400" /> Conferir Bilhete
            </label>
            <div className="flex gap-1.5">
              <input
                type="text"
                placeholder="Ex: TCQG-H6UC"
                value={codigoBuscaRapida}
                onChange={e => setCodigoBuscaRapida(e.target.value.toUpperCase())}
                className="w-full bg-[#0A0E17] border border-[#232F4A] rounded px-2 py-1 text-xs text-white placeholder-gray-500 font-mono uppercase focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded text-xs font-bold transition-colors"
              >
                Ir
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-2.5 bg-[#080D17] border-t border-[#172033] text-[10px] text-gray-500 text-center">
        <p className="font-semibold text-gray-400">Terminal Esportivo v2.5</p>
        <p>Cotações em tempo real Horário de Brasília</p>
      </div>
    </>
  );

  return (
    <>
      {/* DESKTOP SIDEBAR (lg e telas maiores) */}
      <aside className="hidden lg:flex w-64 bg-[#0A0F1D] border-r border-[#1B2438] flex-col shrink-0 text-gray-200 select-none">
        {renderMenuContent(false)}
      </aside>

      {/* MOBILE DRAWER (aparece quando o usuário clica no botão menu no celular) */}
      {sidebarMobileAberto && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Fundo escuro com clique para fechar */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setSidebarMobileAberto(false)}
          />
          {/* Drawer que desliza da esquerda */}
          <div className="relative w-72 max-w-[85vw] bg-[#0A0F1D] border-r border-[#1B2438] flex flex-col h-full z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            {renderMenuContent(true)}
          </div>
        </div>
      )}
    </>
  );
};

