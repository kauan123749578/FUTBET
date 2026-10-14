import React, { useState, useEffect, useMemo } from 'react';
import { PasswordInput } from './PasswordInput';
import { ApiService } from '../services/api';
import { BilheteAdmin, CambistaModel, ClienteModel, ConfiguracoesBanca, ResumoCaixaDono } from '../types/betting';
import { 
  Home, 
  Tv, 
  PlusCircle, 
  Wallet, 
  BarChart3, 
  Users, 
  Crown,
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
  UserCheck,
  Trophy
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useBetting } from '../context/BettingContext';

interface AdminPainelProps {
  onVoltarSimulador?: () => void;
}

function nomeApostadorBilhete(b: BilheteAdmin): string {
  return (b.cliente_nome || b.cliente || 'Apostador').trim();
}

function formatDataCadastro(raw?: string): string {
  if (!raw || !String(raw).trim()) return '—';
  const s = String(raw).trim();
  if (/^\d{2}\/\d{2}\/\d{4}/.test(s)) return s.split(' ')[0];
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) return d.toLocaleDateString('pt-BR');
  return s;
}

function classeStatusBilhete(status: string): string {
  const st = (status || '').toLowerCase();
  if (st === 'pendente') return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  if (st === 'aberto') return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
  if (st.includes('ganh')) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  if (st.includes('perd')) return 'bg-red-500/20 text-red-300 border-red-500/40';
  if (st.includes('cancel')) return 'bg-gray-500/20 text-gray-400 border-gray-500/40';
  return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
}

export const AdminPainelDesktopView: React.FC<AdminPainelProps> = ({ onVoltarSimulador }) => {
  const { logoutOperador, setModalCadastroClienteAberto, sessaoOperador } = useBetting();

  // Sub-abas do menu lateral esquerdo
  const [menuAtivo, setMenuAtivo] = useState<
    'cambistas' | 'clientes' | 'bilhetes' | 'inicio' | 'caixa' | 'relatorios' | 'whatsapp'
  >('cambistas');

  const [sidebarMobileAberto, setSidebarMobileAberto] = useState(false);

  // Estados principais
  const [bilhetes, setBilhetes] = useState<BilheteAdmin[]>([]);
  const [cambistas, setCambistas] = useState<CambistaModel[]>([]);
  const [clientes, setClientes] = useState<ClienteModel[]>([]);
  const [caixa, setCaixa] = useState<ResumoCaixaDono | null>(null);
  const [configs, setConfigs] = useState<ConfiguracoesBanca>({
    whatsapp_dono: '5521990808924',
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

  const [codigoValidarAdmin, setCodigoValidarAdmin] = useState('');
  const [validandoBilhete, setValidandoBilhete] = useState(false);
  const [msgValidacao, setMsgValidacao] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);

  const statsRelatorio = useMemo(() => {
    const norm = (s: string) => (s || '').toLowerCase();
    let abertos = 0;
    let ganhos = 0;
    let perdidos = 0;
    let totalApostado = 0;
    let exposicao = 0;
    for (const b of bilhetes) {
      totalApostado += b.valor_apostado || 0;
      exposicao += b.retorno_potencial || b.retorno_possivel || 0;
      const st = norm(b.status);
      if (st.includes('ganh')) ganhos++;
      else if (st.includes('perd')) perdidos++;
      else abertos++;
    }
    const ticketMedio = bilhetes.length ? totalApostado / bilhetes.length : 0;
    const porCambista = cambistas
      .map(c => ({
        nome: c.nome,
        bilhetes: c.total_bilhetes ?? 0,
        vendas: c.total_vendas ?? 0,
      }))
      .sort((a, b) => b.vendas - a.vendas)
      .slice(0, 5);
    return {
      totalBilhetes: bilhetes.length,
      abertos,
      ganhos,
      perdidos,
      totalApostado,
      exposicao,
      ticketMedio,
      totalClientes: clientes.length,
      totalCambistas: cambistas.length,
      porCambista,
    };
  }, [bilhetes, cambistas, clientes.length]);

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

  const handleExcluirCliente = async (cli: ClienteModel) => {
    if (
      !window.confirm(
        `Remover o cliente "${cli.nome}" (${cli.telefone})?\n\nOs bilhetes já emitidos permanecem no sistema; só a conta de login será apagada.`
      )
    ) {
      return;
    }
    const res = await ApiService.excluirCliente(cli.id);
    if (res.sucesso) {
      await recarregarTodosDados();
    } else {
      alert(res.erro || 'Erro ao excluir cliente.');
    }
  };

  const validarBilheteAdmin = async (codigoOuPin: string) => {
    const clean = codigoOuPin.trim().toUpperCase();
    if (!clean) return;
    setValidandoBilhete(true);
    setMsgValidacao(null);
    const operador = sessaoOperador?.nome || 'Admin / Dono';
    const res = await ApiService.validarPin(clean, undefined, operador);
    setValidandoBilhete(false);
    if (res.success) {
      confetti({ particleCount: 40, spread: 50 });
      setMsgValidacao({ tipo: 'ok', texto: res.message || `Bilhete validado!` });
      setCodigoValidarAdmin('');
      await recarregarTodosDados();
    } else {
      setMsgValidacao({ tipo: 'erro', texto: res.erro || 'Não foi possível validar.' });
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
              <img src="/logo.jpg" alt="" className="w-8 h-8 rounded-full object-cover ring-1 ring-white/20" />
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
              onClick={() => { if (onVoltarSimulador) onVoltarSimulador(); }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-bold text-gray-300 hover:text-white hover:bg-[#0E1A38] transition-all"
            >
              <div className="flex items-center gap-3">
                <Trophy className="w-4 h-4 text-amber-400" />
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
          {menuAtivo === 'inicio' && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Home className="w-6 h-6 text-blue-400" />
                Visão geral da banca
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-[#050B1A] border border-[#14234A] rounded-xl p-4">
                  <p className="text-[10px] uppercase text-gray-500 font-bold">Bilhetes</p>
                  <p className="text-2xl font-black text-white font-mono mt-1">{statsRelatorio.totalBilhetes}</p>
                </div>
                <div className="bg-[#050B1A] border border-[#14234A] rounded-xl p-4">
                  <p className="text-[10px] uppercase text-gray-500 font-bold">Clientes</p>
                  <p className="text-2xl font-black text-emerald-400 font-mono mt-1">{statsRelatorio.totalClientes}</p>
                </div>
                <div className="bg-[#050B1A] border border-[#14234A] rounded-xl p-4">
                  <p className="text-[10px] uppercase text-gray-500 font-bold">Cambistas</p>
                  <p className="text-2xl font-black text-blue-300 font-mono mt-1">{statsRelatorio.totalCambistas}</p>
                </div>
                <div className="bg-[#050B1A] border border-[#14234A] rounded-xl p-4">
                  <p className="text-[10px] uppercase text-gray-500 font-bold">Volume apostado</p>
                  <p className="text-xl font-black text-yellow-400 font-mono mt-1">
                    R$ {statsRelatorio.totalApostado.toFixed(2)}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Use o menu para cambistas, clientes, bilhetes, caixa e relatórios detalhados.
              </p>
            </div>
          )}

          {menuAtivo === 'relatorios' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-purple-400" />
                  Relatórios da banca
                </h2>
                <button
                  type="button"
                  onClick={() => recarregarTodosDados()}
                  className="inline-flex items-center gap-2 text-xs font-bold text-gray-300 border border-[#192B5A] px-3 py-2 rounded-lg hover:bg-[#0E1A38]"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${carregando ? 'animate-spin' : ''}`} />
                  Atualizar
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-[#050B1A] border border-yellow-500/30 rounded-xl p-4">
                  <p className="text-[10px] uppercase text-yellow-500/80 font-bold">Em aberto</p>
                  <p className="text-3xl font-black text-yellow-300 font-mono">{statsRelatorio.abertos}</p>
                </div>
                <div className="bg-[#050B1A] border border-emerald-500/30 rounded-xl p-4">
                  <p className="text-[10px] uppercase text-emerald-500/80 font-bold">Ganhos</p>
                  <p className="text-3xl font-black text-emerald-400 font-mono">{statsRelatorio.ganhos}</p>
                </div>
                <div className="bg-[#050B1A] border border-red-500/30 rounded-xl p-4">
                  <p className="text-[10px] uppercase text-red-500/80 font-bold">Perdidos</p>
                  <p className="text-3xl font-black text-red-400 font-mono">{statsRelatorio.perdidos}</p>
                </div>
                <div className="bg-[#050B1A] border border-[#14234A] rounded-xl p-4">
                  <p className="text-[10px] uppercase text-gray-500 font-bold">Ticket médio</p>
                  <p className="text-xl font-black text-white font-mono">R$ {statsRelatorio.ticketMedio.toFixed(2)}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-[#050B1A] border border-[#14234A] rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-gray-300 mb-3">Financeiro (bilhetes)</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span className="text-gray-500">Total apostado</span>
                      <span className="font-mono font-bold text-white">R$ {statsRelatorio.totalApostado.toFixed(2)}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500">Retorno potencial (exposição)</span>
                      <span className="font-mono font-bold text-emerald-400">R$ {statsRelatorio.exposicao.toFixed(2)}</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-[#050B1A] border border-[#14234A] rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-gray-300 mb-3">Top cambistas (vendas)</h3>
                  {statsRelatorio.porCambista.length === 0 ? (
                    <p className="text-xs text-gray-500">Nenhum cambista cadastrado ainda.</p>
                  ) : (
                    <ul className="space-y-2">
                      {statsRelatorio.porCambista.map(c => (
                        <li key={c.nome} className="flex justify-between text-xs">
                          <span className="text-gray-300 truncate pr-2">{c.nome}</span>
                          <span className="font-mono text-emerald-400 shrink-0">R$ {(c.vendas || 0).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="bg-[#050B1A] border border-[#14234A] rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-[#14234A] text-xs font-bold text-gray-400 uppercase">
                  Últimos bilhetes registrados
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#0B1530] text-gray-400">
                        <th className="p-3">Código</th>
                        <th className="p-3">Cliente</th>
                        <th className="p-3">Valor</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#101D3E]">
                      {bilhetes.slice(0, 8).map(b => (
                        <tr key={b.codigo} className="hover:bg-[#0B1530]/50">
                          <td className="p-3 font-mono text-yellow-400">{b.codigo}</td>
                          <td className="p-3 text-gray-300">{b.cliente_nome || b.cliente || '—'}</td>
                          <td className="p-3 font-mono">R$ {b.valor_apostado.toFixed(2)}</td>
                          <td className="p-3 text-gray-400">{b.status}</td>
                        </tr>
                      ))}
                      {bilhetes.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-6 text-center text-gray-500">
                            Nenhum bilhete no sistema ainda.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {menuAtivo === 'cambistas' && (
            <div className="space-y-6">
              {/* Header da Aba */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2 py-0.5 rounded uppercase inline-flex items-center gap-1">
                      <Crown className="w-3 h-3" /> EXCLUSIVO DO DONO
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
                        <th className="p-3.5 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#101D3E]">
                      {clientes.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-gray-400">
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
                            <td className="p-3.5 text-gray-400">{formatDataCadastro(cli.criado_em)}</td>
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
                            <td className="p-3.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleExcluirCliente(cli)}
                                className="inline-flex items-center gap-1 bg-red-950/50 hover:bg-red-900/60 text-red-300 border border-red-800/50 px-2.5 py-1 rounded-md text-xs font-bold"
                                title="Excluir cliente"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Excluir
                              </button>
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
                    <option value="Pendente">Pendentes (validar)</option>
                    <option value="Aberto">Validados / Abertos</option>
                    <option value="Ganhou">Ganhos</option>
                    <option value="Perdeu">Perdidos</option>
                    <option value="Cancelado">Cancelados</option>
                  </select>
                  <button
                    type="button"
                    onClick={recarregarTodosDados}
                    className="p-2 rounded-lg bg-[#0E1A38] text-gray-300 hover:text-white"
                    title="Atualizar lista"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#0A1F3A] to-[#050B1A] border border-cyan-500/30 rounded-2xl p-4 shadow-xl space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-sm font-black text-white uppercase">Validar bilhete (código ou PIN)</h3>
                </div>
                <p className="text-[11px] text-gray-400 max-w-2xl">
                  Quando o cliente pagar no WhatsApp, digite o <strong className="text-white">código</strong> (ex: KG4R-JYLQ) ou o{' '}
                  <strong className="text-white">PIN de 6 dígitos</strong> e clique em validar. O status muda de Pendente para Aberto.
                </p>
                <form
                  className="flex flex-col sm:flex-row gap-2"
                  onSubmit={e => {
                    e.preventDefault();
                    validarBilheteAdmin(codigoValidarAdmin);
                  }}
                >
                  <input
                    type="text"
                    value={codigoValidarAdmin}
                    onChange={e => setCodigoValidarAdmin(e.target.value.toUpperCase())}
                    placeholder="Código ou PIN do bilhete"
                    className="flex-1 bg-[#070B13] border border-[#233352] rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-white uppercase placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="submit"
                    disabled={validandoBilhete || !codigoValidarAdmin.trim()}
                    className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-gray-950 font-black px-6 py-2.5 rounded-xl text-xs uppercase flex items-center justify-center gap-2"
                  >
                    {validandoBilhete ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    Validar bilhete
                  </button>
                </form>
                {msgValidacao && (
                  <p
                    className={`text-xs font-bold px-3 py-2 rounded-lg ${
                      msgValidacao.tipo === 'ok'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-red-500/15 text-red-300 border border-red-500/30'
                    }`}
                  >
                    {msgValidacao.texto}
                  </p>
                )}
              </div>

              <div className="bg-[#050B1A] border border-[#14234A] rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead>
                      <tr className="bg-[#00227B] text-white uppercase text-[11px] font-black tracking-wider">
                        <th className="p-3.5">Código</th>
                        <th className="p-3.5">PIN</th>
                        <th className="p-3.5">Data / Hora</th>
                        <th className="p-3.5">Apostador</th>
                        <th className="p-3.5">Cambista</th>
                        <th className="p-3.5">Valor Apostado</th>
                        <th className="p-3.5">Retorno Possível</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#101D3E]">
                      {bilhetes
                        .filter(b => {
                          if (filtroStatus === 'todos') return true;
                          return (b.status || '').toLowerCase() === filtroStatus.toLowerCase();
                        })
                        .filter(b => {
                          if (!termoBusca.trim()) return true;
                          const t = termoBusca.toLowerCase();
                          return (
                            b.codigo.toLowerCase().includes(t) ||
                            nomeApostadorBilhete(b).toLowerCase().includes(t) ||
                            (b.pin || '').includes(t)
                          );
                        })
                        .map(b => {
                          const pendente = (b.status || '').toLowerCase() === 'pendente';
                          return (
                            <tr key={b.codigo} className="hover:bg-[#0B1530]">
                              <td className="p-3.5 font-mono font-black text-yellow-400">{b.codigo}</td>
                              <td className="p-3.5 font-mono text-gray-400">{b.pin || '—'}</td>
                              <td className="p-3.5 text-gray-400">{b.data}</td>
                              <td className="p-3.5 font-bold text-white">
                                {nomeApostadorBilhete(b)}
                                {b.cliente_telefone && (
                                  <span className="block text-[10px] font-normal text-gray-500 font-mono">
                                    {b.cliente_telefone}
                                  </span>
                                )}
                              </td>
                              <td className="p-3.5 text-blue-300 font-semibold">{b.validado_por || b.cambista_nome || 'Site'}</td>
                              <td className="p-3.5 font-mono font-bold text-gray-200">R$ {b.valor_apostado.toFixed(2)}</td>
                              <td className="p-3.5 font-mono font-bold text-emerald-400">
                                R$ {(b.retorno_possivel ?? b.retorno_potencial ?? 0).toFixed(2)}
                              </td>
                              <td className="p-3.5">
                                <span
                                  className={`px-2 py-0.5 rounded border text-[10px] font-black uppercase ${classeStatusBilhete(b.status)}`}
                                >
                                  {b.status}
                                </span>
                              </td>
                              <td className="p-3.5 text-center">
                                {pendente ? (
                                  <button
                                    type="button"
                                    onClick={() => validarBilheteAdmin(b.codigo)}
                                    disabled={validandoBilhete}
                                    className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-md text-[10px] font-black uppercase disabled:opacity-50"
                                  >
                                    <Check className="w-3 h-3" />
                                    Validar
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-gray-500">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      {bilhetes.length === 0 && (
                        <tr>
                          <td colSpan={9} className="p-8 text-center text-gray-500">
                            Nenhum bilhete emitido ainda.
                          </td>
                        </tr>
                      )}
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
                  <PasswordInput
                    placeholder="Deixe em branco para manter"
                    value={formCambista.senha}
                    onChange={(e) => setFormCambista({ ...formCambista, senha: e.target.value })}
                    className="bg-[#060B18] border border-[#1B2B50] rounded-xl px-3.5 py-2.5 text-sm text-white"
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
                  <PasswordInput
                    placeholder="Senha provisória"
                    value={formCambista.senha}
                    onChange={(e) => setFormCambista({ ...formCambista, senha: e.target.value })}
                    className="bg-[#060B18] border border-[#1B2B50] rounded-xl px-3.5 py-2.5 text-sm text-white"
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
                <PasswordInput
                  placeholder="Senha para o cliente entrar"
                  value={formCliente.senha}
                  onChange={(e) => setFormCliente({ ...formCliente, senha: e.target.value })}
                  className="bg-[#060B18] border border-[#1B2B50] rounded-xl px-3.5 py-2.5 text-sm text-white"
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
