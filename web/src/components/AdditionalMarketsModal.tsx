import React from 'react';
import { useBetting } from '../context/BettingContext';
import { X, Layers, Check, Clock } from 'lucide-react';

export const AdditionalMarketsModal: React.FC = () => {
  const { 
    jogoMercadosAberto: jogo, 
    setJogoMercadosAberto, 
    toggleSelecao, 
    isOddSelecionada 
  } = useBetting();

  if (!jogo) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-[#0F1626] border border-[#1E2C48] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="bg-[#001D6E] p-4 text-white flex items-center justify-between border-b border-[#0D2D8F]">
          <div className="flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-yellow-400" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-blue-200 uppercase tracking-widest font-bold">
                  {jogo.campeonatoNome} • {jogo.dataHoraFormatada}
                </span>
                <span className="text-[9px] bg-emerald-950/80 text-emerald-300 border border-emerald-600/50 px-1.5 py-0.5 rounded font-bold">
                  BRT
                </span>
              </div>
              <h3 className="text-base font-black">
                {jogo.mandante} <span className="text-yellow-400">vs</span> {jogo.visitante}
              </h3>
            </div>
          </div>
          <button
            onClick={() => setJogoMercadosAberto(null)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content / Markets List */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {jogo.mercadosAdicionais.map(mercado => (
            <div 
              key={mercado.id} 
              className="bg-[#141E33] border border-[#1F2E4F] rounded-xl p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-gray-200 uppercase tracking-wide">
                  {mercado.nome}
                </h4>
                <span className="text-[10px] text-gray-400 font-mono">
                  {mercado.odds.length} opções
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {mercado.odds.map(odd => {
                  const isSel = isOddSelecionada(jogo.id, odd.rotulo);

                  return (
                    <button
                      key={odd.id}
                      onClick={() =>
                        toggleSelecao({
                          jogoId: jogo.id,
                          jogoDescricao: `${jogo.mandante} x ${jogo.visitante}`,
                          mandante: jogo.mandante,
                          visitante: jogo.visitante,
                          campeonatoNome: jogo.campeonatoNome,
                          dataHoraFormatada: jogo.dataHoraFormatada,
                          mercadoId: mercado.id,
                          mercadoNome: mercado.nome,
                          palpiteRotulo: odd.rotulo,
                          oddValor: odd.valor,
                          statusPalpite: 'pendente'
                        })
                      }
                      className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between ${
                        isSel
                          ? 'bg-[#00E676] text-gray-950 border-emerald-400 shadow-md ring-2 ring-emerald-400'
                          : 'bg-[#18233C] text-gray-200 border-[#233354] hover:bg-[#202E4E] hover:border-blue-400'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
                        <span className="truncate">{odd.rotulo}</span>
                        {isSel && <Check className="w-3.5 h-3.5 text-gray-950 stroke-[3]" />}
                      </div>
                      <span className="text-sm font-mono font-black text-right">
                        {odd.valor.toFixed(2)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="bg-[#0B101C] p-3 border-t border-[#1C2844] flex items-center justify-between">
          <span className="text-xs text-gray-400">
            Clique na cotação para adicionar ou remover do cupom
          </span>
          <button
            onClick={() => setJogoMercadosAberto(null)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
