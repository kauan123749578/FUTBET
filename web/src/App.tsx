import React from 'react';
import { BettingProvider, useBetting } from './context/BettingContext';
import { Navbar } from './components/Navbar';
import { SidebarLeft } from './components/SidebarLeft';
import { HeroBanner } from './components/HeroBanner';
import { MatchTable } from './components/MatchTable';
import { BettingSlip } from './components/BettingSlip';
import { AdditionalMarketsModal } from './components/AdditionalMarketsModal';
import { TicketReceiptModal } from './components/TicketReceiptModal';
import { CheckTicketView } from './components/CheckTicketView';
import { RegulationView } from './components/RegulationView';
import { AdminPainelDesktopView } from './components/AdminPainelDesktopView';
import { CambistaPainelView } from './components/CambistaPainelView';
import { OperadorLoginModal } from './components/OperadorLoginModal';
import { ClientAuthModal } from './components/ClientAuthModal';
import { WhatsAppFloatButton } from './components/WhatsAppFloatButton';

const MainLayout: React.FC = () => {
  const { abaAtiva, setAbaAtiva } = useBetting();

  // Quando o Cambista estiver autenticado e na sua aba dedicada
  if (abaAtiva === 'cambista') {
    return (
      <>
        <CambistaPainelView onVoltarSimulador={() => setAbaAtiva('apostador')} />
        <TicketReceiptModal />
        <OperadorLoginModal />
        <ClientAuthModal />
        <WhatsAppFloatButton />
      </>
    );
  }

  // Quando o Dono (Admin) estiver autenticado e na sua aba de controle geral
  if (abaAtiva === 'admin') {
    return (
      <>
        <AdminPainelDesktopView onVoltarSimulador={() => setAbaAtiva('apostador')} />
        <TicketReceiptModal />
        <OperadorLoginModal />
        <ClientAuthModal />
        <WhatsAppFloatButton />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#070A12] text-gray-100 flex flex-col font-sans">
      {/* Top Header */}
      <Navbar />

      {/* Main 3-Column Desktop Grid Layout */}
      <div className="flex-1 max-w-[1920px] w-full mx-auto flex flex-col lg:flex-row">
        {/* Left Sidebar Menu */}
        <SidebarLeft />

        {/* Center Main Stage */}
        <main className="flex-1 min-w-0 p-3 sm:p-5 overflow-y-auto">
          {abaAtiva === 'apostador' && (
            <>
              <HeroBanner />
              <MatchTable />
            </>
          )}

          {abaAtiva === 'conferir' && <CheckTicketView />}

          {abaAtiva === 'regulamento' && <RegulationView />}
        </main>

        {/* Right Betting Slip Sidebar */}
        <BettingSlip />
      </div>

      {/* Interactive Modals */}
      <AdditionalMarketsModal />
      <TicketReceiptModal />
      <OperadorLoginModal />
      <ClientAuthModal />
      <WhatsAppFloatButton />
    </div>
  );
};

export function App() {
  return (
    <BettingProvider>
      <MainLayout />
    </BettingProvider>
  );
}

export default App;
