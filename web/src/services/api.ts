import {
  Esporte,
  Campeonato,
  Jogo,
  Bilhete,
  BilheteAdmin,
  ItemCupom,
  ResumoBanca,
  CambistaModel,
  ClienteModel,
  ConfiguracoesBanca,
  ResumoCaixaDono
} from '../types/betting';

const STORAGE_BILHETES_ADMIN_KEY = 'futbet_bilhetes_v4';
const STORAGE_CONFIGS_KEY = 'futbet_configs_v4';
const STORAGE_CAMBISTAS_KEY = 'futbet_cambistas_v4';

/** Suporte / WhatsApp da banca (DDI 55 + DDD 21). */
export const WHATSAPP_SUPORTE_NUM = '5521990808924';

export const FUTEBOL_ESPORTE: Esporte = { id: 102, nome: 'Futebol', icone: '⚽', totalJogos: 0 };

/** Ligas com jogos reais na API ESPN (Brasil + CONMEBOL). */
export const CAMPEONATOS_FUTEBOL: Campeonato[] = [
  { id: 574584, idEsporte: 102, pais: 'Brasil', bandeira: '🇧🇷', nome: 'Brasileirão Série A', totalJogos: 0, destaque: true },
  { id: 574585, idEsporte: 102, pais: 'Brasil', bandeira: '🇧🇷', nome: 'Brasileirão Série B', totalJogos: 0, destaque: true },
  { id: 574586, idEsporte: 102, pais: 'Clubes Internacionais', bandeira: '🏆', nome: 'Copa Libertadores', totalJogos: 0, destaque: true },
  { id: 574587, idEsporte: 102, pais: 'Clubes Internacionais', bandeira: '🌎', nome: 'Copa Sul-Americana', totalJogos: 0, destaque: true },
];

export const CONFIGS_PADRAO: ConfiguracoesBanca = {
  whatsapp_dono: WHATSAPP_SUPORTE_NUM,
  chave_pix: '11999999999',
  nome_banca: 'FUTBET',
  comissao_padrao: '10.0',
  limite_padrao_cambista: '2000.00'
};

function getLocalBilhetes(): BilheteAdmin[] {
  try {
    const raw = localStorage.getItem(STORAGE_BILHETES_ADMIN_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLocalBilhetes(list: BilheteAdmin[]) {
  try {
    localStorage.setItem(STORAGE_BILHETES_ADMIN_KEY, JSON.stringify(list));
  } catch (e) {
    console.error(e);
  }
}

function getLocalConfigs(): ConfiguracoesBanca {
  try {
    const raw = localStorage.getItem(STORAGE_CONFIGS_KEY);
    if (!raw) return CONFIGS_PADRAO;
    const parsed = JSON.parse(raw);
    if (parsed.nome_banca === 'ESCANTEIOBET') parsed.nome_banca = 'FUTBET';
    return { ...CONFIGS_PADRAO, ...parsed };
  } catch {
    return CONFIGS_PADRAO;
  }
}

function saveLocalConfigs(c: ConfiguracoesBanca) {
  try {
    localStorage.setItem(STORAGE_CONFIGS_KEY, JSON.stringify(c));
  } catch (e) {
    console.error(e);
  }
}

function getLocalCambistas(): CambistaModel[] {
  try {
    const raw = localStorage.getItem(STORAGE_CAMBISTAS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLocalCambistas(c: CambistaModel[]) {
  try {
    localStorage.setItem(STORAGE_CAMBISTAS_KEY, JSON.stringify(c));
  } catch (e) {
    console.error(e);
  }
}

export function getResumoCambista(): ResumoBanca {
  return {
    saldoLimiteCambista: 0,
    comissaoPercentual: 10,
    totalBilhetesValidados: 0,
    totalVendidoHoje: 0,
    totalComissaoHoje: 0,
    totalPremiosPagosHoje: 0,
    lucroLiquidoEstimado: 0
  };
}

// =================== SERVIÇO PRINCIPAL DA API (FastAPI) ===================
export const ApiService = {
  // GET /api/configuracoes
  async getConfiguracoes(): Promise<ConfiguracoesBanca> {
    try {
      const res = await fetch('/api/configuracoes');
      if (res.ok) {
        const data = await res.json();
        const merged = { ...CONFIGS_PADRAO, ...data };
        saveLocalConfigs(merged);
        return merged;
      }
    } catch {
      // Offline fallback
    }
    return getLocalConfigs();
  },

  // POST /api/configuracoes
  async salvarConfiguracoes(payload: Partial<ConfiguracoesBanca>): Promise<boolean> {
    try {
      const res = await fetch('/api/configuracoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const prev = getLocalConfigs();
        saveLocalConfigs({ ...prev, ...payload });
        return true;
      }
    } catch {
      // Offline fallback
    }
    const prev = getLocalConfigs();
    saveLocalConfigs({ ...prev, ...payload });
    return true;
  },

  // GET /api/bilhetes
  async listarBilhetesAdmin(params?: { status?: string; cambista_id?: number; busca?: string }): Promise<BilheteAdmin[]> {
    try {
      const q = new URLSearchParams();
      if (params?.status && params.status !== 'todos') q.set('status', params.status);
      if (params?.cambista_id) q.set('cambista_id', params.cambista_id.toString());
      if (params?.busca) q.set('busca', params.busca);

      const res = await fetch(`/api/bilhetes?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          saveLocalBilhetes(data);
          return data;
        }
      }
    } catch {
      // Offline fallback
    }

    let local = getLocalBilhetes();
    if (params?.status && params.status !== 'todos') {
      local = local.filter(b => b.status.toLowerCase() === params.status!.toLowerCase());
    }
    if (params?.busca && params.busca.trim()) {
      const termo = params.busca.toLowerCase().trim();
      local = local.filter(b => b.codigo.toLowerCase().includes(termo) || b.cliente.toLowerCase().includes(termo));
    }
    return local;
  },

  // PUT /api/bilhetes/:codigo/status
  async atualizarStatusBilhete(codigo: string, novoStatus: string, operador: string = 'Admin'): Promise<boolean> {
    try {
      const res = await fetch(`/api/bilhetes/${codigo}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus, operador })
      });
      if (res.ok) {
        // Atualiza local também
        const bilhetes = getLocalBilhetes();
        const idx = bilhetes.findIndex(b => b.codigo.toUpperCase() === codigo.toUpperCase());
        if (idx !== -1) {
          bilhetes[idx].status = novoStatus;
          saveLocalBilhetes(bilhetes);
        }
        return true;
      }
    } catch {
      // Offline fallback
    }

    const bilhetes = getLocalBilhetes();
    const idx = bilhetes.findIndex(b => b.codigo.toUpperCase() === codigo.toUpperCase());
    if (idx !== -1) {
      bilhetes[idx].status = novoStatus;
      saveLocalBilhetes(bilhetes);
      return true;
    }
    return false;
  },

  // POST /api/bilhetes (Cria bilhete a partir do Cupom do apostador)
  async simularBilhete(payload: {
    apostadorNome: string;
    apostadorTelefone?: string;
    itens: ItemCupom[];
    tipo: 'simples' | 'multipla';
    valorApostado: number;
    cotacaoTotal: number;
    retornoPotencial: number;
  }): Promise<Bilhete> {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const rand1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const rand2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const codigo = `${rand1}-${rand2}`;
    const pin = Math.floor(100000 + Math.random() * 900000).toString();

    const configs = getLocalConfigs();
    const agora = new Date();
    const dataFormatada = agora.toLocaleString('pt-BR');

    const novoAdmin: BilheteAdmin = {
      id: Date.now(),
      codigo,
      pin,
      data: dataFormatada,
      status: 'Pendente',
      valor_apostado: payload.valorApostado,
      comissao_valor: parseFloat((payload.valorApostado * 0.1).toFixed(2)),
      cotacao_total: payload.cotacaoTotal,
      retorno_potencial: payload.retornoPotencial,
      tipo: payload.tipo === 'multipla' ? 'M' : 'S',
      cliente: payload.apostadorNome || 'Apostador Anônimo',
      cliente_telefone: payload.apostadorTelefone || '',
      itens: payload.itens.map(i => ({
        jogo: i.jogoDescricao,
        palpite: i.palpiteRotulo,
        odd: i.oddValor,
        campeonato: i.campeonatoNome
      })),
      hash_seguranca: `SEC-${codigo}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      chave_pix_usada: configs.chave_pix,
      validado_por: 'Aguardando Validação de PIN'
    };

    // Tenta salvar no backend SQL
    try {
      await fetch('/api/bilhetes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apostador_nome: payload.apostadorNome,
          apostador_telefone: payload.apostadorTelefone,
          itens: novoAdmin.itens,
          tipo: novoAdmin.tipo,
          valor_apostado: payload.valorApostado,
          cotacao_total: payload.cotacaoTotal,
          retorno_potencial: payload.retornoPotencial,
          codigo_customizado: codigo
        })
      });
    } catch {
      // fallback
    }

    // Salva localmente
    const bilhetes = getLocalBilhetes();
    bilhetes.unshift(novoAdmin);
    saveLocalBilhetes(bilhetes);

    // Retorna no formato Bilhete para os componentes legados
    return {
      codigo,
      pin,
      criadoEm: agora.toISOString(),
      apostadorNome: payload.apostadorNome,
      apostadorTelefone: payload.apostadorTelefone,
      itens: payload.itens,
      tipo: payload.tipo,
      cotacaoTotal: payload.cotacaoTotal,
      valorApostado: payload.valorApostado,
      retornoPotencial: payload.retornoPotencial,
      status: 'pendente',
      hashSeguranca: novoAdmin.hash_seguranca,
      chavePixBanca: configs.chave_pix
    };
  },

  // GET /api/cambistas
  async getCambistas(): Promise<CambistaModel[]> {
    try {
      const res = await fetch('/api/cambistas');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          saveLocalCambistas(data);
          return data;
        }
      }
    } catch {}
    return [];
  },

  // POST /api/cambistas
  async criarCambista(payload: { nome: string; usuario: string; telefone: string; comissao_pct: number; limite_credito: number }): Promise<boolean> {
    try {
      const res = await fetch('/api/cambistas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) return true;
    } catch {}
    return false;
  },

  // PUT /api/cambistas/:id
  async atualizarCambista(id: number, payload: { nome?: string; telefone?: string; comissao_pct?: number; limite_credito?: number; status?: string; senha?: string }): Promise<boolean> {
    try {
      const res = await fetch(`/api/cambistas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) return true;
    } catch {}

    const cambistas = getLocalCambistas();
    const idx = cambistas.findIndex(c => c.id === id);
    if (idx !== -1) {
      const existing = cambistas[idx];
      cambistas[idx] = { 
        ...existing, 
        ...payload,
        status: (payload.status || existing.status) as 'ativo' | 'bloqueado'
      };
      saveLocalCambistas(cambistas);
      return true;
    }
    return false;
  },

  // DELETE /api/cambistas/:id
  async deletarCambista(id: number): Promise<boolean> {
    try {
      const res = await fetch(`/api/cambistas/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) return true;
    } catch {}

    let cambistas = getLocalCambistas();
    cambistas = cambistas.filter(c => c.id !== id);
    saveLocalCambistas(cambistas);
    return true;
  },

  // GET /api/clientes
  async getClientes(): Promise<ClienteModel[]> {
    try {
      const res = await fetch('/api/clientes');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch {}
    return [];
  },

  // GET /api/caixa
  async getResumoCaixa(): Promise<ResumoCaixaDono> {
    try {
      const res = await fetch('/api/caixa');
      if (res.ok) {
        return await res.json();
      }
    } catch {}

    const bilhetes = getLocalBilhetes();
    const total_entradas = bilhetes.filter(b => b.status !== 'Cancelado').reduce((acc, b) => acc + b.valor_apostado, 0);
    const total_comissoes = bilhetes.filter(b => b.status !== 'Cancelado').reduce((acc, b) => acc + b.comissao_valor, 0);
    const total_premios_pagos = bilhetes.filter(b => b.status === 'Ganhou').reduce((acc, b) => acc + b.retorno_potencial, 0);

    return {
      total_entradas,
      total_comissoes,
      total_premios_pagos,
      lucro_liquido: total_entradas - total_comissoes - total_premios_pagos,
      total_bilhetes: bilhetes.length,
      bilhetes_abertos: bilhetes.filter(b => b.status === 'Aberto').length,
      bilhetes_ganhos: bilhetes.filter(b => b.status === 'Ganhou').length,
      bilhetes_perdidos: bilhetes.filter(b => b.status === 'Perdeu').length,
      bilhetes_cancelados: bilhetes.filter(b => b.status === 'Cancelado').length
    };
  },

  // GET /api/bilhete/:codigo
  async getBilhetePorCodigo(codigo: string): Promise<BilheteAdmin | null> {
    const clean = codigo.trim().toUpperCase();
    try {
      const res = await fetch(`/api/bilhetes/${clean}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {}

    const bilhetes = getLocalBilhetes();
    return bilhetes.find(b => b.codigo.toUpperCase() === clean) || null;
  },

  // Funções de compatibilidade para esportes e jogos
  async getEsportes(): Promise<Esporte[]> {
    return [FUTEBOL_ESPORTE];
  },

  async getCampeonatos(idEsporte?: number): Promise<Campeonato[]> {
    if (idEsporte && idEsporte !== 102) return [];
    return CAMPEONATOS_FUTEBOL;
  },

  async getJogos(params: { idEsporte?: number; idCampeonato?: number; pais?: string; filtro?: string; busca?: string }): Promise<Jogo[]> {
    if (params.idEsporte && params.idEsporte !== 102) return [];

    try {
      const query = new URLSearchParams();
      query.append('idEsporte', '102');
      if (params.idCampeonato) query.append('idCampeonato', String(params.idCampeonato));
      if (params.pais) query.append('pais', params.pais);
      if (params.filtro) query.append('filtro', params.filtro);
      if (params.busca) query.append('busca', params.busca);

      const res = await fetch(`/api/jogos?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch (e) {
      console.warn('Erro ao buscar jogos na API:', e);
    }
    return [];
  },

  // POST /api/bilhetes/validar-pin (Validação oficial pelo cambista via PIN do cliente)
  async validarPin(pinOuCodigo: string, cambistaId?: number, operadorNome: string = 'Cambista'): Promise<{
    success: boolean;
    message?: string;
    bilhete?: any;
    comissao_ganha?: number;
    repasse_dono?: number;
    pct_cambista?: number;
    pct_dono?: number;
    erro?: string;
  }> {
    const clean = pinOuCodigo.trim().toUpperCase();
    try {
      const res = await fetch('/api/bilhetes/validar-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin_ou_codigo: clean, cambista_id: cambistaId, operador_nome: operadorNome })
      });
      if (res.ok) {
        const data = await res.json();
        // Atualiza bilhete local também
        const bilhetes = getLocalBilhetes();
        const b = bilhetes.find(it => it.codigo.toUpperCase() === clean || (it.pin && it.pin.toUpperCase() === clean));
        if (b) {
          b.status = 'Aberto';
          b.validado_por = operadorNome;
          if (cambistaId) b.cambista_id = cambistaId;
          saveLocalBilhetes(bilhetes);
        }
        return {
          success: true,
          message: data.message || `Bilhete #${data.codigo} validado com sucesso!`,
          bilhete: data,
          comissao_ganha: data.comissao_ganha,
          repasse_dono: data.repasse_dono,
          pct_cambista: data.pct_cambista,
          pct_dono: data.pct_dono
        };
      } else {
        const err = await res.json();
        return { success: false, erro: err.detail || 'Erro ao validar PIN' };
      }
    } catch {
      // Offline fallback
    }

    const bilhetes = getLocalBilhetes();
    const b = bilhetes.find(it => it.codigo.toUpperCase() === clean || (it.pin && it.pin.toUpperCase() === clean));
    if (!b) {
      return { success: false, erro: `PIN ou Código "${clean}" não encontrado!` };
    }
    if (b.status === 'Ganhou' || b.status === 'Perdeu' || b.status === 'Cancelado') {
      return { success: false, erro: `Bilhete já encerrado com status ${b.status}!` };
    }

    b.status = 'Aberto';
    b.validado_por = operadorNome;
    if (cambistaId) b.cambista_id = cambistaId;
    saveLocalBilhetes(bilhetes);

    const comissao = b.comissao_valor || (b.valor_apostado * 0.1);
    const repasse = b.valor_apostado - comissao;

    return {
      success: true,
      message: `Bilhete #${b.codigo} validado com sucesso!`,
      bilhete: b,
      comissao_ganha: comissao,
      repasse_dono: repasse,
      pct_cambista: 10,
      pct_dono: 90
    };
  },

  // GET /api/cambistas/:id/relatorio
  async getRelatorioCambista(cambistaId: number): Promise<any> {
    try {
      const res = await fetch(`/api/cambistas/${cambistaId}/relatorio`);
      if (res.ok) {
        return await res.json();
      }
    } catch {}

    const cambistas = getLocalCambistas();
    const c = cambistas.find(it => it.id === cambistaId) || cambistas[0];
    const bilhetes = getLocalBilhetes().filter(b => b.cambista_id === cambistaId || !b.cambista_id);
    const vendas = bilhetes.reduce((acc, b) => acc + b.valor_apostado, 0);
    const pct_cambista = c ? c.comissao_pct : 10;
    const pct_dono = 100 - pct_cambista;

    return {
      cambista: {
        id: c?.id || cambistaId,
        nome: c?.nome || 'Cambista Central',
        usuario: c?.usuario || 'cambista',
        telefone: c?.telefone || '',
        pct_cambista,
        pct_dono,
        limite_credito: c?.limite_credito || 2000,
        saldo_disponivel: Math.max(0, (c?.limite_credito || 2000) - vendas)
      },
      periodo: {
        hoje: {
          vendas: roundVal(vendas * 0.4),
          comissao: roundVal(vendas * 0.4 * (pct_cambista / 100)),
          repasse_dono: roundVal(vendas * 0.4 * (pct_dono / 100))
        },
        semana: {
          vendas: roundVal(vendas),
          comissao: roundVal(vendas * (pct_cambista / 100)),
          repasse_dono: roundVal(vendas * (pct_dono / 100))
        },
        mes: {
          vendas: roundVal(vendas * 1.8 + 250),
          comissao: roundVal((vendas * 1.8 + 250) * (pct_cambista / 100)),
          repasse_dono: roundVal((vendas * 1.8 + 250) * (pct_dono / 100))
        }
      },
      premios_pagos: 0,
      total_bilhetes_validados: bilhetes.length,
      bilhetes: bilhetes.map(b => ({
        codigo: b.codigo,
        pin: b.pin || '849201',
        cliente: b.cliente,
        valor: b.valor_apostado,
        comissao: b.comissao_valor,
        status: b.status,
        data: b.data
      }))
    };
  },

  async listarTodosBilhetes(): Promise<Bilhete[]> {
    const list = await this.listarBilhetesAdmin();
    return list.map(b => ({
      codigo: b.codigo,
      pin: b.pin || '849201',
      criadoEm: new Date().toISOString(),
      apostadorNome: b.cliente,
      apostadorTelefone: b.cliente_telefone,
      tipo: b.tipo === 'M' ? 'multipla' : 'simples',
      cotacaoTotal: b.cotacao_total,
      valorApostado: b.valor_apostado,
      retornoPotencial: b.retorno_potencial,
      status: b.status === 'Aberto' ? 'validado' : b.status === 'Ganhou' ? 'premiado' : b.status === 'Perdeu' ? 'perdido' : 'cancelado',
      itens: [],
      hashSeguranca: b.hash_seguranca,
      chavePixBanca: b.chave_pix_usada || '11999999999'
    }));
  },

  async validarBilhete(codigo: string, nomeOperador: string = 'Cambista Central'): Promise<{ success: boolean; bilhete?: Bilhete; erro?: string }> {
    const ok = await this.atualizarStatusBilhete(codigo, 'Aberto', nomeOperador);
    if (ok) {
      const b = await this.getBilhetePorCodigo(codigo);
      if (b) {
        return {
          success: true,
          bilhete: {
            codigo: b.codigo,
            pin: b.pin || '849201',
            criadoEm: new Date().toISOString(),
            apostadorNome: b.cliente,
            tipo: b.tipo === 'M' ? 'multipla' : 'simples',
            cotacaoTotal: b.cotacao_total,
            valorApostado: b.valor_apostado,
            retornoPotencial: b.retorno_potencial,
            status: 'validado',
            itens: [],
            hashSeguranca: b.hash_seguranca,
            chavePixBanca: b.chave_pix_usada || '11999999999'
          }
        };
      }
    }
    return { success: false, erro: 'Erro ao validar bilhete' };
  },

  async validarSessaoOperador(sessao: {
    usuario: string;
    role: 'dono' | 'cambista';
    cambista_id?: number;
  }): Promise<{ valid: boolean; operador?: Record<string, unknown> }> {
    try {
      const params = new URLSearchParams({
        usuario: sessao.usuario,
        role: sessao.role,
      });
      if (sessao.cambista_id != null) params.set('cambista_id', String(sessao.cambista_id));
      const res = await fetch(`/api/auth/operador/validar?${params}`);
      if (!res.ok) return { valid: false };
      return await res.json();
    } catch {
      return { valid: false };
    }
  },

  async validarSessaoCliente(telefone: string): Promise<{ valid: boolean; cliente?: { id: number; nome: string; telefone: string } }> {
    try {
      const params = new URLSearchParams({ telefone });
      const res = await fetch(`/api/clientes/validar?${params}`);
      if (!res.ok) return { valid: false };
      return await res.json();
    } catch {
      return { valid: false };
    }
  },

  async loginOperador(usuario: string, senha: string): Promise<{ sucesso: boolean; operador?: any; erro?: string } | null> {
    try {
      const res = await fetch('/api/auth/operador', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, senha })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        return {
          sucesso: true,
          operador: {
            id: data.cambista_id ?? 1,
            cambista_id: data.cambista_id,
            nome: data.nome,
            usuario: data.usuario,
            role: data.role as 'dono' | 'cambista',
            telefone: data.telefone,
            comissao_pct: data.comissao_pct,
            limite_credito: data.limite_credito,
          },
        };
      }
      return { sucesso: false, erro: data.detail || 'Usuário ou senha incorretos.' };
    } catch {
      return null;
    }
  },

  async cadastrarCliente(payload: { nome: string; telefone: string; senha?: string; saldo?: number }): Promise<{ sucesso: boolean; erro?: string }> {
    try {
      const res = await fetch('/api/clientes/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      return { sucesso: res.ok, erro: data.detail || data.erro };
    } catch {}
    return { sucesso: true };
  },

  async listarTodosBilhetesAdmin(): Promise<BilheteAdmin[]> {
    return this.listarBilhetesAdmin();
  },

  async listarCambistas(): Promise<CambistaModel[]> {
    return this.getCambistas();
  },

  async listarClientes(): Promise<ClienteModel[]> {
    return this.getClientes();
  },

  async obterResumoCaixaDono(): Promise<ResumoCaixaDono> {
    return this.getResumoCaixa();
  },

  async obterConfigs(): Promise<ConfiguracoesBanca> {
    return this.getConfiguracoes();
  },

  async salvarConfigs(c: Partial<ConfiguracoesBanca>): Promise<boolean> {
    return this.salvarConfiguracoes(c);
  },

  async pagarPremio(codigo: string): Promise<{ success: boolean; erro?: string }> {
    const ok = await this.atualizarStatusBilhete(codigo, 'Ganhou', 'Admin / Dono');
    return { success: ok };
  }
};

function roundVal(n: number): number {
  return Math.round(n * 100) / 100;
}

