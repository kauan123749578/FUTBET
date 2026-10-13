import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { ItemCupom, TipoAposta, Bilhete, FiltrosAtivos, Jogo, SessaoOperador, SessaoCliente } from '../types/betting';
import { ApiService } from '../services/api';

interface BettingContextType {
  // Filtros
  filtros: FiltrosAtivos;
  setIdEsporte: (id: number) => void;
  setIdCampeonato: (id?: number) => void;
  setPaisFiltro: (pais?: string) => void;
  setDataFiltro: (filtro: string) => void;
  setTermoBusca: (termo: string) => void;

  // Cupom de Apostas
  itensCupom: ItemCupom[];
  tipoAposta: TipoAposta;
  valorApostado: number;
  cotacaoTotal: number;
  retornoPotencial: number;
  toggleSelecao: (item: ItemCupom) => void;
  removerItem: (jogoId: string | number, mercadoId: string) => void;
  limparCupom: voidCallback;
  setTipoAposta: (tipo: TipoAposta) => void;
  setValorApostado: (valor: number) => void;
  adicionarValorRapido: (incremento: number) => void;
  isOddSelecionada: (jogoId: string | number, palpiteRotulo: string) => boolean;

  // Bilhete & Simulação
  bilheteGerado: Bilhete | null;
  modalBilheteAberto: boolean;
  isSimulando: boolean;
  simularAposta: () => Promise<Bilhete | null>;
  fecharModalBilhete: voidCallback;
  abrirModalComBilhete: (b: Bilhete) => void;

  // Navegação do Terminal
  abaAtiva: 'apostador' | 'conferir' | 'cambista' | 'regulamento' | 'admin';
  setAbaAtiva: (aba: 'apostador' | 'conferir' | 'cambista' | 'regulamento' | 'admin') => void;

  // Modal de Mercados Adicionais (+X)
  jogoMercadosAberto: Jogo | null;
  setJogoMercadosAberto: (jogo: Jogo | null) => void;

  // Autenticação Segura de Operadores (Dono & Cambistas)
  sessaoOperador: SessaoOperador | null;
  modalLoginOperadorAberto: boolean;
  setModalLoginOperadorAberto: (aberto: boolean) => void;
  loginOperador: (dados: SessaoOperador) => void;
  logoutOperador: voidCallback;

  // Responsividade Mobile
  sidebarMobileAberto: boolean;
  setSidebarMobileAberto: (aberto: boolean) => void;

  // Conta do apostador (obrigatória para apostar)
  sessaoCliente: SessaoCliente | null;
  loginCliente: (dados: SessaoCliente) => void;
  logoutCliente: voidCallback;
  modalCadastroClienteAberto: boolean;
  setModalCadastroClienteAberto: (aberto: boolean) => void;
  clienteAuthModo: 'cadastro' | 'login';
  setClienteAuthModo: (modo: 'cadastro' | 'login') => void;
  clienteAuthMensagem: string | null;
  abrirCadastroCliente: (modo?: 'cadastro' | 'login', mensagem?: string) => void;
}

type voidCallback = () => void;

const BettingContext = createContext<BettingContextType | undefined>(undefined);

export const BettingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Inicializa filtros lendo da URL se existirem (?idesporte=...&idcampeonato=...)
  const [filtros, setFiltrosState] = useState<FiltrosAtivos>(() => {
    const params = new URLSearchParams(window.location.search);
    const idEsporteParam = params.get('idesporte');
    const idCampeonatoParam = params.get('idcampeonato');
    return {
      idEsporte: idEsporteParam ? parseInt(idEsporteParam, 10) : 102,
      idCampeonato: idCampeonatoParam ? parseInt(idCampeonatoParam, 10) : undefined,
      dataFiltro: 'todos',
      termoBusca: ''
    };
  });

  // Atualiza a URL sem recarregar a página ao mudar filtros
  useEffect(() => {
    const params = new URLSearchParams();
    if (filtros.idEsporte) params.set('idesporte', filtros.idEsporte.toString());
    if (filtros.idCampeonato) params.set('idcampeonato', filtros.idCampeonato.toString());
    const newRelativePathQuery = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, '', newRelativePathQuery);
  }, [filtros.idEsporte, filtros.idCampeonato]);

  // Navegação entre abas
  const [abaAtiva, setAbaAtivaState] = useState<'apostador' | 'conferir' | 'cambista' | 'regulamento' | 'admin'>('apostador');

  // Sessão de Operador (Dono / Cambista)
  const [sessaoOperador, setSessaoOperador] = useState<SessaoOperador | null>(() => {
    try {
      const s = sessionStorage.getItem('radar_bet_sessao_operador');
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });

  const [modalLoginOperadorAberto, setModalLoginOperadorAberto] = useState(false);
  const [sidebarMobileAberto, setSidebarMobileAberto] = useState(false);
  const [sessaoCliente, setSessaoCliente] = useState<SessaoCliente | null>(() => {
    try {
      const s = localStorage.getItem('futbet_sessao_cliente_v1');
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });

  const [modalCadastroClienteAberto, setModalCadastroClienteAberto] = useState(false);
  const [clienteAuthModo, setClienteAuthModo] = useState<'cadastro' | 'login'>('cadastro');
  const [clienteAuthMensagem, setClienteAuthMensagem] = useState<string | null>(null);

  const loginCliente = useCallback((dados: SessaoCliente) => {
    setSessaoCliente(dados);
    localStorage.setItem('futbet_sessao_cliente_v1', JSON.stringify(dados));
    setModalCadastroClienteAberto(false);
    setClienteAuthMensagem(null);
  }, []);

  const logoutCliente = useCallback(() => {
    setSessaoCliente(null);
    localStorage.removeItem('futbet_sessao_cliente_v1');
  }, []);

  const abrirCadastroCliente = useCallback((modo: 'cadastro' | 'login' = 'cadastro', mensagem?: string) => {
    setClienteAuthModo(modo);
    setClienteAuthMensagem(mensagem ?? null);
    setModalCadastroClienteAberto(true);
  }, []);

  const loginOperador = useCallback((dados: SessaoOperador) => {
    setSessaoOperador(dados);
    sessionStorage.setItem('radar_bet_sessao_operador', JSON.stringify(dados));
    setModalLoginOperadorAberto(false);
    if (dados.role === 'dono') {
      setAbaAtivaState('admin');
    } else {
      setAbaAtivaState('cambista');
    }
  }, []);

  const logoutOperador = useCallback(() => {
    setSessaoOperador(null);
    sessionStorage.removeItem('radar_bet_sessao_operador');
    setAbaAtivaState('apostador');
  }, []);

  const setAbaAtiva = useCallback((aba: 'apostador' | 'conferir' | 'cambista' | 'regulamento' | 'admin') => {
    if (aba === 'admin') {
      if (!sessaoOperador || sessaoOperador.role !== 'dono') {
        setModalLoginOperadorAberto(true);
        return;
      }
    }
    if (aba === 'cambista') {
      if (!sessaoOperador) {
        setModalLoginOperadorAberto(true);
        return;
      }
    }
    setAbaAtivaState(aba);
  }, [sessaoOperador]);

  // Estado do Cupom
  const [itensCupom, setItensCupom] = useState<ItemCupom[]>(() => {
    try {
      const saved = localStorage.getItem('radar_bet_cupom_ativo');
      if (saved) {
        const parsed: ItemCupom[] = JSON.parse(saved);
        // Remove quaisquer itens legados/falsos de testes antigos (Carapebus, Niteroiense, Carioca B1)
        return parsed.filter(item => {
          const desc = (item.jogoDescricao || '').toLowerCase();
          const camp = (item.campeonatoNome || '').toLowerCase();
          return !desc.includes('carapebus') && !desc.includes('niteroiense') && !camp.includes('b1');
        });
      }
      return [];
    } catch {
      return [];
    }
  });

  const [tipoAposta, setTipoAposta] = useState<TipoAposta>('multipla');
  const [valorApostado, setValorApostado] = useState<number>(10.00);

  // Persistir cupom no localStorage
  useEffect(() => {
    try {
      localStorage.setItem('radar_bet_cupom_ativo', JSON.stringify(itensCupom));
    } catch (e) {
      console.error(e);
    }
  }, [itensCupom]);

  // Modal de Bilhete
  const [bilheteGerado, setBilheteGerado] = useState<Bilhete | null>(null);
  const [modalBilheteAberto, setModalBilheteAberto] = useState(false);
  const [isSimulando, setIsSimulando] = useState(false);

  // Modal de Mercados
  const [jogoMercadosAberto, setJogoMercadosAberto] = useState<Jogo | null>(null);

  // Manipuladores de Filtros
  const setIdEsporte = useCallback((id: number) => {
    setFiltrosState(prev => ({ ...prev, idEsporte: id, idCampeonato: undefined, paisFiltro: undefined }));
  }, []);

  const setIdCampeonato = useCallback((id?: number) => {
    setFiltrosState(prev => ({ ...prev, idCampeonato: id }));
  }, []);

  const setPaisFiltro = useCallback((pais?: string) => {
    setFiltrosState(prev => ({ ...prev, paisFiltro: pais, idCampeonato: undefined }));
  }, []);

  const setDataFiltro = useCallback((filtro: string) => {
    setFiltrosState(prev => ({ ...prev, dataFiltro: filtro }));
  }, []);

  const setTermoBusca = useCallback((termo: string) => {
    setFiltrosState(prev => ({ ...prev, termoBusca: termo }));
  }, []);

  // Adicionar ou remover seleção (Toggle da Odd)
  const toggleSelecao = useCallback((item: ItemCupom) => {
    setItensCupom(prev => {
      const jaExisteMesmoPalpite = prev.some(
        i => i.jogoId === item.jogoId && i.mercadoId === item.mercadoId && i.palpiteRotulo === item.palpiteRotulo
      );

      if (jaExisteMesmoPalpite) {
        return prev.filter(
          i => !(i.jogoId === item.jogoId && i.mercadoId === item.mercadoId && i.palpiteRotulo === item.palpiteRotulo)
        );
      }

      if (!sessaoCliente) {
        queueMicrotask(() => {
          abrirCadastroCliente(
            'cadastro',
            'Para adicionar palpites ao cupom, crie sua conta ou faça login.'
          );
        });
        return prev;
      }

      const filtrado = prev.filter(
        i => !(i.jogoId === item.jogoId && i.mercadoId === item.mercadoId)
      );

      return [...filtrado, item];
    });
  }, [sessaoCliente, abrirCadastroCliente]);

  const removerItem = useCallback((jogoId: string | number, mercadoId: string) => {
    setItensCupom(prev => prev.filter(i => !(i.jogoId === jogoId && i.mercadoId === mercadoId)));
  }, []);

  const limparCupom = useCallback(() => {
    setItensCupom([]);
  }, []);

  const adicionarValorRapido = useCallback((incremento: number) => {
    setValorApostado(prev => Math.max(1, Math.round((prev + incremento) * 100) / 100));
  }, []);

  const isOddSelecionada = useCallback((jogoId: string | number, palpiteRotulo: string) => {
    return itensCupom.some(i => i.jogoId === jogoId && i.palpiteRotulo === palpiteRotulo);
  }, [itensCupom]);

  // Cálculos Automáticos de Odd Total e Retorno
  const cotacaoTotal = useMemo(() => {
    if (itensCupom.length === 0) return 0;
    if (tipoAposta === 'simples') {
      // Na aposta simples, exibe a cotação média ou a da primeira seleção
      return parseFloat((itensCupom.reduce((acc, i) => acc + i.oddValor, 0) / itensCupom.length).toFixed(2));
    }
    // Aposta Múltipla / Acumulada: multiplicação das odds
    const multi = itensCupom.reduce((acc, item) => acc * item.oddValor, 1);
    return parseFloat(multi.toFixed(2));
  }, [itensCupom, tipoAposta]);

  const retornoPotencial = useMemo(() => {
    if (itensCupom.length === 0 || valorApostado <= 0) return 0;
    const total = cotacaoTotal * valorApostado;
    return parseFloat(total.toFixed(2));
  }, [cotacaoTotal, valorApostado, itensCupom.length]);

  // Simular / Gerar Pré-Bilhete
  const simularAposta = useCallback(async () => {
    if (!sessaoCliente) {
      abrirCadastroCliente('login', 'Entre na sua conta para gerar o bilhete.');
      return null;
    }
    if (itensCupom.length === 0 || valorApostado <= 0) return null;
    setIsSimulando(true);
    try {
      const bilhete = await ApiService.simularBilhete({
        apostadorNome: sessaoCliente.nome,
        apostadorTelefone: sessaoCliente.telefone,
        itens: itensCupom,
        tipo: tipoAposta,
        valorApostado,
        cotacaoTotal,
        retornoPotencial
      });
      setBilheteGerado(bilhete);
      setModalBilheteAberto(true);
      limparCupom(); // Limpa cupom após simular com sucesso
      return bilhete;
    } finally {
      setIsSimulando(false);
    }
  }, [itensCupom, tipoAposta, valorApostado, cotacaoTotal, retornoPotencial, limparCupom, sessaoCliente, abrirCadastroCliente]);

  const fecharModalBilhete = useCallback(() => {
    setModalBilheteAberto(false);
  }, []);

  const abrirModalComBilhete = useCallback((b: Bilhete) => {
    setBilheteGerado(b);
    setModalBilheteAberto(true);
  }, []);

  return (
    <BettingContext.Provider
      value={{
        filtros,
        setIdEsporte,
        setIdCampeonato,
        setPaisFiltro,
        setDataFiltro,
        setTermoBusca,
        itensCupom,
        tipoAposta,
        valorApostado,
        cotacaoTotal,
        retornoPotencial,
        toggleSelecao,
        removerItem,
        limparCupom,
        setTipoAposta,
        setValorApostado,
        adicionarValorRapido,
        isOddSelecionada,
        bilheteGerado,
        modalBilheteAberto,
        isSimulando,
        simularAposta,
        fecharModalBilhete,
        abrirModalComBilhete,
        abaAtiva,
        setAbaAtiva,
        jogoMercadosAberto,
        setJogoMercadosAberto,
        sessaoOperador,
        modalLoginOperadorAberto,
        setModalLoginOperadorAberto,
        loginOperador,
        logoutOperador,
        sidebarMobileAberto,
        setSidebarMobileAberto,
        sessaoCliente,
        loginCliente,
        logoutCliente,
        modalCadastroClienteAberto,
        setModalCadastroClienteAberto,
        clienteAuthModo,
        setClienteAuthModo,
        clienteAuthMensagem,
        abrirCadastroCliente,
      }}
    >
      {children}
    </BettingContext.Provider>
  );
};

export const useBetting = () => {
  const context = useContext(BettingContext);
  if (!context) {
    throw new Error('useBetting must be used within a BettingProvider');
  }
  return context;
};
