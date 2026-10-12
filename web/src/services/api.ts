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

// Constantes de armazenamento local
const STORAGE_BILHETES_ADMIN_KEY = 'escanteiobet_bilhetes_admin_v3';
const STORAGE_CONFIGS_KEY = 'escanteiobet_configs_v3';
const STORAGE_CAMBISTAS_KEY = 'escanteiobet_cambistas_v3';
const STORAGE_CLIENTES_KEY = 'escanteiobet_clientes_v3';

export const ESPORTES_MOCK: Esporte[] = [
  { id: 102, nome: 'Futebol', icone: '⚽', totalJogos: 32 },
  { id: 103, nome: 'Basquete', icone: '🏀', totalJogos: 8 },
  { id: 104, nome: 'Tênis', icone: '🎾', totalJogos: 6 },
  { id: 105, nome: 'E-Sports', icone: '🎮', totalJogos: 10 },
  { id: 106, nome: 'Vôlei', icone: '🏐', totalJogos: 4 },
];

export const CAMPEONATOS_MOCK: Campeonato[] = [
  { id: 574584, idEsporte: 102, pais: 'Brasil', bandeira: '🇧🇷', nome: 'Brasileiro Série A', totalJogos: 10, destaque: true },
  { id: 574585, idEsporte: 102, pais: 'Brasil', bandeira: '🇧🇷', nome: 'Brasileiro Série B', totalJogos: 4, destaque: true },
  { id: 574586, idEsporte: 102, pais: 'Clubes Internacionais', bandeira: '🏆', nome: 'Copa Libertadores', totalJogos: 2, destaque: true },
  { id: 574587, idEsporte: 102, pais: 'Clubes Internacionais', bandeira: '⭐', nome: 'UEFA Champions League', totalJogos: 2, destaque: true },
  { id: 574588, idEsporte: 102, pais: 'Inglaterra', bandeira: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', nome: 'Premier League', totalJogos: 3, destaque: true },
  { id: 574589, idEsporte: 102, pais: 'Espanha', bandeira: '🇪🇸', nome: 'La Liga', totalJogos: 3, destaque: true },
  { id: 574597, idEsporte: 102, pais: 'Itália', bandeira: '🇮🇹', nome: 'Serie A', totalJogos: 2 },
  { id: 574598, idEsporte: 102, pais: 'Alemanha', bandeira: '🇩🇪', nome: 'Bundesliga', totalJogos: 2 },
  { id: 574599, idEsporte: 102, pais: 'Holanda', bandeira: '🇳🇱', nome: 'Eredivisie', totalJogos: 1 },
  { id: 574600, idEsporte: 102, pais: 'França', bandeira: '🇫🇷', nome: 'Ligue 1', totalJogos: 1 },
  { id: 574601, idEsporte: 102, pais: 'Portugal', bandeira: '🇵🇹', nome: 'Primeira Liga', totalJogos: 1 },
  { id: 574591, idEsporte: 102, pais: 'Argentina', bandeira: '🇦🇷', nome: 'Liga Profesional', totalJogos: 1 },
  { id: 574602, idEsporte: 102, pais: 'México', bandeira: '🇲🇽', nome: 'Liga MX', totalJogos: 1 },
  { id: 574603, idEsporte: 102, pais: 'Chile', bandeira: '🇨🇱', nome: 'Primera División', totalJogos: 1 },
  { id: 574592, idEsporte: 103, pais: 'EUA', bandeira: '🇺🇸', nome: 'NBA', totalJogos: 8 },
  { id: 574593, idEsporte: 105, pais: 'Mundial', bandeira: '🌐', nome: 'CS2 Major Championship', totalJogos: 6 },
];

export const JOGOS_MOCK: Jogo[] = [];


// Dados Iniciais Fiéis à Foto do Usuário
export const BILHETES_FOTO_INICIAIS: BilheteAdmin[] = [
  {
    id: 1,
    codigo: 'TCQG-H6UC',
    data: '07/10/2026 15:08:36',
    status: 'Aberto',
    valor_apostado: 10.00,
    comissao_valor: 1.00,
    cotacao_total: 9.13,
    retorno_potencial: 91.20,
    tipo: 'M',
    cliente: 'Kevin',
    cliente_telefone: '(11) 98765-1111',
    itens: [
      { jogo: 'São Paulo FC x EC Vitória', palpite: 'São Paulo Vence', odd: 1.55 },
      { jogo: 'Flamengo x Palmeiras', palpite: 'Ambas Marcam', odd: 1.75 },
      { jogo: 'CA Tigre x CA Banfield', palpite: 'CA Tigre Vence', odd: 1.63 },
      { jogo: 'Cruzeiro x Grêmio', palpite: '+1.5 Gols', odd: 1.25 }
    ],
    hash_seguranca: 'SEC-TCQG-H6UC-991',
    chave_pix_usada: '11999999999',
    validado_por: 'Kevin Cambista'
  },
  {
    id: 2,
    codigo: 'F47G-B7R4',
    data: '07/10/2026 15:08:10',
    status: 'Aberto',
    valor_apostado: 5.00,
    comissao_valor: 0.50,
    cotacao_total: 75.04,
    retorno_potencial: 376.20,
    tipo: 'M',
    cliente: 'Kevin',
    cliente_telefone: '(11) 98765-1111',
    itens: [
      { jogo: 'São Paulo FC x EC Vitória', palpite: 'São Paulo e +2.5', odd: 2.80 },
      { jogo: 'Flamengo x Palmeiras', palpite: 'Palmeiras Vence', odd: 3.45 },
      { jogo: 'Real Madrid x Barcelona', palpite: 'Real Madrid', odd: 2.10 },
      { jogo: 'Arsenal x Chelsea', palpite: 'Arsenal Vence', odd: 1.85 },
      { jogo: 'Milan x Inter', palpite: 'Inter Vence', odd: 2.15 }
    ],
    hash_seguranca: 'SEC-F47G-B7R4-882',
    chave_pix_usada: '11999999999',
    validado_por: 'Kevin Cambista'
  },
  {
    id: 3,
    codigo: '7MT7-7Q8Q',
    data: '07/10/2026 15:00:56',
    status: 'Aberto',
    valor_apostado: 10.00,
    comissao_valor: 1.00,
    cotacao_total: 16.77,
    retorno_potencial: 167.70,
    tipo: 'M',
    cliente: 'Batata',
    cliente_telefone: '(11) 98765-2222',
    itens: [
      { jogo: 'Santos x Ponte Preta', palpite: 'Santos Vence', odd: 1.50 },
      { jogo: 'Vasco x Botafogo', palpite: 'Ambas Marcam', odd: 1.80 },
      { jogo: 'Boca Juniors x Racing', palpite: 'Empate', odd: 3.10 },
      { jogo: 'Bahia x Fortaleza', palpite: '+2.5 Gols', odd: 2.00 }
    ],
    hash_seguranca: 'SEC-7MT7-7Q8Q-773',
    chave_pix_usada: '11999999999',
    validado_por: 'Kevin Cambista'
  },
  {
    id: 4,
    codigo: 'APY8-E9QI',
    data: '07/10/2026 14:34:27',
    status: 'Aberto',
    valor_apostado: 50.00,
    comissao_valor: 5.00,
    cotacao_total: 129.78,
    retorno_potencial: 6489.00,
    tipo: 'M',
    cliente: 'Henrique Gabriel',
    cliente_telefone: '(11) 98765-3333',
    itens: [
      { jogo: 'Liverpool x Man City', palpite: 'Liverpool Vence', odd: 2.45 },
      { jogo: 'Bayern x Dortmund', palpite: 'Bayern -1.5', odd: 2.20 },
      { jogo: 'PSG x Marseille', palpite: '+3.5 Gols', odd: 2.50 },
      { jogo: 'Benfica x Porto', palpite: 'Benfica Vence', odd: 2.15 },
      { jogo: 'Atlético-MG x Cruzeiro', palpite: 'Ambas Marcam', odd: 1.95 }
    ],
    hash_seguranca: 'SEC-APY8-E9QI-664',
    chave_pix_usada: '11999999999',
    validado_por: 'Kevin Cambista'
  },
  {
    id: 5,
    codigo: 'PDTM-BTZN',
    data: '07/10/2026 14:30:33',
    status: 'Aberto',
    valor_apostado: 10.00,
    comissao_valor: 1.00,
    cotacao_total: 22.25,
    retorno_potencial: 222.50,
    tipo: 'M',
    cliente: 'Yari',
    cliente_telefone: '(11) 98765-4444',
    itens: [
      { jogo: 'Internacional x Coritiba', palpite: 'Inter Vence', odd: 1.45 },
      { jogo: 'Athletico-PR x Juventude', palpite: 'Athletico Vence', odd: 1.65 },
      { jogo: 'Cuiabá x Criciúma', palpite: 'Menos de 2.5 Gols', odd: 1.60 },
      { jogo: 'Sport x Ceará', palpite: 'Ambas Marcam', odd: 1.90 },
      { jogo: 'Goiás x Vila Nova', palpite: 'Goiás Vence', odd: 2.10 }
    ],
    hash_seguranca: 'SEC-PDTM-BTZN-555',
    chave_pix_usada: '11999999999',
    validado_por: 'Kevin Cambista'
  },
  {
    id: 6,
    codigo: 'YCOG-XWHN',
    data: '07/10/2026 12:47:47',
    status: 'Aberto',
    valor_apostado: 40.00,
    comissao_valor: 4.00,
    cotacao_total: 5.65,
    retorno_potencial: 226.00,
    tipo: 'M',
    cliente: 'Arthur',
    cliente_telefone: '(11) 98765-5555',
    itens: [
      { jogo: 'Flamengo x Palmeiras', palpite: 'Flamengo ou Empate (1X)', odd: 1.32 },
      { jogo: 'São Paulo FC x EC Vitória', palpite: 'São Paulo Vence', odd: 1.55 },
      { jogo: 'Real Madrid x Barcelona', palpite: 'Ambas Marcam', odd: 1.55 }
    ],
    hash_seguranca: 'SEC-YCOG-XWHN-446',
    chave_pix_usada: '11999999999',
    validado_por: 'Kevin Cambista'
  },
  {
    id: 7,
    codigo: '1FV7E-OY4X',
    data: '07/10/2026 12:29:43',
    status: 'Aberto',
    valor_apostado: 20.00,
    comissao_valor: 2.00,
    cotacao_total: 8.90,
    retorno_potencial: 178.00,
    tipo: 'M',
    cliente: 'Jonathas',
    cliente_telefone: '(11) 98765-6666',
    itens: [
      { jogo: 'Manchester United x Everton', palpite: 'United Vence', odd: 1.70 },
      { jogo: 'Juventus x Napoli', palpite: 'Menos de 2.5 Gols', odd: 1.75 }
    ],
    hash_seguranca: 'SEC-1FV7E-OY4X-337',
    chave_pix_usada: '11999999999',
    validado_por: 'Kevin Cambista'
  },
  {
    id: 8,
    codigo: 'LLAV-G9YW',
    data: '07/10/2026 11:48:29',
    status: 'Aberto',
    valor_apostado: 25.00,
    comissao_valor: 2.50,
    cotacao_total: 14.56,
    retorno_potencial: 364.00,
    tipo: 'M',
    cliente: 'Yaquinho',
    cliente_telefone: '(11) 98765-7777',
    itens: [
      { jogo: 'Corinthians x Santos', palpite: 'Empate', odd: 3.10 },
      { jogo: 'Palmeiras x Red Bull Bragantino', palpite: 'Palmeiras Vence', odd: 1.55 }
    ],
    hash_seguranca: 'SEC-LLAV-G9YW-228',
    chave_pix_usada: '11999999999',
    validado_por: 'Kevin Cambista'
  },
  {
    id: 9,
    codigo: 'J337-M6W5',
    data: '07/10/2026 11:34:05',
    status: 'Aberto',
    valor_apostado: 10.00,
    comissao_valor: 1.00,
    cotacao_total: 59.85,
    retorno_potencial: 598.50,
    tipo: 'M',
    cliente: 'WL',
    cliente_telefone: '(11) 98765-8888',
    itens: [
      { jogo: 'Arsenal x Brighton', palpite: 'Arsenal -1.5', odd: 2.20 },
      { jogo: 'Aston Villa x Newcastle', palpite: 'Ambas Marcam e +2.5', odd: 2.30 }
    ],
    hash_seguranca: 'SEC-J337-M6W5-119',
    chave_pix_usada: '11999999999',
    validado_por: 'Kevin Cambista'
  },
  {
    id: 10,
    codigo: '08ZX-X5J7',
    data: '07/10/2026 11:30:40',
    status: 'Aberto',
    valor_apostado: 60.00,
    comissao_valor: 6.00,
    cotacao_total: 87.67,
    retorno_potencial: 5260.20,
    tipo: 'M',
    cliente: 'Allan PGD',
    cliente_telefone: '(11) 98765-9999',
    itens: [
      { jogo: 'Flamengo x Palmeiras', palpite: 'Palmeiras Vence', odd: 3.45 },
      { jogo: 'São Paulo x Vitória', palpite: 'São Paulo -1.5', odd: 2.30 }
    ],
    hash_seguranca: 'SEC-08ZX-X5J7-001',
    chave_pix_usada: '11999999999',
    validado_por: 'Kevin Cambista'
  },
  {
    id: 11,
    codigo: '48TB-S1W9',
    data: '07/10/2026 11:21:12',
    status: 'Aberto',
    valor_apostado: 10.00,
    comissao_valor: 1.00,
    cotacao_total: 22.93,
    retorno_potencial: 229.30,
    tipo: 'M',
    cliente: 'Dayane',
    cliente_telefone: '(11) 98765-0001',
    itens: [
      { jogo: 'Bahia x Vasco', palpite: 'Bahia Vence', odd: 1.85 },
      { jogo: 'Fortaleza x Ceará', palpite: 'Ambas Marcam', odd: 1.90 }
    ],
    hash_seguranca: 'SEC-48TB-S1W9-002',
    chave_pix_usada: '11999999999',
    validado_por: 'Kevin Cambista'
  },
  {
    id: 12,
    codigo: 'DAY7-M33H',
    data: '07/10/2026 11:20:38',
    status: 'Aberto',
    valor_apostado: 15.00,
    comissao_valor: 1.50,
    cotacao_total: 119.98,
    retorno_potencial: 1799.70,
    tipo: 'M',
    cliente: 'Juzana',
    cliente_telefone: '(11) 98765-0002',
    itens: [
      { jogo: 'São Paulo x Vitória', palpite: 'São Paulo Vence', odd: 1.55 },
      { jogo: 'Cruzeiro x Grêmio', palpite: 'Empate', odd: 3.20 }
    ],
    hash_seguranca: 'SEC-DAY7-M33H-003',
    chave_pix_usada: '11999999999',
    validado_por: 'Kevin Cambista'
  },
  {
    id: 13,
    codigo: 'T7K4-HJOD',
    data: '07/10/2026 11:14:40',
    status: 'Aberto',
    valor_apostado: 10.00,
    comissao_valor: 1.00,
    cotacao_total: 190.34,
    retorno_potencial: 1903.40,
    tipo: 'M',
    cliente: 'Henrique Gabriel',
    cliente_telefone: '(11) 98765-3333',
    itens: [
      { jogo: 'Milan x Juventus', palpite: 'Empate', odd: 3.20 },
      { jogo: 'Roma x Lazio', palpite: 'Roma Vence', odd: 2.35 }
    ],
    hash_seguranca: 'SEC-T7K4-HJOD-004',
    chave_pix_usada: '11999999999',
    validado_por: 'Kevin Cambista'
  },
  {
    id: 14,
    codigo: 'L6A5-0DO1',
    data: '07/10/2026 11:09:49',
    status: 'Perdeu',
    valor_apostado: 10.00,
    comissao_valor: 1.00,
    cotacao_total: 10.79,
    retorno_potencial: 107.90,
    tipo: 'M',
    cliente: 'Raisson Rodrigues',
    cliente_telefone: '(11) 98765-0003',
    itens: [
      { jogo: 'Chelsea x Everton', palpite: 'Chelsea Vence', odd: 1.50 },
      { jogo: 'Tottenham x Wolves', palpite: 'Tottenham Vence (Errou)', odd: 1.65 }
    ],
    hash_seguranca: 'SEC-L6A5-0DO1-005',
    chave_pix_usada: '11999999999',
    validado_por: 'Kevin Cambista'
  },
  {
    id: 15,
    codigo: '1MNW-Z401',
    data: '07/10/2026 10:54:14',
    status: 'Aberto',
    valor_apostado: 10.00,
    comissao_valor: 1.00,
    cotacao_total: 51.54,
    retorno_potencial: 515.40,
    tipo: 'M',
    cliente: 'Pablo Muniz',
    cliente_telefone: '(11) 98765-0004',
    itens: [
      { jogo: 'Corinthians x Athletico-PR', palpite: 'Corinthians Vence', odd: 1.95 }
    ],
    hash_seguranca: 'SEC-1MNW-Z401-006',
    chave_pix_usada: '11999999999',
    validado_por: 'Kevin Cambista'
  },
  {
    id: 16,
    codigo: '5BD1-RX70',
    data: '06/10/2026 21:00:22',
    status: 'Ganhou',
    valor_apostado: 30.00,
    comissao_valor: 3.00,
    cotacao_total: 18.40,
    retorno_potencial: 552.00,
    tipo: 'M',
    cliente: 'Juan Pablo',
    cliente_telefone: '(11) 98765-0005',
    itens: [
      { jogo: 'São Paulo FC x Coritiba', palpite: 'São Paulo Vence (Acertou)', odd: 1.60 },
      { jogo: 'Flamengo x Fluminense', palpite: 'Ambas Marcam (Acertou)', odd: 1.80 }
    ],
    hash_seguranca: 'SEC-5BD1-RX70-007',
    chave_pix_usada: '11999999999',
    validado_por: 'Kevin Cambista'
  },
  {
    id: 17,
    codigo: 'C5NK-7Z8C',
    data: '06/10/2026 20:52:42',
    status: 'Ganhou',
    valor_apostado: 20.00,
    comissao_valor: 2.00,
    cotacao_total: 13.72,
    retorno_potencial: 274.40,
    tipo: 'M',
    cliente: 'Raisson Rodrigues',
    cliente_telefone: '(11) 98765-0003',
    itens: [
      { jogo: 'Real Madrid x Celta Vigo', palpite: 'Real Vence (Acertou)', odd: 1.35 },
      { jogo: 'Barcelona x Sevilla', palpite: 'Barcelona Vence (Acertou)', odd: 1.45 }
    ],
    hash_seguranca: 'SEC-C5NK-7Z8C-008',
    chave_pix_usada: '11999999999',
    validado_por: 'Kevin Cambista'
  }
];

export const CAMBISTAS_INICIAIS: CambistaModel[] = [
  {
    id: 1,
    nome: 'Kevin Cambista',
    usuario: 'kevin',
    telefone: '11988881111',
    comissao_pct: 10.0,
    limite_credito: 3000.0,
    saldo_disponivel: 2840.0,
    saldo_utilizado: 160.0,
    total_vendas: 160.0,
    total_comissao: 16.0,
    total_bilhetes: 6,
    status: 'ativo',
    criado_em: '01/10/2026'
  },
  {
    id: 2,
    nome: 'Batata Representante',
    usuario: 'batata',
    telefone: '11988882222',
    comissao_pct: 10.0,
    limite_credito: 2000.0,
    saldo_disponivel: 1940.0,
    saldo_utilizado: 60.0,
    total_vendas: 60.0,
    total_comissao: 6.0,
    total_bilhetes: 3,
    status: 'ativo',
    criado_em: '02/10/2026'
  },
  {
    id: 3,
    nome: 'Henrique Cambista',
    usuario: 'henrique',
    telefone: '11988883333',
    comissao_pct: 10.0,
    limite_credito: 5000.0,
    saldo_disponivel: 4940.0,
    saldo_utilizado: 60.0,
    total_vendas: 60.0,
    total_comissao: 6.0,
    total_bilhetes: 2,
    status: 'ativo',
    criado_em: '03/10/2026'
  },
  {
    id: 4,
    nome: 'Arthur Central',
    usuario: 'arthur',
    telefone: '11988884444',
    comissao_pct: 10.0,
    limite_credito: 2500.0,
    saldo_disponivel: 2460.0,
    saldo_utilizado: 40.0,
    total_vendas: 40.0,
    total_comissao: 4.0,
    total_bilhetes: 1,
    status: 'ativo',
    criado_em: '04/10/2026'
  }
];

export const CONFIGS_PADRAO: ConfiguracoesBanca = {
  whatsapp_dono: '5511999999999',
  chave_pix: '11999999999',
  nome_banca: 'FUTBET',
  comissao_padrao: '10.0',
  limite_padrao_cambista: '2000.00'
};

// Funções de Persistência Local
function getLocalBilhetes(): BilheteAdmin[] {
  try {
    const raw = localStorage.getItem(STORAGE_BILHETES_ADMIN_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_BILHETES_ADMIN_KEY, JSON.stringify(BILHETES_FOTO_INICIAIS));
      return BILHETES_FOTO_INICIAIS;
    }
    return JSON.parse(raw);
  } catch {
    return BILHETES_FOTO_INICIAIS;
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
    if (!raw) {
      localStorage.setItem(STORAGE_CONFIGS_KEY, JSON.stringify(CONFIGS_PADRAO));
      return CONFIGS_PADRAO;
    }
    const parsed = JSON.parse(raw);
    if (parsed.nome_banca === 'ESCANTEIOBET') {
      parsed.nome_banca = 'FUTBET';
      localStorage.setItem(STORAGE_CONFIGS_KEY, JSON.stringify(parsed));
    }
    return parsed;
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
    if (!raw) {
      localStorage.setItem(STORAGE_CAMBISTAS_KEY, JSON.stringify(CAMBISTAS_INICIAIS));
      return CAMBISTAS_INICIAIS;
    }
    return JSON.parse(raw);
  } catch {
    return CAMBISTAS_INICIAIS;
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
    saldoLimiteCambista: 2840.00,
    comissaoPercentual: 10,
    totalBilhetesValidados: 17,
    totalVendidoHoje: 320.00,
    totalComissaoHoje: 32.00,
    totalPremiosPagosHoje: 826.40,
    lucroLiquidoEstimado: 288.00
  };
}

// =================== SERVIÇO PRINCIPAL DA API (FASTAPI / SQL + OFFLINE FALLBACK) ===================

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
        if (Array.isArray(data) && data.length > 0) {
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
        if (Array.isArray(data) && data.length > 0) {
          saveLocalCambistas(data);
          return data;
        }
      }
    } catch {}
    return getLocalCambistas();
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

    const cambistas = getLocalCambistas();
    cambistas.push({
      id: Date.now(),
      nome: payload.nome,
      usuario: payload.usuario,
      telefone: payload.telefone,
      comissao_pct: payload.comissao_pct,
      limite_credito: payload.limite_credito,
      saldo_disponivel: payload.limite_credito,
      saldo_utilizado: 0,
      total_vendas: 0,
      total_comissao: 0,
      total_bilhetes: 0,
      status: 'ativo',
      criado_em: new Date().toLocaleDateString('pt-BR')
    });
    saveLocalCambistas(cambistas);
    return true;
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
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch {}

    // Gera lista a partir dos bilhetes locais
    const bilhetes = getLocalBilhetes();
    const mapa: { [key: string]: ClienteModel } = {};

    bilhetes.forEach((b, idx) => {
      const nome = b.cliente || 'Cliente';
      if (!mapa[nome]) {
        mapa[nome] = {
          id: idx + 1,
          nome,
          telefone: b.cliente_telefone || '(11) 9' + Math.floor(10000000 + Math.random() * 90000000),
          total_apostado: b.valor_apostado,
          total_bilhetes: 1,
          criado_em: b.data.split(' ')[0]
        };
      } else {
        mapa[nome].total_apostado += b.valor_apostado;
        mapa[nome].total_bilhetes += 1;
      }
    });

    return Object.values(mapa).sort((a, b) => b.total_apostado - a.total_apostado);
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
    return ESPORTES_MOCK;
  },

  async getCampeonatos(idEsporte?: number): Promise<Campeonato[]> {
    if (!idEsporte) return CAMPEONATOS_MOCK;
    return CAMPEONATOS_MOCK.filter(c => c.idEsporte === idEsporte);
  },

  async getJogos(params: { idEsporte?: number; idCampeonato?: number; pais?: string; filtro?: string; busca?: string }): Promise<Jogo[]> {
    try {
      const query = new URLSearchParams();
      if (params.idEsporte) query.append('idEsporte', String(params.idEsporte));
      if (params.idCampeonato) query.append('idCampeonato', String(params.idCampeonato));
      if (params.pais) query.append('pais', params.pais);
      if (params.filtro) query.append('filtro', params.filtro);
      if (params.busca) query.append('busca', params.busca);

      const res = await fetch(`/api/jogos?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch (e) {
      console.warn('Erro ao conectar com /api/jogos ESPN, usando fallback local:', e);
    }

    let result = [...JOGOS_MOCK];
    if (params.idEsporte && params.idEsporte !== 102) {
      result = result.filter(j => j.idEsporte === params.idEsporte);
    } else if (params.idEsporte === 102) {
      result = result.filter(j => j.idEsporte === 102);
    }
    if (params.idCampeonato) {
      result = result.filter(j => j.idCampeonato === params.idCampeonato);
    }
    if (params.pais && params.pais !== 'todos') {
      const pNorm = params.pais.toLowerCase().trim();
      result = result.filter(j => j.pais.toLowerCase().includes(pNorm));
    }
    if (params.filtro && params.filtro !== 'todos') {
      const f = params.filtro.toLowerCase().trim();
      if (f === 'ao_vivo') {
        result = result.filter(j => j.status === 'ao_vivo');
      } else if (f === 'hoje') {
        result = result.filter(j => j.diaSemana === 'Hoje' || j.status === 'ao_vivo' || j.dataHoraFormatada.toLowerCase().includes('hoje'));
      } else if (f === 'amanha' || f === 'amanhã') {
        result = result.filter(j => j.diaSemana === 'Amanhã' || j.dataHoraFormatada.toLowerCase().includes('amanhã'));
      } else if (f.startsWith('2026-')) {
        result = result.filter(j => j.dataIso === f);
      } else {
        result = result.filter(j => j.diaSemana.toLowerCase().includes(f) || j.dataHoraFormatada.toLowerCase().includes(f));
      }
    }
    if (params.busca && params.busca.trim()) {
      const q = params.busca.toLowerCase().trim();
      result = result.filter(j =>
        j.mandante.toLowerCase().includes(q) ||
        j.visitante.toLowerCase().includes(q) ||
        j.campeonatoNome.toLowerCase().includes(q) ||
        j.estadio.toLowerCase().includes(q)
      );
    }
    return result;
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
      premios_pagos: 826.40,
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
    const list = getLocalBilhetes();
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
            nome: data.nome,
            usuario: data.usuario,
            role: data.role as 'dono' | 'cambista',
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

