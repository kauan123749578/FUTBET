import { Bilhete, ConfiguracoesBanca } from '../types/betting';

export const WHATSAPP_SUPORTE_NUM = '5521990808924';
const CHAVE_PIX_PADRAO = '11999999999';

export const CONFIGS_PADRAO_BANCA: ConfiguracoesBanca = {
  whatsapp_dono: WHATSAPP_SUPORTE_NUM,
  chave_pix: CHAVE_PIX_PADRAO,
  nome_banca: 'FUTBET',
  comissao_padrao: '10.0',
  limite_padrao_cambista: '2000.00',
};

const PLACEHOLDER_WA = new Set([
  '5511999999999',
  '55119999999',
  '11999999999',
  '5511111111111',
]);

export function normalizeWhatsappNum(raw?: string): string {
  const digits = (raw || '').replace(/\D/g, '');
  if (!digits || PLACEHOLDER_WA.has(digits)) {
    return WHATSAPP_SUPORTE_NUM;
  }
  return digits.startsWith('55') ? digits : `55${digits}`;
}

export function resolveWhatsappFromConfig(cfg?: Partial<ConfiguracoesBanca>): string {
  return normalizeWhatsappNum(cfg?.whatsapp_dono || CONFIGS_PADRAO_BANCA.whatsapp_dono);
}

export function sanitizeConfiguracoesBanca(
  data: Partial<ConfiguracoesBanca>
): ConfiguracoesBanca {
  const merged: ConfiguracoesBanca = { ...CONFIGS_PADRAO_BANCA, ...data };
  merged.whatsapp_dono = resolveWhatsappFromConfig(merged);
  if (merged.nome_banca === 'ESCANTEIOBET') merged.nome_banca = 'FUTBET';
  return merged;
}

export function formatarMensagemBilheteWhatsApp(
  bilhete: Bilhete,
  configs: Pick<ConfiguracoesBanca, 'nome_banca' | 'chave_pix'>
): string {
  const pinStr = bilhete.pin || '—';
  const listaJogos = bilhete.itens
    .map(
      (it, idx) =>
        `${idx + 1}. *${it.jogoDescricao}*\n   ├ Mercado: ${it.mercadoNome || '1X2'}\n   ├ Palpite: *${it.palpiteRotulo}*\n   └ Cotação: *${it.oddValor.toFixed(2)}*`
    )
    .join('\n\n');

  return (
    `*⚽ ${configs.nome_banca || 'FUTBET'} - NOVO BILHETE DE APOSTA*\n\n` +
    `🎟️ *CÓDIGO:* \`${bilhete.codigo}\`\n` +
    `🔐 *PIN DE VALIDAÇÃO:* \`${pinStr}\`\n` +
    `👤 *Apostador:* ${bilhete.apostadorNome}\n\n` +
    `*JOGOS:*\n${listaJogos}\n\n` +
    `📈 *Cotação Total:* *${bilhete.cotacaoTotal.toFixed(2)}*\n` +
    `💰 *Valor:* *R$ ${bilhete.valorApostado.toFixed(2)}*\n` +
    `🎯 *Possível Retorno:* *R$ ${bilhete.retornoPotencial.toFixed(2)}*\n` +
    `🔑 *PIX:* \`${configs.chave_pix || CONFIGS_PADRAO_BANCA.chave_pix}\`\n\n` +
    `_Enviei pelo site FUTBET. Já fiz o PIX — favor validar meu bilhete com o PIN acima!_`
  );
}

export function abrirWhatsAppBilhete(
  bilhete: Bilhete,
  configs: Pick<ConfiguracoesBanca, 'nome_banca' | 'chave_pix' | 'whatsapp_dono'>
): void {
  const num = resolveWhatsappFromConfig(configs);
  const texto = encodeURIComponent(formatarMensagemBilheteWhatsApp(bilhete, configs));
  window.open(`https://wa.me/${num}?text=${texto}`, '_blank', 'noopener,noreferrer');
}

export function mapStatusBilheteApi(status: string): Bilhete['status'] {
  const s = (status || '').toLowerCase();
  if (s === 'pendente') return 'pendente';
  if (s === 'aberto') return 'validado';
  if (s === 'ganhou') return 'premiado';
  if (s === 'perdeu') return 'perdido';
  if (s === 'cancelado') return 'cancelado';
  return 'pendente';
}
