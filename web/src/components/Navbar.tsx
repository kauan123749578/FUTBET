import React, { useState } from 'react';
import { useBetting } from '../context/BettingContext';
import { 
  Ticket, 
  Search, 
  FileText, 
  Smartphone, 
  UserPlus, 
  Lock,
  LogOut,
  Crown,
  Briefcase,
  Menu
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    abaAtiva, 
    setAbaAtiva, 
    itensCupom, 
    setDataFiltro, 
    setIdCampeonato,
    sessaoOperador,
    setModalLoginOperadorAberto,
    logoutOperador,
    sidebarMobileAberto,
    setSidebarMobileAberto,
    sessaoCliente,
    logoutCliente,
    abrirCadastroCliente,
  } = useBetting();
  const [totalAoVivo, setTotalAoVivo] = useState(0);

  React.useEffect(() => {
    const fetchAoVivo = () => {
      fetch('/api/jogos-ao-vivo')
        .then(r => r.json())
        .then(d => {
          if (typeof d.total === 'number') setTotalAoVivo(d.total);
        })
        .catch(() => {});
    };
    fetchAoVivo();
    const interval = setInterval(fetchAoVivo, 20000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
    <header className="bg-[#001D6E] border-b border-[#0D2D8F] text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-[1920px] mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between">
        {/* Brand / Logo + Mobile Hamburger Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* BOTÃO MOBILE PARA ABRIR O SIDEBAR NO CELULAR */}
          <button
            onClick={() => setSidebarMobileAberto(!sidebarMobileAberto)}
            className="lg:hidden p-2 rounded-lg bg-[#001552] border border-[#0A267A] text-yellow-400 hover:bg-[#00227B] transition-transform active:scale-95 shadow"
            title="Abrir Menu de Ligas e Jogos"
            id="btn-sidebar-mobile-toggle"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button 
            onClick={() => {
              setAbaAtiva('apostador');
              setDataFiltro('todos');
              setIdCampeonato(undefined);
            }} 
            className="flex items-center gap-2 text-left focus:outline-none group"
          >
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow">
              <span className="text-xl">⚽</span>
            </div>
            <div>
              <span className="text-lg sm:text-xl font-black tracking-wider text-white group-hover:text-yellow-400 transition-colors uppercase">
                FUT<span className="text-yellow-400">BET</span>
              </span>
              <span className="block text-[9px] sm:text-[10px] text-blue-200 uppercase tracking-widest font-semibold">
                Terminal Esportivo & Banca
              </span>
            </div>
          </button>
        </div>

        {/* Center / Navigation tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-[#001552] p-1 rounded-lg border border-[#0A267A]">
          <button
            onClick={() => setAbaAtiva('apostador')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
              abaAtiva === 'apostador'
                ? 'bg-yellow-400 text-blue-950 shadow'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>⚽</span> Apostas Esportivas
          </button>

          <button
            onClick={() => setAbaAtiva('conferir')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
              abaAtiva === 'conferir'
                ? 'bg-yellow-400 text-blue-950 shadow'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Search className="w-3.5 h-3.5" /> Conferir Bilhete
          </button>

          {/* Abas exclusivas para Operador autenticado */}
          {sessaoOperador && (
            <button
              onClick={() => setAbaAtiva(sessaoOperador.role === 'dono' ? 'admin' : 'cambista')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-black transition-all flex items-center gap-1.5 shadow ${
                abaAtiva === 'admin' || abaAtiva === 'cambista'
                  ? 'bg-yellow-400 text-blue-950 font-black ring-2 ring-yellow-300'
                  : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 hover:bg-yellow-500/30'
              }`}
            >
              <span>{sessaoOperador.role === 'dono' ? '👑 Painel Dono' : '💼 Painel Cambista'}</span>
            </button>
          )}

          <button
            onClick={() => setAbaAtiva('regulamento')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
              abaAtiva === 'regulamento'
                ? 'bg-yellow-400 text-blue-950 shadow'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Regulamento
          </button>
        </nav>

        {/* Right quick stats */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => {
              setAbaAtiva('apostador');
              setDataFiltro('ao_vivo');
              setIdCampeonato(undefined);
            }}
            className="hidden lg:flex items-center gap-2 bg-[#001552] hover:bg-[#00227B] border border-[#0A267A] px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors"
            title="Ver todos os jogos Ao Vivo"
          >
            <span className="flex h-2 w-2 relative">
              {totalAoVivo > 0 ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-500"></span>
              )}
            </span>
            <span className="font-semibold text-gray-300">Ao Vivo:</span>
            <span className={`font-bold ${totalAoVivo > 0 ? 'text-red-400 font-mono' : 'text-gray-400'}`}>
              {totalAoVivo} {totalAoVivo === 1 ? 'partida' : 'partidas'}
            </span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const el = document.getElementById('cupom-sidebar');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-green-500 hover:bg-green-400 text-gray-950 px-3 py-1.5 rounded-md font-bold text-xs flex items-center gap-1.5 shadow transition-colors"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Cupom</span>
              {itensCupom.length > 0 && (
                <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
                  {itensCupom.length}
                </span>
              )}
            </button>

            {sessaoCliente ? (
              <div className="flex items-center gap-1 bg-[#001552] border border-[#0A267A] px-2 py-1.5 rounded-md text-xs max-w-[140px]">
                <span className="text-yellow-300 font-bold truncate" title={sessaoCliente.nome}>
                  {sessaoCliente.nome.split(' ')[0]}
                </span>
                <button
                  type="button"
                  onClick={logoutCliente}
                  className="text-red-400 hover:text-red-300 p-0.5 shrink-0"
                  title="Sair da conta"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => abrirCadastroCliente('cadastro')}
                className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-blue-950 px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-black transition-all shadow active:scale-95"
                title="Criar conta ou entrar"
                id="btn-cadastrar-cliente"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Entrar</span>
              </button>
            )}

            <a
              href="https://wa.me/"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors"
              title="Suporte via WhatsApp"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>

            {/* Acesso seguro para operadores (Dono e Cambistas) */}
            {sessaoOperador ? (
              <div className="flex items-center gap-1.5 bg-[#001552] border border-[#0A267A] px-2 sm:px-2.5 py-1.5 rounded-md text-xs">
                <span className="text-[11px] text-yellow-300 font-bold flex items-center gap-1">
                  {sessaoOperador.role === 'dono' ? <Crown className="w-3.5 h-3.5 text-yellow-400" /> : <Briefcase className="w-3.5 h-3.5 text-blue-400" />}
                  <span className="hidden sm:inline">{sessaoOperador.nome}</span>
                </span>
                <button
                  onClick={logoutOperador}
                  title="Sair do painel"
                  className="text-red-400 hover:text-red-300 ml-1 p-0.5 rounded hover:bg-white/10"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setModalLoginOperadorAberto(true)}
                className="flex items-center gap-1.5 bg-[#001552] hover:bg-[#00288E] border border-[#0A267A] text-gray-300 hover:text-white px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors shadow-sm"
                title="Acesso seguro com login para Dono e Cambistas"
              >
                <Lock className="w-3.5 h-3.5 text-yellow-400" />
                <span className="hidden sm:inline">Operadores</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>

    {/* BARRA FIXA INFERIOR PARA CELULARES (MOBILE BOTTOM DOCK) */}
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#050B1A] border-t border-[#121E3E] px-2 py-1.5 shadow-2xl flex items-center justify-around text-gray-300">
      <button
        onClick={() => {
          setAbaAtiva('apostador');
          setDataFiltro('todos');
          setIdCampeonato(undefined);
        }}
        className={`flex flex-col items-center gap-0.5 p-1 rounded-lg text-[10px] font-bold ${
          abaAtiva === 'apostador' ? 'text-yellow-400' : 'hover:text-white'
        }`}
      >
        <span className="text-base">⚽</span>
        <span>Apostas</span>
      </button>

      <button
        onClick={() => setSidebarMobileAberto(true)}
        className="flex flex-col items-center gap-0.5 p-1 rounded-lg text-[10px] font-bold text-blue-400 hover:text-blue-300"
      >
        <Menu className="w-4 h-4" />
        <span>Ligas & Jogos</span>
      </button>

      <button
        onClick={() => setAbaAtiva('conferir')}
        className={`flex flex-col items-center gap-0.5 p-1 rounded-lg text-[10px] font-bold ${
          abaAtiva === 'conferir' ? 'text-yellow-400' : 'hover:text-white'
        }`}
      >
        <Search className="w-4 h-4" />
        <span>Conferir</span>
      </button>

      <button
        type="button"
        onClick={() => abrirCadastroCliente(sessaoCliente ? 'login' : 'cadastro')}
        className="flex flex-col items-center gap-0.5 p-1 rounded-lg text-[10px] font-bold text-yellow-400 hover:text-yellow-300"
      >
        <UserPlus className="w-4 h-4 text-yellow-400" />
        <span>{sessaoCliente ? 'Conta' : 'Entrar'}</span>
      </button>

      <button
        onClick={() => {
          const el = document.getElementById('cupom-sidebar');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        className="flex flex-col items-center gap-0.5 p-1 rounded-lg text-[10px] font-bold text-green-400 relative"
      >
        <Ticket className="w-4 h-4" />
        <span>Cupom</span>
        {itensCupom.length > 0 && (
          <span className="absolute -top-1 right-1 bg-red-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-black">
            {itensCupom.length}
          </span>
        )}
      </button>
    </div>
    </>
  );
};
