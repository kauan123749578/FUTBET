import React from 'react';
import { useBetting } from '../context/BettingContext';
import {
  Ticket,
  Search,
  FileText,
  UserPlus,
  Lock,
  LogOut,
  Crown,
  Briefcase,
  Menu,
  Trophy,
} from 'lucide-react';

const navLinkClass = (active: boolean) =>
  `px-3 py-2 text-xs font-semibold transition-colors border-b-2 ${
    active
      ? 'text-white border-yellow-400'
      : 'text-gray-400 border-transparent hover:text-gray-100 hover:border-gray-500'
  }`;

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
    totalAoVivo,
  } = useBetting();

  return (
    <>
      <header className="bg-[#001D6E] border-b border-[#0D2D8F] text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-[1920px] mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setSidebarMobileAberto(!sidebarMobileAberto)}
              className="lg:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Abrir menu"
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
              className="flex items-center gap-2.5 text-left focus:outline-none group min-w-0"
            >
              <img
                src="/logo.jpg"
                alt="FUTBET"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-white/15 shrink-0"
              />
              <div className="min-w-0 leading-none">
                <span className="font-brand text-lg sm:text-xl font-bold tracking-tight text-white uppercase block">
                  FUT<span className="text-yellow-400">BET</span>
                </span>
                <span className="font-brand block text-[8px] sm:text-[9px] text-blue-200/90 uppercase tracking-[0.2em] mt-0.5">
                  Terminal Esportivo & Banca
                </span>
              </div>
            </button>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            <button onClick={() => setAbaAtiva('apostador')} className={navLinkClass(abaAtiva === 'apostador')}>
              Apostas Esportivas
            </button>
            <button onClick={() => setAbaAtiva('conferir')} className={navLinkClass(abaAtiva === 'conferir')}>
              Conferir Bilhete
            </button>
            <button onClick={() => setAbaAtiva('regulamento')} className={navLinkClass(abaAtiva === 'regulamento')}>
              Regulamento
            </button>
            {sessaoOperador && (
              <button
                onClick={() => setAbaAtiva(sessaoOperador.role === 'dono' ? 'admin' : 'cambista')}
                className={navLinkClass(abaAtiva === 'admin' || abaAtiva === 'cambista')}
              >
                {sessaoOperador.role === 'dono' ? 'Painel Dono' : 'Painel Cambista'}
              </button>
            )}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => {
                setAbaAtiva('apostador');
                setDataFiltro('ao_vivo');
                setIdCampeonato(undefined);
              }}
              className="hidden lg:flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 px-2 py-1.5 transition-colors"
              title="Jogos ao vivo"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${totalAoVivo > 0 ? 'bg-red-500 animate-pulse' : 'bg-gray-600'}`} />
              <span>Ao vivo</span>
              <span className="font-mono text-gray-300">{totalAoVivo}</span>
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('cupom-sidebar');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="relative flex items-center gap-1 border border-[#2a3654] text-gray-200 hover:bg-white/5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cupom</span>
              {itensCupom.length > 0 && (
                <span className="bg-yellow-400 text-[#0a1628] text-[10px] min-w-[1.1rem] h-[1.1rem] rounded-full flex items-center justify-center font-bold">
                  {itensCupom.length}
                </span>
              )}
            </button>

            {sessaoCliente ? (
              <div className="flex items-center gap-1 border border-[#2a3654] px-2 py-1.5 rounded-md text-xs max-w-[120px]">
                <span className="text-gray-200 font-medium truncate" title={sessaoCliente.nome}>
                  {sessaoCliente.nome.split(' ')[0]}
                </span>
                <button type="button" onClick={logoutCliente} className="text-gray-500 hover:text-red-400 shrink-0" title="Sair">
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => abrirCadastroCliente('cadastro')}
                className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-[#0a1628] px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-bold transition-colors"
                id="btn-cadastrar-cliente"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Entrar</span>
              </button>
            )}

            {sessaoOperador ? (
              <div className="hidden sm:flex items-center gap-1 border border-[#2a3654] px-2 py-1.5 rounded-md text-xs">
                <span className="text-gray-300 flex items-center gap-1 truncate max-w-[100px]">
                  {sessaoOperador.role === 'dono' ? (
                    <Crown className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                  ) : (
                    <Briefcase className="w-3.5 h-3.5 shrink-0" />
                  )}
                  {sessaoOperador.nome.split(' ')[0]}
                </span>
                <button onClick={logoutOperador} className="text-gray-500 hover:text-red-400" title="Sair">
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setModalLoginOperadorAberto(true)}
                className="hidden sm:flex items-center gap-1 text-gray-400 hover:text-white px-2 py-1.5 text-xs transition-colors"
                title="Operadores"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Operadores</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#050B1A] border-t border-[#121E3E] px-2 py-1.5 shadow-2xl flex items-center justify-around text-gray-400">
        <button
          onClick={() => {
            setAbaAtiva('apostador');
            setDataFiltro('todos');
            setIdCampeonato(undefined);
          }}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-lg text-[10px] font-semibold ${
            abaAtiva === 'apostador' ? 'text-white' : 'hover:text-gray-200'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Apostas</span>
        </button>
        <button
          onClick={() => setSidebarMobileAberto(true)}
          className="flex flex-col items-center gap-0.5 p-1 rounded-lg text-[10px] font-semibold hover:text-gray-200"
        >
          <Menu className="w-4 h-4" />
          <span>Ligas</span>
        </button>
        <button
          onClick={() => setAbaAtiva('conferir')}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-lg text-[10px] font-semibold ${
            abaAtiva === 'conferir' ? 'text-white' : 'hover:text-gray-200'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Conferir</span>
        </button>
        <button
          type="button"
          onClick={() => abrirCadastroCliente(sessaoCliente ? 'login' : 'cadastro')}
          className="flex flex-col items-center gap-0.5 p-1 rounded-lg text-[10px] font-bold text-yellow-400"
        >
          <UserPlus className="w-4 h-4" />
          <span>{sessaoCliente ? 'Conta' : 'Entrar'}</span>
        </button>
        <button
          onClick={() => {
            const el = document.getElementById('cupom-sidebar');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="flex flex-col items-center gap-0.5 p-1 rounded-lg text-[10px] font-semibold relative hover:text-gray-200"
        >
          <Ticket className="w-4 h-4" />
          <span>Cupom</span>
          {itensCupom.length > 0 && (
            <span className="absolute -top-0.5 right-0 bg-yellow-400 text-[#0a1628] text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {itensCupom.length}
            </span>
          )}
        </button>
      </div>
    </>
  );
};
