import React, { useState, useEffect } from 'react';
import { ApiService, BILHETES_FOTO_INICIAIS } from '../services/api';
import { BilheteAdmin, CambistaModel, ClienteModel, ConfiguracoesBanca, ResumoCaixaDono } from '../types/betting';
import { 
  Home, 
  Key, 
  Tv, 
  PlusCircle, 
  Wallet, 
  BarChart3, 
  FileText, 
  Lock, 
  Users, 
  ListFilter, 
  Search, 
  Printer, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  UserPlus, 
  Settings, 
  MessageCircle, 
  DollarSign, 
  ChevronDown, 
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Check,
  Copy,
  Edit,
  Trash2,
  Menu,
  Phone,
  Percent,
  CreditCard,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useBetting } from '../context/BettingContext';

interface AdminPainelProps {
  onVoltarSimulador?: () => void;
}

export const AdminPainelDesktopView: React.FC<AdminPainelProps> = ({ onVoltarSimulador }) => {
  const { logoutOperador, setModalCadastroClienteAberto } = useBetting();

  // Sub-abas do menu lateral esquerdo
  const [menuAtivo, setMenuAtivo] = useState<
    'cambistas' | 'clientes' | 'bilhetes' | 'inicio' | 'caixa' | 'relatorios' | 'conferir' | 'regulamento' | 'senha' | 'whatsapp'
  >('cambistas');

  const [sidebarMobileAberto, setSidebarMobileAberto] = useState(false);

  // Estados principais
  const [bilhetes, setBilhetes] = useState<BilheteAdmin[]>(BILHETES_FOTO_INICIAIS);
  const [cambistas, setCambistas] = useState<CambistaModel[]>([]);
  const [clientes, setClientes] = useState<ClienteModel[]>([]);
  const [caixa, setCaixa] = useState<ResumoCaixaDono | null>(null);
  const [configs, setConfigs] = useState<ConfiguracoesBanca>({
    whatsapp_dono: '5511999999999',
    chave_pix: '11999999999',
    nome_banca: 'FUTBET',
    comissao_padrao: '10.0',
    limite_padrao_cambista: '2000.00'
  });

  // Filtros da Tabela de Bilhetes
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [termoBusca, setTermoBusca] = useState<string>('');
  const [carregando, setCarregando] = useState(false);

  // Modais de Cambista
  const [modalNovoCambista, setModalNovoCambista] = useState(false);
  const [modalEditarCambista, setModalEditarCambista] = useState(false);
  const [cambistaEmEdicao, setCambistaEmEdicao] = useState<CambistaModel | null>(null);

  // Form Cambista (Novo ou Edição)
  const [formCambista, setFormCambista] = useState({
    nome: '',
    usuario: '',
    whatsapp: '',
    comissao_pct: 10,
    limite_credito: 2000,
    senha: '',
    status: 'ativo' as 'ativo' | 'bloqueado'
  });

  // Modal Novo Cliente
  const [modalNovoCliente, setModalNovoCliente] = useState(false);
  const [formCliente, setFormCliente] = useState({
    nome: '',
    telefone: '',
    senha: '',
    saldo_inicial: 0
  });

  // Carregar dados
  const recarregarTodosDados = async () => {
    setCarregando(true);
    try {
      const [listaBilhetes, listaCambistas, listaClientes, dadosCaixa, configBanca] = await Promise.all([
        ApiService.listarTodosBilhetesAdmin(),
        ApiService.listarCambistas(),
        ApiService.listarClientes(),
        ApiService.obterResumoCaixaDono(),
        ApiService.obterConfigs()
      ]);
      setBilhetes(listaBilhetes);
      setCambistas(listaCambistas);
      setClientes(listaClientes);
      setCaixa(dadosCaixa);
      setConfigs(configBanca);
    } catch (e) {
      console.error('Erro ao recarregar dados do admin:', e);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    recarregarTodosDados();
  }, []);

  // Handlers para Cambista
  const abrirModalEditar = (c: CambistaModel) => {
    setCambistaEmEdicao(c);
    setFormCambista({
      nome: c.nome,
      usuario: c.usuario,
      whatsapp: c.whatsapp || c.telefone || '',
      comissao_pct: c.comissao_pct,
      limite_credito: c.limite_credito,
      senha: '',
      status: c.status
    });
    setModalEditarCambista(true);
  };

  const handleSalvarEdicaoCambista = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cambistaEmEdicao) return;

    const payload: any = {
      nome: formCambista.nome.trim(),
      telefone: formCambista.whatsapp.trim(),
      comissao_pct: Number(formCambista.comissao_pct),
      limite_credito: Number(formCambista.limite_credito),
      status: formCambista.status
    };
    if (formCambista.senha.trim()) {
      payload.senha = formCambista.senha.trim();
    }

    const ok = await ApiService.atualizarCambista(cambistaEmEdicao.id, payload);
    if (ok) {
      confetti({ particleCount: 50, spread: 60 });
      setModalEditarCambista(false);
      setCambistaEmEdicao(null);
      await recarregarTodosDados();
    } else {
      alert('Erro ao atualizar cambista.');
    }
  };

  const handleCadastrarCambista = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCambista.nome.trim() || !formCambista.usuario.trim()) {
      alert('Preencha ao menos Nome e Usuário do Cambista.');
      return;
    }

    const payload = {
      nome: formCambista.nome.trim(),
      usuario: formCambista.usuario.trim().startsWith('@') ? formCambista.usuario.trim() : `@${formCambista.usuario.trim()}`,
      telefone: formCambista.whatsapp.trim() || '11999999999',
      comissao_pct: Number(formCambista.comissao_pct) || 10,
      limite_credito: Number(formCambista.limite_credito) || 2000,
      senha: formCambista.senha.trim() || '123456'
    };

    const ok = await ApiService.criarCambista(payload);
    if (ok) {
      confetti({ particleCount: 70, spread: 70 });
      setModalNovoCambista(false);
      setFormCambista({
        nome: '',
        usuario: '',
        whatsapp: '',
        comissao_pct: 10,
        limite_credito: 2000,
        senha: '',
        status: 'ativo'
      });
      await recarregarTodosDados();
    } else {
      alert('Erro ao cadastrar cambista.');
    }
  };

  const handleExcluirCambista = async (c: CambistaModel) => {
    if (!window.confirm(`Tem certeza absoluta que deseja REMOVER o cambista "${c.nome}" (@${c.usuario})?\nEsta ação não poderá ser desfeita.`)) {
      return;
    }

    const ok = await ApiService.deletarCambista(c.id);
    if (ok) {
      alert(`Cambista ${c.nome} removido com sucesso.`);
      await recarregarTodosDados();
    } else {
      alert('Erro ao remover cambista.');
    }
  };

  // Handlers para Clientes
  const handleCadastrarCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCliente.nome.trim() || !formCliente.telefone.trim()) {
      alert('Preencha o Nome e o Telefone/WhatsApp do cliente.');
      return;
    }

    const payload = {
      nome: formCliente.nome.trim(),
      telefone: formCliente.telefone.trim(),
      senha: formCliente.senha.trim() || '123456',
      saldo: Number(formCliente.saldo_inicial) || 0
    };

    const res = await ApiService.cadastrarCliente(payload);
    if (res.sucesso) {
      confetti({ particleCount: 60, spread: 60 });
      setModalNovoCliente(false);
      setFormCliente({ nome: '', telefone: '', senha: '', saldo_inicial: 0 });
      await recarregarTodosDados();
    } else {
      alert(res.erro || 'Erro ao cadastrar cliente.');
    }
  };

  // Métricas de Cambistas
  const totalOperadores = cambistas.length;
  const totalValidadoCambistas = cambistas.reduce((acc, c) => acc + (c.total_apostas || 0), 0);
  const totalComissoesPagas = cambistas.reduce((acc, c) => acc + (c.comissao_acumulada || (c.total_apostas || 0) * (c.comissao_pct / 100)), 0);
  const repasseBanca = totalValidadoCambistas - totalComissoesPagas;

  return (
    <div className="min-h-screen bg-[#070D1E] text-gray-100 flex flex-col font-sans select-none">
      {/* Top Bar idêntica à Foto 1 do Usuário */}
      <header className="bg-[#050B1A] border-b border-[#121E3E] text-white sticky top-0 z-40 px-3 sm:px-6 py-2.5 shadow-xl">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-3">
          {/* Logo & Subtítulo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarMobileAberto(!sidebarMobileAberto)}
              className="lg:hidden p-2 rounded-lg bg-[#0E1A38] text-white hover:bg-[#162957] transition-colors"
              title="Abrir Menu Lateral"
            >
              <Menu className="w-5 h-5 text-yellow-400" />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xl">⚽</span>
              <span className="text-base font-black tracking-wide text-white">
                futbet.com.br<span className="text-blue-400">/admin/gestao</span>
              </span>
            </div>
          </div>

          {/* Badges e Ações Topo */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
            <div className="hidden md:flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-md text-xs font-bold text-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>Dono da Banca</span>
            </div>

            <div className="hidden sm:flex items-center gap-2 bg-[#0B1530] border border-[#192B5A] px-3 py-1 rounded-md text-xs">
              <span className="bg-yellow-400 text-blue-950 font-black px-1.5 py-0.5 rounded text-[10px]">ADMIN DONO</span>
              <span className="text-gray-300">Operador: <strong className="text-white">FUTBET Master</strong></span>
            </div>

            <a
              href={`https://wa.me/${configs.whatsapp_dono}`}
              target="_blank"
              rel="noreferrer"
              className="hidden lg:flex items-center gap-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-300 px-3 py-1 rounded-md text-xs font-semibold transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp da Banca</span>
            </a>

            {onVoltarSimulador && (
              <button
                onClick={onVoltarSimulador}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1 rounded-md text-xs transition-colors shadow flex items-center gap-1.5"
              >
                <span>Voltar às Apostas</span>
              </button>
            )}

            <button
              onClick={logoutOperador}
              className="bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-200 px-2.5 py-1 rounded-md text-xs font-bold transition-colors"
              title="Encerrar Sessão"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout: Sidebar Esquerda + Conteúdo Principal */}
      <div className="flex-1 max-w-[1920px] w-full mx-auto flex flex-col lg:flex-row relative">
        
        {/* BACKDROP MOBILE */}
        {sidebarMobileAberto && (
          <div 
            onClick={() => setSidebarMobileAberto(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          />
        )}

        {/* SIDEBAR ESQUERDA IDÊNTICA À FOTO 1 */}
        <aside
          className={`
            fixed lg:static top-0 bottom-0 left-0 z-50 lg:z-auto
            w-72 lg:w-64 bg-[#050B1A] border-r border-[#121E3E] flex flex-col shrink-0
            transition-transform duration-300 ease-in-out
            ${sidebarMobileAberto ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          {/* Header Mobile com Fechar */}
          <div className="lg:hidden p-3 border-b border-[#121E3E] flex items-center justify-between">
            <span className="text-xs font-black uppercase text-yellow-400 tracking-wider">Painel de Controle</span>
            <button
              onClick={() => setSidebarMobileAberto(false)}
              className="p-1 rounded-lg bg-[#0E1A38] text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-3 space-y-1 flex-1 overflow-y-auto">
            {/* Itens do Menu Lateral */}
            <button
              onClick={() => { setMenuAtivo('inicio'); setSidebarMobileAberto(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                menuAtivo === 'inicio' ? 'bg-[#00227B] text-white shadow' : 'text-gray-300 hover:text-white hover:bg-[#0E1A38]'
              }`}
            >
              <Home className="w-4 h-4 text-blue-400" />
              <span>Início</span>
            </button>

            <button
              onClick={() => { setMenuAtivo('conferir'); setSidebarMobileAberto(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                menuAtivo === 'conferir' ? 'bg-[#00227B] text-white shadow' : 'text-gray-300 hover:text-white hover:bg-[#0E1A38]'
              }`}
            >
              <Key className="w-4 h-4 text-yellow-400" />
              <span>Recuperar PIN / Conferir</span>
            </button>

            <button
              onClick={() => { if (onVoltarSimulador) onVoltarSimulador(); }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-bold text-gray-300 hover:text-white hover:bg-[#0E1A38] transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm">⚽</span>
                <span>Futebol</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </button>

            <button
              onClick={() => { if (onVoltarSimulador) onVoltarSimulador(); }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold text-red-400 hover:bg-[#0E1A38] transition-all"
            >
              <Tv className="w-4 h-4 text-red-400 animate-pulse" />
              <span>Ao Vivo</span>
            </button>

            <button
              onClick={() => { setMenuAtivo('caixa'); setSidebarMobileAberto(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                menuAtivo === 'caixa' ? 'bg-[#00227B] text-white shadow' : 'text-gray-300 hover:text-white hover:bg-[#0E1A38]'
              }`}
            >
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>Caixa Geral</span>
            </button>

            <button
              onClick={() => { setMenuAtivo('relatorios'); setSidebarMobileAberto(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                menuAtivo === 'relatorios' ? 'bg-[#00227B] text-white shadow' : 'text-gray-300 hover:text-white hover:bg-[#0E1A38]'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span>Relatórios</span>
            </button>

            <button
              onClick={() => { setMenuAtivo('regulamento'); setSidebarMobileAberto(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                menuAtivo === 'regulamento' ? 'bg-[#00227B] text-white shadow' : 'text-gray-300 hover:text-white hover:bg-[#0E1A38]'
              }`}
            >
              <FileText className="w-4 h-4 text-blue-400" />
              <span>Regulamento</span>
            </button>

            <button
              onClick={() => { setMenuAtivo('senha'); setSidebarMobileAberto(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                menuAtivo === 'senha' ? 'bg-[#00227B] text-white shadow' : 'text-gray-300 hover:text-white hover:bg-[#0E1A38]'
              }`}
            >
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Mudar Senha</span>
            </button>

            {/* LISTA DE CLIENTES (COM DESTAQUE PARA ATENDER AO PEDIDO DO USUÁRIO) */}
            <button
              onClick={() => { setMenuAtivo('clientes'); setSidebarMobileAberto(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                menuAtivo === 'clientes'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'text-emerald-300 hover:bg-emerald-950/40 hover:text-emerald-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Lista de Clientes</span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-black">
                {clientes.length}
              </span>
            </button>

            {/* BILHETES */}
            <button
              onClick={() => { setMenuAtivo('bilhetes'); setSidebarMobileAberto(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                menuAtivo === 'bilhetes' ? 'bg-[#00227B] text-white shadow' : 'text-gray-300 hover:text-white hover:bg-[#0E1A38]'
              }`}
            >
              <div className="flex items-center gap-3">
                <ListFilter className="w-4 h-4 text-cyan-400" />
                <span>Bilhetes</span>
              </div>
              <span className="text-[10px] bg-[#0E1A38] text-gray-300 px-1.5 py-0.5 rounded font-black">
                {bilhetes.length}
              </span>
            </button>

            {/* SEPARADOR PAINEL DO DONO */}
            <div className="pt-4 pb-1">
              <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase px-3">
                PAINEL DO DONO
              </span>
            </div>

            {/* GERENCIAR CAMBISTAS (SELECIONADO CONFORME FOTO 1) */}
            <button
              onClick={() => { setMenuAtivo('cambistas'); setSidebarMobileAberto(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                menuAtivo === 'cambistas'
                  ? 'bg-emerald-600 text-white shadow-lg font-black'
                  : 'text-gray-300 hover:text-white hover:bg-[#0E1A38]'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span>Gerenciar Cambistas</span>
              </div>
              <span className="text-[10px] bg-emerald-700 text-white px-1.5 py-0.5 rounded font-black">
                {cambistas.length}
              </span>
            </button>

            <button
              onClick={() => { setMenuAtivo('whatsapp'); setSidebarMobileAberto(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                menuAtivo === 'whatsapp' ? 'bg-[#00227B] text-white shadow' : 'text-gray-300 hover:text-white hover:bg-[#0E1A38]'
              }`}
            >
              <Settings className="w-4 h-4 text-yellow-400" />
              <span>WhatsApp da Banca</span>
            </button>
          </div>

          <div className="p-3 border-t border-[#121E3E] text-[11px] text-gray-500 text-center">
            Terminal FUTBET v2.5<br />
            <span className="text-emerald-400 font-semibold">● Servidor Operacional Ativo</span>
          </div>
        </aside>

        {/* CONTEÚDO PRINCIPAL (MAIN STAGE) */}
        <main className="flex-1 min-w-0 p-3 sm:p-6 overflow-y-auto">
          {/* ============================================================== */}
          {/* ABA: GERENCIAR CAMBISTAS (TELA PRINCIPAL DA FOTO 1 DO USUÁRIO) */}
          {/* ============================================================== */}
          {menuAtivo === 'cambistas' && (
            <div className="space-y-6">
              {/* Header da Aba */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                      👑 EXCLUSIVO DO DONO
                    </span>
                    <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                      <ShieldCheck className="w-6 h-6 text-emerald-400" />
                      Gerenciamento de Cambistas da Banca
                    </h1>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Cadastre cambistas, altere a comissão %, limite de crédito diário e acompanhe os repasses.
                  </p>
                </div>

                <button
                  onClick={() => setModalNovoCambista(true)}
                  className="bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Cadastrar Novo Cambista</span>
                </button>
              </div>

              {/* 4 Cards de Métricas idênticos à Foto 1 */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-[#050B1A] border border-[#14234A] rounded-xl p-4">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">CAMBISTAS ATIVOS</span>
                  <div className="text-xl sm:text-2xl font-black text-white mt-1">
                    {totalOperadores} <span className="text-xs font-normal text-gray-400">operadores</span>
                  </div>
                  <span className="text-[10px] text-gray-400 block mt-1">Trazendo clientes para a banca</span>
                </div>

                <div className="bg-[#050B1A] border border-[#14234A] rounded-xl p-4">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">TOTAL VALIDADO</span>
                  <div className="text-xl sm:text-2xl font-black text-blue-400 font-mono mt-1">
                    R$ {totalValidadoCambistas.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-gray-400 block mt-1">Volume acumulado</span>
                </div>

                <div className="bg-[#050B1A] border border-[#14234A] rounded-xl p-4">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">COMISSÕES PAGAS</span>
                  <div className="text-xl sm:text-2xl font-black text-yellow-400 font-mono mt-1">
                    R$ {totalComissoesPagas.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-gray-400 block mt-1">Ganho dos colaboradores</span>
                </div>

                <div className="bg-[#050B1A] border border-[#14234A] rounded-xl p-4">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">REPASSE PARA A BANCA</span>
                  <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-1">
                    R$ {repasseBanca.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-gray-400 block mt-1">Saldo líquido retido</span>
                </div>
              </div>

              {/* Tabela de Cambistas com HEADER AZUL ESCURO idêntico à Foto 1 */}
              <div className="bg-[#050B1A] border border-[#14234A] rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead>
                      <tr className="bg-[#00227B] text-white uppercase text-[11px] font-black tracking-wider">
                        <th className="p-3.5">Nome do Cambista</th>
                        <th className="p-3.5">Usuário</th>
                        <th className="p-3.5">WhatsApp</th>
                        <th className="p-3.5">Comissão %</th>
                        <th className="p-3.5">Limite de Crédito</th>
                        <th className="p-3.5">Total Validado</th>
                        <th className="p-3.5">Comissão Ganha</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#101D3E]">
                      {cambistas.map(c => {
                        const totalVal = c.total_apostas || 0;
                        const comissaoGanha = c.comissao_acumulada || (totalVal * (c.comissao_pct / 100));

                        return (
                          <tr key={c.id} className="hover:bg-[#0B1530] transition-colors">
                            <td className="p-3.5 font-bold text-white flex items-center gap-2">
                              <span>{c.nome}</span>
                            </td>
                            <td className="p-3.5 font-mono text-gray-300">{c.usuario}</td>
                            <td className="p-3.5">
                              <a
                                href={`https://wa.me/${(c.whatsapp || c.telefone || '').replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1.5 text-emerald-400 hover:underline font-mono"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>{c.whatsapp || c.telefone}</span>
                              </a>
                            </td>
                            <td className="p-3.5 font-black text-yellow-400 font-mono">
                              {c.comissao_pct}%
                            </td>
                            <td className="p-3.5 font-mono text-gray-300">
                              R$ {Number(c.limite_credito || 0).toFixed(2)}
                            </td>
                            <td className="p-3.5 font-mono font-bold text-blue-400">
                              R$ {totalVal.toFixed(2)}
                            </td>
                            <td className="p-3.5 font-mono font-bold text-yellow-300">
                              R$ {comissaoGanha.toFixed(2)}
                            </td>
                            <td className="p-3.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                c.status === 'ativo' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-red-500/20 text-red-300 border border-red-500/40'
                              }`}>
                                {c.status}
                              </span>
                            </td>
                            <td className="p-3.5">
                              <div className="flex items-center justify-center gap-1.5">
                                {/* Botão Editar Comissão e Dados */}
                                <button
                                  onClick={() => abrirModalEditar(c)}
                                  className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/40 px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-colors"
                                  title="Editar Porcentagem e Limite"
                                >
                                  <Edit className="w-3 h-3" />
                                  <span>Editar</span>
                                </button>

                                {/* Botão Remover / Excluir Cambista */}
                                <button
                                  onClick={() => handleExcluirCambista(c)}
                                  className="bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800/80 px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-colors"
                                  title="Remover Cambista Definitivamente"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Remover</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* ABA: LISTA DE CLIENTES E CADASTRO (ATENDE DIRETO AO PEDIDO DO USUÁRIO) */}
          {/* ============================================================== */}
          {menuAtivo === 'clientes' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-emerald-950/80 via-[#0A1F1E] to-[#050B1A] border border-emerald-500/40 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-400 text-gray-950 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                      CADASTRO DE CLIENTES
                    </span>
                    <h1 className="text-xl sm:text-2xl font-black text-white">
                      Clientes Registrados na Banca
                    </h1>
                  </div>
                  <p className="text-xs text-gray-300 mt-1 max-w-xl">
                    Aqui você visualiza todos os apostadores cadastrados pelo site ou pelo painel. Clientes podem se cadastrar pelo botão "Cadastrar" do topo ou você pode cadastrá-los manualmente aqui.
                  </p>
                </div>

                <button
                  onClick={() => setModalNovoCliente(true)}
                  className="bg-emerald-400 hover:bg-emerald-300 text-gray-950 font-black px-5 py-3 rounded-xl text-sm flex items-center gap-2 shadow-lg transition-transform active:scale-95"
                >
                  <UserPlus className="w-5 h-5" />
                  <span>+ Cadastrar Novo Cliente</span>
                </button>
              </div>

              {/* Tabela de Clientes */}
              <div className="bg-[#050B1A] border border-[#14234A] rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-[#14234A] flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-gray-300">
                    Total de {clientes.length} Clientes Ativos
                  </span>
                  <button
                    onClick={recarregarTodosDados}
                    className="p-1.5 rounded-lg bg-[#0E1A38] text-gray-300 hover:text-white"
                    title="Atualizar"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead>
                      <tr className="bg-[#00227B] text-white uppercase text-[11px] font-black tracking-wider">
                        <th className="p-3.5">ID</th>
                        <th className="p-3.5">Nome do Apostador</th>
                        <th className="p-3.5">Telefone / WhatsApp</th>
                        <th className="p-3.5">Saldo em Conta</th>
                        <th className="p-3.5">Total Apostado</th>
                        <th className="p-3.5">Data de Cadastro</th>
                        <th className="p-3.5 text-center">Contato</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#101D3E]">
                      {clientes.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-gray-400">
                            Nenhum cliente cadastrado ainda. Clique em "Cadastrar Novo Cliente" acima!
                          </td>
                        </tr>
                      ) : (
                        clientes.map(cli => (
                          <tr key={cli.id} className="hover:bg-[#0B1530] transition-colors">
                            <td className="p-3.5 font-mono text-gray-400">#{cli.id}</td>
                            <td className="p-3.5 font-bold text-white flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center text-xs">
                                {cli.nome.charAt(0).toUpperCase()}
                              </div>
                              <span>{cli.nome}</span>
                            </td>
                            <td className="p-3.5 font-mono text-gray-300">{cli.telefone}</td>
                            <td className="p-3.5 font-mono font-bold text-emerald-400">
                              R$ {Number(cli.saldo || 0).toFixed(2)}
                            </td>
                            <td className="p-3.5 font-mono font-bold text-blue-400">
                              R$ {Number(cli.total_apostado || 0).toFixed(2)}
                            </td>
                            <td className="p-3.5 text-gray-400">
                              {new Date(cli.criado_em).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="p-3.5 text-center">
                              <a
                                href={`https://wa.me/${cli.telefone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 px-2.5 py-1 rounded-md text-xs font-bold"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>Chamar</span>
                              </a>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* ABA: BILHETES */}
          {/* ============================================================== */}
          {menuAtivo === 'bilhetes' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <ListFilter className="w-5 h-5 text-cyan-400" />
                  Controle de Bilhetes Emitidos
                </h2>

                <div className="flex items-center gap-2">
                  <select
                    value={filtroStatus}
                    onChange={(e) => setFiltroStatus(e.target.value)}
                    className="bg-[#050B1A] border border-[#14234A] rounded-lg px-3 py-1.5 text-xs text-white"
                  >
                    <option value="todos">Todos os Status</option>
                    <option value="Aberto">Abertos</option>
                    <option value="Ganho">Ganhos</option>
                    <option value="Perdido">Perdidos</option>
                  </select>
                </div>
              </div>

              <div className="bg-[#050B1A] border border-[#14234A] rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead>
                      <tr className="bg-[#00227B] text-white uppercase text-[11px] font-black tracking-wider">
                        <th className="p-3.5">Código</th>
                        <th className="p-3.5">Data / Hora</th>
                        <th className="p-3.5">Apostador</th>
                        <th className="p-3.5">Cambista</th>
                        <th className="p-3.5">Valor Apostado</th>
                        <th className="p-3.5">Retorno Possível</th>
                        <th className="p-3.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#101D3E]">
                      {bilhetes
                        .filter(b => filtroStatus === 'todos' || b.status === filtroStatus)
                        .map(b => (
                          <tr key={b.codigo} className="hover:bg-[#0B1530]">
                            <td className="p-3.5 font-mono font-black text-yellow-400">{b.codigo}</td>
                            <td className="p-3.5 text-gray-400">{b.data}</td>
                            <td className="p-3.5 font-bold text-white">{b.cliente_nome || 'Cliente Balcão'}</td>
                            <td className="p-3.5 text-blue-300 font-semibold">{b.cambista_nome || 'Direto'}</td>
                            <td className="p-3.5 font-mono font-bold text-gray-200">R$ {b.valor_apostado.toFixed(2)}</td>
                            <td className="p-3.5 font-mono font-bold text-emerald-400">R$ {(b.retorno_possivel ?? b.retorno_potencial ?? 0).toFixed(2)}</td>
                            <td className="p-3.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                b.status === 'Ganho' ? 'bg-emerald-500/20 text-emerald-300' :
                                b.status === 'Perdido' ? 'bg-red-500/20 text-red-300' :
                                'bg-yellow-500/20 text-yellow-300'
                              }`}>
                                {b.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* OUTRAS ABAS (CAIXA, SENHA, ETC.) */}
          {/* ============================================================== */}
          {menuAtivo === 'caixa' && (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-white">Resumo do Caixa Geral</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#050B1A] border border-[#14234A] rounded-2xl p-5">
                  <span className="text-xs text-gray-400 uppercase font-bold">Total Arrecadado</span>
                  <div className="text-3xl font-black text-emerald-400 font-mono mt-2">
                    R$ {caixa ? caixa.total_entradas.toFixed(2) : '355.00'}
                  </div>
                </div>
                <div className="bg-[#050B1A] border border-[#14234A] rounded-2xl p-5">
                  <span className="text-xs text-gray-400 uppercase font-bold">Prêmios Pagos</span>
                  <div className="text-3xl font-black text-red-400 font-mono mt-2">
                    R$ {caixa ? caixa.total_premios_pagos.toFixed(2) : '0.00'}
                  </div>
                </div>
                <div className="bg-[#050B1A] border border-[#14234A] rounded-2xl p-5">
                  <span className="text-xs text-gray-400 uppercase font-bold">Lucro Líquido da Banca</span>
                  <div className="text-3xl font-black text-yellow-400 font-mono mt-2">
                    R$ {caixa ? (caixa.saldo_liquido ?? caixa.lucro_liquido ?? 319.5).toFixed(2) : '319.50'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {menuAtivo === 'whatsapp' && (
            <div className="max-w-xl bg-[#050B1A] border border-[#14234A] rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-black text-white">Configurações de Contato da Banca</h2>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">WhatsApp Oficial do Dono</label>
                <input
                  type="text"
                  value={configs.whatsapp_dono}
                  onChange={(e) => setConfigs({ ...configs, whatsapp_dono: e.target.value })}
                  className="w-full bg-[#08122A] border border-[#192B5A] rounded-xl px-4 py-2.5 text-sm text-white"
                />
              </div>
              <button
                onClick={async () => {
                  await ApiService.salvarConfigs(configs);
                  alert('WhatsApp atualizado com sucesso!');
                }}
                className="bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black px-4 py-2 rounded-xl text-xs"
              >
                Salvar Configurações
              </button>
            </div>
          )}
        </main>
      </div>

      {/* ============================================================== */}
      {/* MODAL: EDITAR CAMBISTA (COMISSÃO %, LIMITE, NOME, STATUS) */}
      {/* ============================================================== */}
      {modalEditarCambista && cambistaEmEdicao && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B132B] border border-[#1C2C54] rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl relative">
            <button
              onClick={() => { setModalEditarCambista(false); setCambistaEmEdicao(null); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-yellow-400/20 text-yellow-400 flex items-center justify-center">
                <Edit className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black">Editar Dados do Cambista</h3>
                <p className="text-xs text-gray-400">{cambistaEmEdicao.nome} ({cambistaEmEdicao.usuario})</p>
              </div>
            </div>

            <form onSubmit={handleSalvarEdicaoCambista} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    value={formCambista.nome}
                    onChange={(e) => setFormCambista({ ...formCambista, nome: e.target.value })}
                    className="w-full bg-[#060B18] border border-[#1B2B50] rounded-xl px-3.5 py-2.5 text-sm text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">WhatsApp</label>
                  <input
                    type="text"
                    value={formCambista.whatsapp}
                    onChange={(e) => setFormCambista({ ...formCambista, whatsapp: e.target.value })}
                    className="w-full bg-[#060B18] border border-[#1B2B50] rounded-xl px-3.5 py-2.5 text-sm text-white"
                  />
                </div>
              </div>

              {/* PORCENTAGEM DE COMISSÃO & LIMITE DIÁRIO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#060B18] p-3 rounded-xl border border-[#1B2B50]">
                <div>
                  <label className="block text-xs font-black text-yellow-400 mb-1 flex items-center gap-1">
                    <Percent className="w-3.5 h-3.5" />
                    Comissão do Cambista (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    value={formCambista.comissao_pct}
                    onChange={(e) => setFormCambista({ ...formCambista, comissao_pct: Number(e.target.value) })}
                    className="w-full bg-[#0B132B] border border-yellow-500/50 rounded-lg px-3 py-2 text-sm text-yellow-300 font-black font-mono"
                    required
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block">Ex: 10% do valor dos bilhetes</span>
                </div>

                <div>
                  <label className="block text-xs font-black text-blue-400 mb-1 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5" />
                    Limite de Crédito Diário (R$)
                  </label>
                  <input
                    type="number"
                    step="50"
                    min="0"
                    value={formCambista.limite_credito}
                    onChange={(e) => setFormCambista({ ...formCambista, limite_credito: Number(e.target.value) })}
                    className="w-full bg-[#0B132B] border border-blue-500/50 rounded-lg px-3 py-2 text-sm text-blue-300 font-black font-mono"
                    required
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block">Teto para validar bilhetes</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Status</label>
                  <select
                    value={formCambista.status}
                    onChange={(e) => setFormCambista({ ...formCambista, status: e.target.value as 'ativo' | 'bloqueado' })}
                    className="w-full bg-[#060B18] border border-[#1B2B50] rounded-xl px-3.5 py-2.5 text-sm text-white"
                  >
                    <option value="ativo">Ativo (Pode validar)</option>
                    <option value="bloqueado">Bloqueado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Nova Senha (opcional)</label>
                  <input
                    type="password"
                    placeholder="Deixe em branco para manter"
                    value={formCambista.senha}
                    onChange={(e) => setFormCambista({ ...formCambista, senha: e.target.value })}
                    className="w-full bg-[#060B18] border border-[#1B2B50] rounded-xl px-3.5 py-2.5 text-sm text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setModalEditarCambista(false); setCambistaEmEdicao(null); }}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#060B18] text-gray-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-yellow-400 to-amber-500 text-blue-950 shadow-lg hover:from-yellow-300 hover:to-amber-400 active:scale-95 transition-all"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: NOVO CAMBISTA */}
      {/* ============================================================== */}
      {modalNovoCambista && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B132B] border border-[#1C2C54] rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl relative">
            <button
              onClick={() => setModalNovoCambista(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black">Cadastrar Novo Cambista</h3>
                <p className="text-xs text-gray-400">Credencie um novo parceiro para validar bilhetes</p>
              </div>
            </div>

            <form onSubmit={handleCadastrarCambista} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    placeholder="Ex: Pedro Santos"
                    value={formCambista.nome}
                    onChange={(e) => setFormCambista({ ...formCambista, nome: e.target.value })}
                    className="w-full bg-[#060B18] border border-[#1B2B50] rounded-xl px-3.5 py-2.5 text-sm text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Usuário de Login</label>
                  <input
                    type="text"
                    placeholder="@pedro"
                    value={formCambista.usuario}
                    onChange={(e) => setFormCambista({ ...formCambista, usuario: e.target.value })}
                    className="w-full bg-[#060B18] border border-[#1B2B50] rounded-xl px-3.5 py-2.5 text-sm text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">WhatsApp</label>
                  <input
                    type="text"
                    placeholder="11999999999"
                    value={formCambista.whatsapp}
                    onChange={(e) => setFormCambista({ ...formCambista, whatsapp: e.target.value })}
                    className="w-full bg-[#060B18] border border-[#1B2B50] rounded-xl px-3.5 py-2.5 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Senha de Acesso</label>
                  <input
                    type="password"
                    placeholder="Senha provisória"
                    value={formCambista.senha}
                    onChange={(e) => setFormCambista({ ...formCambista, senha: e.target.value })}
                    className="w-full bg-[#060B18] border border-[#1B2B50] rounded-xl px-3.5 py-2.5 text-sm text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#060B18] p-3 rounded-xl border border-[#1B2B50]">
                <div>
                  <label className="block text-xs font-black text-yellow-400 mb-1">
                    Comissão (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    value={formCambista.comissao_pct}
                    onChange={(e) => setFormCambista({ ...formCambista, comissao_pct: Number(e.target.value) })}
                    className="w-full bg-[#0B132B] border border-yellow-500/50 rounded-lg px-3 py-2 text-sm text-yellow-300 font-black font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-blue-400 mb-1">
                    Limite Diário (R$)
                  </label>
                  <input
                    type="number"
                    step="50"
                    min="0"
                    value={formCambista.limite_credito}
                    onChange={(e) => setFormCambista({ ...formCambista, limite_credito: Number(e.target.value) })}
                    className="w-full bg-[#0B132B] border border-blue-500/50 rounded-lg px-3 py-2 text-sm text-blue-300 font-black font-mono"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalNovoCambista(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#060B18] text-gray-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-emerald-400 text-gray-950 shadow-lg hover:bg-emerald-300 active:scale-95 transition-all"
                >
                  Cadastrar Cambista
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: NOVO CLIENTE */}
      {/* ============================================================== */}
      {modalNovoCliente && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B132B] border border-[#1C2C54] rounded-2xl max-w-md w-full p-6 text-white shadow-2xl relative">
            <button
              onClick={() => setModalNovoCliente(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black">Cadastrar Novo Cliente</h3>
                <p className="text-xs text-gray-400">Adicione um novo cliente na carteira da banca</p>
              </div>
            </div>

            <form onSubmit={handleCadastrarCliente} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Nome Completo do Cliente</label>
                <input
                  type="text"
                  placeholder="Ex: João da Silva"
                  value={formCliente.nome}
                  onChange={(e) => setFormCliente({ ...formCliente, nome: e.target.value })}
                  className="w-full bg-[#060B18] border border-[#1B2B50] rounded-xl px-3.5 py-2.5 text-sm text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">WhatsApp / Telefone</label>
                <input
                  type="text"
                  placeholder="(11) 98765-4321"
                  value={formCliente.telefone}
                  onChange={(e) => setFormCliente({ ...formCliente, telefone: e.target.value })}
                  className="w-full bg-[#060B18] border border-[#1B2B50] rounded-xl px-3.5 py-2.5 text-sm text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Senha de Acesso do Cliente</label>
                <input
                  type="password"
                  placeholder="Senha para o cliente entrar"
                  value={formCliente.senha}
                  onChange={(e) => setFormCliente({ ...formCliente, senha: e.target.value })}
                  className="w-full bg-[#060B18] border border-[#1B2B50] rounded-xl px-3.5 py-2.5 text-sm text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Saldo Inicial (R$)</label>
                <input
                  type="number"
                  step="5"
                  min="0"
                  value={formCliente.saldo_inicial}
                  onChange={(e) => setFormCliente({ ...formCliente, saldo_inicial: Number(e.target.value) })}
                  className="w-full bg-[#060B18] border border-[#1B2B50] rounded-xl px-3.5 py-2.5 text-sm text-white font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalNovoCliente(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#060B18] text-gray-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-emerald-400 text-gray-950 shadow-lg hover:bg-emerald-300 active:scale-95 transition-all"
                >
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
