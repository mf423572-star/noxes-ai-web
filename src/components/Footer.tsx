import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-2.5 text-center text-xs font-mono text-slate-500 bg-[#08080d] border-t border-[#14141f]">
      <p className="flex items-center justify-center gap-2 flex-wrap px-4">
        <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#00ffc6] to-[#7c4dff]">
          NOXES AI V4
        </span>
        <span className="text-slate-600">•</span>
        <span className="text-slate-400">By Izz dev</span>
      </p>
    </footer>
  );
};
