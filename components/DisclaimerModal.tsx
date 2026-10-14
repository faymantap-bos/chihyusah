'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  ExternalLink,
  Check,
  AlertTriangle,
  Users,
  Info,
  Globe2,
} from 'lucide-react';

interface DisclaimerModalProps {
  channelUrl?: string;
}

export default function DisclaimerModal({
  channelUrl = 'https://t.me/noxxytech',
}: DisclaimerModalProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="disclaimer-title"
    >
      <div className="relative w-full max-w-xl max-h-[calc(100vh-1.5rem)] overflow-y-auto bg-white border-4 border-black shadow-[9px_9px_0px_0px_#000] p-4 sm:p-5 space-y-3 font-sans text-black">
        {/* Header Section */}
        <div className="flex items-center gap-3 border-b-2 border-neutral-200 pb-3">
          <div className="w-12 h-12 bg-amber-300 border-3 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000]">
            <ShieldAlert className="w-6 h-6 text-black" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-black uppercase tracking-wider bg-black text-lime-400 px-2 py-0.5 inline-block">
              PEMBERITAHUAN RESMI
            </span>
            <h3
              id="disclaimer-title"
              className="text-xl sm:text-2xl font-black uppercase tracking-tight mt-1 text-black"
            >
              LAYANAN INI 100% GRATIS
            </h3>
          </div>
        </div>

        {/* Critical Warning */}
        <div className="bg-red-600 text-white border-3 border-black p-3 shadow-[3px_3px_0px_0px_#000] font-mono">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 bg-white text-black border-2 border-black flex items-center justify-center shrink-0">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-black uppercase leading-tight">
                JANGAN MEMBAYAR SIAPA PUN
              </h4>
              <p className="mt-1 text-[11px] sm:text-xs font-bold leading-relaxed">
                Dilarang memperjualbelikan, menyewakan, atau memungut biaya atas akses ke layanan ini.
              </p>
            </div>
          </div>
        </div>

        {/* Supporting Notices */}
        <div className="space-y-2 font-mono text-[11px] sm:text-xs leading-relaxed">
          <div className="flex items-start gap-3 border-2 border-black p-2.5 bg-neutral-50">
            <Users className="w-5 h-5 shrink-0 mt-0.5" />
            <p>
              Developer <strong>tidak memiliki reseller, agen, admin berbayar,</strong> atau layanan VIP berbayar.
            </p>
          </div>

          <div className="flex items-start gap-3 border-2 border-black p-2.5 bg-neutral-50">
            <Info className="w-5 h-5 shrink-0 mt-0.5" />
            <p>
              Jika Anda diminta membayar, pihak tersebut <strong>tidak berafiliasi dengan Developer.</strong>
            </p>
          </div>

          <div className="flex items-center gap-3 border-2 border-black p-2.5 bg-amber-300 font-black">
            <Globe2 className="w-5 h-5 shrink-0" />
            <p className="break-all">DOMAIN RESMI: am.noxxyrorr.biz.id</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-1 font-mono">
          <div className="flex flex-col sm:flex-row items-stretch gap-2">
            <a
              href={channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:flex-1 py-2.5 px-4 bg-lime-400 hover:bg-lime-300 text-black border-2 border-black font-black uppercase text-xs shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Laporkan Penjual</span>
            </a>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full sm:flex-1 py-2.5 px-4 bg-black hover:bg-neutral-800 text-white border-2 border-black font-black uppercase text-xs shadow-[3px_3px_0px_0px_#FFE600] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 text-lime-400" />
              <span>Saya Paham, Ini Gratis</span>
            </button>
          </div>
        </div>

        {/* Small Bottom Credit Note */}
        <div className="pt-2 text-center border-t border-neutral-200">
          <span className="font-mono text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">
            POWER BY NOXXYTECH
          </span>
        </div>
      </div>
    </div>
  );
}
