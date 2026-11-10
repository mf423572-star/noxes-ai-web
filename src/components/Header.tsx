import React from 'react';
import { Menu, Plus, Trash2, Zap, Shield, Sparkles } from 'lucide-react';

interface HeaderProps {
  onClearChat: () => void;
  onNewChat: () => void;
  onToggleSidebar: () => void;
  hasMessages: boolean;
  activeSessionTitle?: string;
  onLogoClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onClearChat,
  onNewChat,
  onToggleSidebar,
  hasMessages,
  onLogoClick,
}) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#1b1b29] bg-[#08080d]/90 px-3 backdrop-blur-md sm:px-6">
      {/* Left: Hamburger + Logo + Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle history menu"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#222233] bg-[#12121a] text-slate-300 transition-colors hover:border-[#7c4dff] hover:text-[#00ffc6]"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Logo 'N' with Cyan & Purple Gradient */}
        <div
          onClick={onLogoClick}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
          title="Noxes AI"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#00ffc6] to-[#7c4dff] p-[1.5px] shadow-lg shadow-cyan-950/40 transition-transform group-hover:scale-105">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#0c0c14]">
              <span className="font-extrabold text-base tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#00ffc6] to-[#7c4dff]">
                N
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-lg sm:text-xl tracking-tight text-white flex items-center gap-1.5">
              <span>Noxes</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ffc6] to-[#7c4dff]">
                A.i
              </span>
            </h1>

            {/* UNLIMITED Badge */}
            <div className="relative flex items-center gap-1 overflow-hidden rounded-full border border-[#00ffc6]/40 bg-gradient-to-r from-[#00ffc6]/10 via-[#7c4dff]/15 to-[#00ffc6]/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-[#00ffc6] shadow-sm shadow-[#00ffc6]/20">
              <Zap className="h-3 w-3 fill-[#00ffc6] text-[#00ffc6]" />
              <span className="uppercase">UNLIMITED</span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
            </div>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* New Chat Button */}
        <button
          type="button"
          onClick={onNewChat}
          className="flex items-center gap-1.5 rounded-xl border border-[#26263a] bg-[#12121a] px-3 py-1.5 text-xs font-semibold text-slate-200 transition-all hover:border-[#00ffc6]/60 hover:bg-[#1a1a26] hover:text-[#00ffc6] shadow-sm"
        >
          <Plus className="h-3.5 w-3.5 text-[#00ffc6]" />
          <span className="hidden sm:inline">Obrolan Baru</span>
        </button>

        {/* Clear Chat Button */}
        {hasMessages && (
          <button
            type="button"
            onClick={onClearChat}
            title="Bersihkan chat saat ini"
            className="flex items-center gap-1.5 rounded-xl border border-[#2a1d2d] bg-[#17101e] px-3 py-1.5 text-xs font-medium text-rose-300 transition-all hover:bg-rose-950/40 hover:border-rose-500/60 hover:text-rose-200"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Hapus Chat</span>
          </button>
        )}
      </div>
    </header>
  );
};
