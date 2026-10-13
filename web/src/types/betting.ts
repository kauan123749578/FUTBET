export type StatusJogo = 'agendado' | 'ao_vivo' | 'finalizado';
export type TipoAposta = 'simples' | 'multipla';
export type StatusBilhete = 'pendente' | 'validado' | 'premiado' | 'perdido' | 'cancelado' | 'Aberto' | 'Ganhou' | 'Perdeu' | 'Cancelado';

export interface Esporte {
  id: number; // ex: 102 (Futebol)
  nome: string;
  icone: string;
  totalJogos: number;
}

export interface Campeonato {
  id: number; // ex: 574584 (Brasileirão Série A)
  idEsporte: number;
  pais: string;
  bandeira: string;
  nome: string;
  totalJogos: number;
  destaque?: boolean;
}

export interface Odd {
  id: string; // ex: '1x2_home', '1x2_draw', 'over_25'
  tipo: string;
  rotulo: string; // ex: 'Casa', 'Empate', 'Fora', '+2.5 Gols', 'Ambas Marcam'
  valor: number;
  variacao?: 'subiu' | 'desceu' | 'estavel';
}

export interface Mercado {
  id: string;
  nome: string; // '1X2', 'Gols Mais/Menos', 'Ambas Marcam', 'Dupla Chance', 'Escanteios'
  odds: Odd[];
}

export interface Jogo {
  id: string | number;
  idEsporte: number;
  idCampeonato: number;
  campeonatoNome: string;
  pais: string;
  bandeira: string;
  dataHora: string; // ISO string
  dataHoraFormatada: string; // ex: '10/Out 21:00'
  diaSemana: string;
  dataIso?: string; // ex: '2026-10-11'
  mandante: string;
  mandanteEscudo?: string;
  visitante: string;
  visitanteEscudo?: string;
  estadio: string;
  status: StatusJogo;
  tempoAoVivo?: string; // ex: "38' 1T"
  placarMandante?: number;
  placarVisitante?: number;
  mercadoPrincipal: {
    casa: Odd;
    empate: Odd;
    fora: Odd;
  };
  mercadosAdicionais: Mercado[];
  totalMercadosDisponiveis: number;
}

export interface ItemCupom {
  jogoId: string | number;
  jogoDescricao: string; // ex: "São Paulo x Vitória"
  mandante: string;
  visitante: string;
  campeonatoNome: string;
  dataHoraFormatada: string;
  mercadoId: string;
  mercadoNome: string; // ex: "Resultado Final (1X2)"
  palpiteRotulo: string; // ex: "Casa (São Paulo)"
  oddValor: number;
  statusPalpite?: 'pendente' | 'acertou' | 'errou';
}

export interface Bilhete {
  codigo: string; // ex: 'TCQG-H6UC'
  pin?: string;   // ex: '849201'
  criadoEm: string;
  apostadorNome: string;
  apostadorTelefone?: string;
  itens: ItemCupom[];
  tipo: TipoAposta;
  cotacaoTotal: number;
  valorApostado: number;
  retornoPotencial: number;
  status: StatusBilhete;
  validadoPor?: string;
  validadoEm?: string;
  pagoEm?: string;
  hashSeguranca: string;
  chavePixBanca: string;
  cambistaNome?: string;
}

export interface BilheteAdmin {
  id: number;
  codigo: string;
  pin?: string;
  data: string;
  status: 'Aberto' | 'Ganhou' | 'Perdeu' | 'Cancelado' | string;
  valor_apostado: number;
  comissao_valor: number;
  cotacao_total: number;
  retorno_potencial: number;
  tipo: 'M' | 'S';
  cliente: string;
  cliente_nome?: string;
  cliente_telefone?: string;
  cambista_id?: number;
  cambista_nome?: string;
  itens: Array<{
    jogo?: string;
    palpite?: string;
    odd?: number;
    campeonato?: string;
    jogoDescricao?: string;
    palpiteRotulo?: string;
    oddValor?: number;
  }>;
  hash_seguranca: string;
  chave_pix_usada?: string;
  validado_por?: string;
  retorno_possivel?: number;
}

export interface CambistaModel {
  id: number;
  nome: string;
  usuario: string;
  telefone: string;
  whatsapp?: string;
  comissao_pct: number;
  pct_dono?: number;
  limite_credito: number;
  saldo_disponivel: number;
  saldo_utilizado: number;
  total_vendas: number;
  total_comissao: number;
  total_bilhetes: number;
  total_apostas?: number;
  comissao_acumulada?: number;
  vendas_hoje?: number;
  vendas_semana?: number;
  vendas_mes?: number;
  comissao_hoje?: number;
  comissao_semana?: number;
  comissao_mes?: number;
  repasse_dono_hoje?: number;
  repasse_dono_semana?: number;
  repasse_dono_mes?: number;
  premios_pagos?: number;
  status: 'ativo' | 'bloqueado';
  criado_em: string;
}

export interface ClienteModel {
  id: number;
  nome: string;
  telefone: string;
  saldo?: number;
  total_apostado: number;
  total_bilhetes: number;
  criado_em: string;
}

export interface ConfiguracoesBanca {
  whatsapp_dono: string;
  chave_pix: string;
  nome_banca: string;
  comissao_padrao: string;
  limite_padrao_cambista: string;
}

export interface ResumoCaixaDono {
  total_entradas: number;
  total_comissoes: number;
  total_premios_pagos: number;
  lucro_liquido: number;
  saldo_liquido?: number;
  total_bilhetes: number;
  bilhetes_abertos: number;
  bilhetes_ganhos: number;
  bilhetes_perdidos: number;
  bilhetes_cancelados: number;
}

export interface FiltrosAtivos {
  idEsporte: number;
  idCampeonato?: number;
  paisFiltro?: string;
  dataFiltro?: 'hoje' | 'amanha' | 'semana' | 'todos' | 'ao_vivo' | string;
  termoBusca?: string;
}

export interface ResumoBanca {
  saldoLimiteCambista: number;
  comissaoPercentual: number;
  totalBilhetesValidados: number;
  totalVendidoHoje: number;
  totalComissaoHoje: number;
  totalPremiosPagosHoje: number;
  lucroLiquidoEstimado: number;
}

export interface SessaoOperador {
  id?: number;
  role: 'dono' | 'cambista';
  nome: string;
  usuario: string;
  cambista_id?: number;
  telefone?: string;
  comissao_pct?: number;
  limite_credito?: number;
}

export interface SessaoCliente {
  id?: number;
  nome: string;
  telefone: string;
}
