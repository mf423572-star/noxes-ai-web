import React from 'react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex w-full justify-start px-3 py-2 sm:px-4 animate-fade-in">
      <div className="flex max-w-[94%] sm:max-w-[85%] items-start gap-2.5 sm:gap-3.5">
        {/* N Avatar */}
        <div className="relative flex-shrink-0 mt-0.5">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#00ffc6] to-[#7c4dff] p-[1.5px] shadow-md shadow-cyan-900/30">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#0c0c14]">
              <span className="font-extrabold text-xs sm:text-sm tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#00ffc6] to-[#7c4dff]">
                N
              </span>
            </div>
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#08080d] bg-[#00ffc6] animate-pulse" />
        </div>

        {/* Bubble */}
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-xs text-transparent bg-clip-text bg-gradient-to-r from-[#00ffc6] to-[#7c4dff] tracking-wide">
              Noxes A.i
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#1e1e2d] text-[#00ffc6]/80 border border-[#2c2c40]">
              Mikir...
            </span>
          </div>

          <div className="flex items-center gap-3 rounded-2xl rounded-tl-sm bg-[#12121a] border border-[#222234] px-4 py-3 text-slate-200 shadow-xl shadow-black/40">
            <span className="text-sm font-medium tracking-wide text-slate-300">
              Noxes A.i lagi ngetik...
            </span>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#00ffc6] animate-bounce [animation-delay:-0.3s]" />
              <span className="h-2 w-2 rounded-full bg-[#38ef7d] animate-bounce [animation-delay:-0.15s]" />
              <span className="h-2 w-2 rounded-full bg-[#7c4dff] animate-bounce" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
