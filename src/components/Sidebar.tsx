import React from 'react';
import { MessageSquare, Plus, Trash2, X, Zap, ShieldCheck } from 'lucide-react';
import { ChatSession } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  onClearAllSessions: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onClearAllSessions,
}) => {
  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[#1e1e2d] bg-[#0c0c14] transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:hidden'
        }`}
      >
        {/* Top Header */}
        <div className="flex h-16 items-center justify-between border-b border-[#1b1b28] px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#00ffc6] to-[#7c4dff] p-[1.5px]">
              <div className="flex h-full w-full items-center justify-center rounded-[6px] bg-[#0c0c14]">
                <span className="font-extrabold text-xs text-transparent bg-clip-text bg-gradient-to-r from-[#00ffc6] to-[#7c4dff]">
                  N
                </span>
              </div>
            </div>
            <span className="font-bold text-sm tracking-wide text-white">
              Riwayat Obrolan
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#222233] bg-[#14141f] text-slate-400 hover:text-white lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            type="button"
            onClick={() => {
              onNewSession();
              if (window.innerWidth < 1024) onClose();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7c4dff] to-[#9254de] py-2.5 px-4 text-xs font-bold text-white shadow-lg shadow-purple-950/40 transition-transform hover:scale-[1.02] active:scale-95"
          >
            <Plus className="h-4 w-4 text-[#00ffc6]" />
            <span>Mulai Obrolan Baru</span>
          </button>
        </div>

        {/* Session List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="px-2 py-1 text-[11px] font-mono uppercase tracking-wider text-slate-500">
            Daftar Chat ({sessions.length})
          </div>

          {sessions.length === 0 ? (
            <div className="px-3 py-8 text-center text-xs text-slate-500">
              Belum ada riwayat chat bree. Ketik sesuatu di bawah kuy!
            </div>
          ) : (
            sessions.map((session) => {
              const isActive = session.id === activeSessionId;
              return (
                <div
                  key={session.id}
                  onClick={() => {
                    onSelectSession(session.id);
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={`group relative flex items-center justify-between rounded-xl px-3 py-2.5 text-xs cursor-pointer transition-all ${
                    isActive
                      ? 'bg-[#181826] text-[#00ffc6] border border-[#2e2e48] shadow-sm font-medium'
                      : 'text-slate-300 hover:bg-[#141420] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <MessageSquare
                      className={`h-3.5 w-3.5 flex-shrink-0 ${
                        isActive ? 'text-[#00ffc6]' : 'text-[#7c4dff]'
                      }`}
                    />
                    <span className="truncate">
                      {session.title || 'Obrolan Baru'}
                    </span>
                  </div>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={(e) => onDeleteSession(session.id, e)}
                    title="Hapus obrolan ini"
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Info & Clear All */}
        <div className="border-t border-[#1b1b28] p-3 space-y-2">
          {sessions.length > 1 && (
            <button
              type="button"
              onClick={onClearAllSessions}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#2d1b28] bg-[#160f1b] py-2 text-xs text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 transition-colors"
            >
              <Trash2 className="h-3 w-3" />
              <span>Bersihkan Semua Riwayat</span>
            </button>
          )}

          <div className="rounded-xl border border-[#222235] bg-[#12121a] p-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#00ffc6]" />
              <span className="text-xs font-bold text-white">Izz dev</span>
            </div>
            <p className="mt-1 text-[11px] leading-tight text-slate-400">
              Noxes A.i edisi gaul & santuy. Bebas ngobrol, nanya koding, atau curhat bree!
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
