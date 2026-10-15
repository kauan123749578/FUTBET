import type { Bilhete, SessaoCliente, SessaoOperador } from '../types/betting';

const SESSAO_CLIENTE_KEY = 'futbet_sessao_cliente_v1';
const SESSAO_OPERADOR_KEY = 'futbet_sessao_operador_v1';
const SESSAO_ABA_KEY = 'futbet_aba_sessao_v1';
const LEGACY_OPERADOR_SESSION = 'radar_bet_sessao_operador';

/** 30 dias — operador e cliente permanecem logados no mesmo navegador */
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

type Stored<T> = { v: T; savedAt: number };

function readStored<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Stored<T> | T;
    if (parsed && typeof parsed === 'object' && 'v' in parsed && 'savedAt' in parsed) {
      const bag = parsed as Stored<T>;
      if (Date.now() - bag.savedAt > MAX_AGE_MS) {
        localStorage.removeItem(key);
        return null;
      }
      return bag.v;
    }
    return parsed as T;
  } catch {
    return null;
  }
}

function writeStored<T>(key: string, value: T) {
  const bag: Stored<T> = { v: value, savedAt: Date.now() };
  localStorage.setItem(key, JSON.stringify(bag));
}

export type AbaPersistida = 'apostador' | 'conferir' | 'cambista' | 'regulamento' | 'admin';

export function loadClientePersistido(): SessaoCliente | null {
  return readStored<SessaoCliente>(SESSAO_CLIENTE_KEY);
}

export function saveClientePersistido(dados: SessaoCliente) {
  writeStored(SESSAO_CLIENTE_KEY, dados);
}

export function clearClientePersistido() {
  localStorage.removeItem(SESSAO_CLIENTE_KEY);
}

export function loadOperadorPersistido(): SessaoOperador | null {
  let op = readStored<SessaoOperador>(SESSAO_OPERADOR_KEY);
  if (op) return op;

  try {
    const legacy = sessionStorage.getItem(LEGACY_OPERADOR_SESSION);
    if (legacy) {
      op = JSON.parse(legacy) as SessaoOperador;
      saveOperadorPersistido(op);
      sessionStorage.removeItem(LEGACY_OPERADOR_SESSION);
      return op;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function saveOperadorPersistido(dados: SessaoOperador) {
  writeStored(SESSAO_OPERADOR_KEY, dados);
}

export function clearOperadorPersistido() {
  localStorage.removeItem(SESSAO_OPERADOR_KEY);
  sessionStorage.removeItem(LEGACY_OPERADOR_SESSION);
}

export function loadAbaPersistida(): AbaPersistida | null {
  return readStored<AbaPersistida>(SESSAO_ABA_KEY);
}

export function saveAbaPersistida(aba: AbaPersistida) {
  writeStored(SESSAO_ABA_KEY, aba);
}

export function clearAbaPersistida() {
  localStorage.removeItem(SESSAO_ABA_KEY);
}

const BILHETE_ATIVO_PREFIX = 'futbet_bilhete_ativo_v1_';

function telKey(telefone: string): string {
  return (telefone || '').replace(/\D/g, '');
}

/** Bilhete exibido no cupom — sobrevive a F5 (por apostador). */
export function loadBilheteAtivo(telefone: string): Bilhete | null {
  const key = telKey(telefone);
  if (!key) return null;
  return readStored<Bilhete>(BILHETE_ATIVO_PREFIX + key);
}

export function saveBilheteAtivo(telefone: string, bilhete: Bilhete | null) {
  const key = telKey(telefone);
  if (!key) return;
  const storageKey = BILHETE_ATIVO_PREFIX + key;
  if (!bilhete) {
    localStorage.removeItem(storageKey);
    return;
  }
  writeStored(storageKey, bilhete);
}

export function clearBilheteAtivo(telefone: string) {
  saveBilheteAtivo(telefone, null);
}
