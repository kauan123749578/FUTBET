import React, { useState } from 'react';
import { useBetting } from '../context/BettingContext';
import { Lock, Crown, Briefcase, X, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { ApiService } from '../services/api';
import { PasswordInput } from './PasswordInput';

export const OperadorLoginModal: React.FC = () => {
  const { modalLoginOperadorAberto, setModalLoginOperadorAberto, loginOperador } = useBetting();
  const [tipoOperador, setTipoOperador] = useState<'dono' | 'cambista'>('dono');
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  if (!modalLoginOperadorAberto) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    const user = usuario.trim().toLowerCase();
    const pass = senha.trim();

    if (!user || !pass) {
      setErro('Preencha o usuário e a senha.');
      return;
    }

    setCarregando(true);
    try {
      // Tenta login na API backend
      const res = await ApiService.loginOperador(user, pass);
      if (res && res.sucesso && res.operador) {
        loginOperador({
          id: res.operador.id,
          nome: res.operador.nome,
          usuario: res.operador.usuario,
          role: res.operador.role as 'dono' | 'cambista'
        });
        setUsuario('');
        setSenha('');
        setModalLoginOperadorAberto(false);
        setCarregando(false);
        return;
      }
      if (res && !res.sucesso && res.erro) {
        setCarregando(false);
        setErro(res.erro);
        return;
      }
    } catch {
      setCarregando(false);
      setErro('Não foi possível conectar ao servidor. Tente novamente.');
      return;
    }

    setCarregando(false);
    setErro('Credenciais inválidas. Verifique usuário e senha.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0B132B] border border-[#1C2C54] rounded-2xl max-w-md w-full p-6 text-white shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={() => {
            setModalLoginOperadorAberto(false);
            setErro(null);
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center text-yellow-400 shadow-inner">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-wide">Área Restrita da Banca</h3>
            <p className="text-xs text-gray-400">Acesso seguro para Dono e Cambistas credenciados</p>
          </div>
        </div>

        {/* Seleção de Perfil */}
        <div className="grid grid-cols-2 gap-2 bg-[#060B18] p-1.5 rounded-xl border border-[#162344] mb-5">
          <button
            type="button"
            onClick={() => { setTipoOperador('dono'); setErro(null); }}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
              tipoOperador === 'dono'
                ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-blue-950 shadow-md font-black'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>Dono da Banca</span>
          </button>
          <button
            type="button"
            onClick={() => { setTipoOperador('cambista'); setErro(null); }}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
              tipoOperador === 'cambista'
                ? 'bg-blue-600 text-white shadow-md font-black'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Painel Cambista</span>
          </button>
        </div>

        {erro && (
          <div className="mb-4 bg-red-950/60 border border-red-800/80 rounded-xl p-3 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{erro}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5">
              Usuário / Login
            </label>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder={tipoOperador === 'dono' ? 'admin' : '@kevin'}
              className="w-full bg-[#060B18] border border-[#1B2B50] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5">
              Senha
            </label>
            <PasswordInput
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              className="bg-[#060B18] border border-[#1B2B50] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition-colors"
              required
              autoComplete="current-password"
            />
          </div>

          <div className="bg-[#060B18]/60 p-2.5 rounded-lg border border-[#162344] text-[11px] text-gray-400 text-center leading-snug">
            {tipoOperador === 'dono' ? (
              <>
                Dono: use o usuário e a senha definidos em{' '}
                <span className="text-yellow-300 font-bold">ADMIN_USUARIO</span> e{' '}
                <span className="text-yellow-300 font-bold">ADMIN_SENHA</span> no Railway.
              </>
            ) : (
              <>Cambista: login e senha criados pelo dono no painel admin.</>
            )}
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-blue-950 font-black py-3 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-yellow-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <span>{carregando ? 'Autenticando...' : `Entrar como ${tipoOperador === 'dono' ? 'Dono' : 'Cambista'}`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-[#162344] flex items-center justify-center gap-2 text-gray-500 text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Ambiente Criptografado &bull; FUTBET Enterprise</span>
        </div>
      </div>
    </div>
  );
};
