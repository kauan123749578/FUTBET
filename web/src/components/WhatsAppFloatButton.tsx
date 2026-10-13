import React from 'react';
import { MessageCircle } from 'lucide-react';
import { WHATSAPP_SUPORTE_NUM } from '../services/api';

export const WhatsAppFloatButton: React.FC = () => (
  <a
    href={`https://wa.me/${WHATSAPP_SUPORTE_NUM}?text=${encodeURIComponent('Olá! Preciso de suporte FUTBET.')}`}
    target="_blank"
    rel="noreferrer"
    className="fixed z-50 bottom-[4.5rem] right-4 lg:bottom-6 lg:right-6 w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-black/40 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 border-2 border-emerald-400/30"
    title="Suporte WhatsApp (21) 99080-8924"
    aria-label="Suporte WhatsApp"
  >
    <MessageCircle className="w-7 h-7" />
  </a>
);
