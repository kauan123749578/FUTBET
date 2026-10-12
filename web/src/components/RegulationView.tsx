import React from 'react';
import { FileCheck, ShieldAlert, Clock, AlertTriangle, Trophy } from 'lucide-react';

export const RegulationView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-[#0E1526] border border-[#1B2742] rounded-2xl p-6 text-white space-y-4 shadow-xl">
        <div className="flex items-center gap-3 border-b border-[#1A253C] pb-4">
          <div className="w-10 h-10 rounded-xl bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center text-yellow-400">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black">Regulamento Oficial da Banca</h2>
            <p className="text-xs text-gray-400">
              Regras gerais, condições de validação e diretrizes para apostadores e cambistas.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
          {/* Regra 1 */}
          <div className="bg-[#121A2E] border border-[#1E2B47] rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-yellow-400 font-black">
              <Clock className="w-4 h-4" />
              <span>1. TEMPO REGULAMENTAR (90 MINUTOS)</span>
            </div>
            <p className="text-gray-300">
              Todas as apostas de futebol são válidas para o tempo regulamentar de jogo (90 minutos + acréscimos determinados pela arbitragem). Prorrogação e cobranças de pênaltis não são contabilizadas, salvo em mercados explicitamente identificados.
            </p>
          </div>

          {/* Regra 2 */}
          <div className="bg-[#121A2E] border border-[#1E2B47] rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-black">
              <ShieldAlert className="w-4 h-4" />
              <span>2. VALIDAÇÃO OBRIGATÓRIA</span>
            </div>
            <p className="text-gray-300">
              O pré-bilhete gerado na plataforma (com código alfanumérico e PIN) <strong className="text-white">NÃO POSSUI VALOR DE PRÊMIO</strong> até que seja validado no terminal do cambista mediante pagamento confirmado via PIX ou dinheiro.
            </p>
          </div>

          {/* Regra 3 */}
          <div className="bg-[#121A2E] border border-[#1E2B47] rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-blue-400 font-black">
              <AlertTriangle className="w-4 h-4" />
              <span>3. JOGOS ADIADOS OU CANCELADOS</span>
            </div>
            <p className="text-gray-300">
              Caso uma partida seja adiada e não realizada dentro de um prazo máximo de 48 horas a partir da data original, a respectiva cotação é anulada (convertida para odd 1.00) e a aposta múltipla continua válida com os jogos restantes.
            </p>
          </div>

          {/* Regra 4 */}
          <div className="bg-[#121A2E] border border-[#1E2B47] rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-purple-400 font-black">
              <Trophy className="w-4 h-4" />
              <span>4. TETO MÁXIMO DE PRÊMIO</span>
            </div>
            <p className="text-gray-300">
              O prêmio máximo por bilhete para este terminal de apostas é fixado em R$ 20.000,00 (Vinte Mil Reais). Mesmo que o cálculo de cotação múltipla resulte em quantia superior, o pagamento obedecerá rigorosamente a este limite de segurança.
            </p>
          </div>
        </div>

        <div className="p-4 bg-[#090E1A] rounded-xl border border-[#1A253C] text-[11px] text-gray-400 text-center">
          Ao gerar um bilhete e enviar para validação, o apostador concorda integralmente com as normas estipuladas neste regulamento.
        </div>
      </div>
    </div>
  );
};
