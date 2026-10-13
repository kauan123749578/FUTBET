import React, { useState, useEffect } from 'react';
import { useBetting } from '../context/BettingContext';
import { X, UserPlus, CheckCircle2, AlertTriangle, RefreshCw, LogIn } from 'lucide-react';
import { PasswordInput } from './PasswordInput';

export const ClientAuthModal: React.FC = () => {
  const {
    modalCadastroClienteAberto,
    setModalCadastroClienteAberto,
    clienteAuthModo,
    setClienteAuthModo,
    clienteAuthMensagem,
    loginCliente,
  } = useBetting();

  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [feedback, setFeedback] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (!modalCadastroClienteAberto) {
      setFeedback(null);
      setSenha('');
    }
  }, [modalCadastroClienteAberto]);

  if (!modalCadastroClienteAberto) return null;

  const fechar = () => {
    setModalCadastroClienteAberto(false);
    setFeedback(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setFeedback(null);

    const endpoint = clienteAuthModo === 'cadastro' ? '/api/clientes/cadastro' : '/api/clientes/login';
    const body =
      clienteAuthModo === 'cadastro'
        ? { nome: nome.trim(), telefone: telefone.trim(), senha: senha.trim() }
        : { telefone: telefone.trim(), senha: senha.trim() };

    try {
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await resp.json();

      if (!resp.ok) {
        setFeedback({ tipo: 'erro', texto: data.detail || 'Não foi possível concluir. Tente novamente.' });
        return;
      }

      const cli = data.cliente;
      if (cli?.nome && cli?.telefone) {
        loginCliente({ id: cli.id, nome: cli.nome, telefone: cli.telefone });
      } else if (clienteAuthModo === 'cadastro') {
        loginCliente({ nome: nome.trim(), telefone: telefone.trim() });
      }

      setFeedback({
        tipo: 'sucesso',
        texto: data.message || (clienteAuthModo === 'cadastro' ? 'Conta criada!' : 'Login realizado!'),
      });
      setTimeout(() => {
        fechar();
        setNome('');
        setTelefone('');
        setSenha('');
      }, 1200);
    } catch {
      setFeedback({ tipo: 'erro', texto: 'Erro de conexão. Verifique sua internet.' });
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="client-auth-title"
    >
      <div className="w-full sm:max-w-md bg-[#0d1424] border border-[#1b2742] sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 mb-0 sm:mb-0 pb-[env(safe-area-inset-bottom)]">
        <div className="bg-gradient-to-r from-[#001D6E] to-[#0A38B8] px-5 py-4 text-white shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 id="client-auth-title" className="font-black text-lg truncate">
                Conta FUTBET
              </h2>
              <p className="text-xs text-blue-100/90 mt-0.5">
                {clienteAuthModo === 'cadastro'
                  ? 'Cadastro obrigatório para apostar'
                  : 'Entre com WhatsApp e senha'}
              </p>
            </div>
            <button
              type="button"
              onClick={fechar}
              className="shrink-0 p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {clienteAuthMensagem && (
            <p className="mt-3 text-xs bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-blue-50">
              {clienteAuthMensagem}
            </p>
          )}

          <div className="flex mt-4 bg-black/20 p-1 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => setClienteAuthModo('cadastro')}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
                clienteAuthModo === 'cadastro' ? 'bg-white text-blue-900 shadow' : 'text-white/75 hover:text-white'
              }`}
            >
              Criar conta
            </button>
            <button
              type="button"
              onClick={() => setClienteAuthModo('login')}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
                clienteAuthModo === 'login' ? 'bg-white text-blue-900 shadow' : 'text-white/75 hover:text-white'
              }`}
            >
              Já tenho conta
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {clienteAuthModo === 'cadastro' && (
            <div>
              <label className="block text-gray-400 text-xs font-bold mb-1.5">Nome completo</label>
              <input
                type="text"
                required
                autoComplete="name"
                placeholder="Seu nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full bg-[#070b13] border border-[#1e2b4a] rounded-xl px-3.5 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-gray-400 text-xs font-bold mb-1.5">WhatsApp (com DDD)</label>
            <input
              type="tel"
              required
              autoComplete="tel"
              placeholder="(11) 98765-4321"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className="w-full bg-[#070b13] border border-[#1e2b4a] rounded-xl px-3.5 py-3 text-sm text-white placeholder-gray-500 font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-xs font-bold mb-1.5">Senha</label>
            <PasswordInput
              required
              minLength={4}
              autoComplete={clienteAuthModo === 'cadastro' ? 'new-password' : 'current-password'}
              placeholder="Mínimo 4 caracteres"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="bg-[#070b13] border border-[#1e2b4a] rounded-xl px-3.5 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {feedback && (
            <div
              className={`p-3 rounded-xl text-sm font-medium flex items-start gap-2 ${
                feedback.tipo === 'sucesso'
                  ? 'bg-emerald-950/60 text-emerald-200 border border-emerald-800'
                  : 'bg-red-950/60 text-red-200 border border-red-800'
              }`}
            >
              {feedback.tipo === 'sucesso' ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              )}
              <span>{feedback.texto}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-60 text-[#0a1628] font-black py-3.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
          >
            {carregando ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Aguarde...
              </>
            ) : clienteAuthModo === 'cadastro' ? (
              <>
                <UserPlus className="w-4 h-4" />
                Criar conta e apostar
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Entrar
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
