import React, { useState, useEffect } from 'react';
import { Shield, Lock, Search, Trash2, ArrowLeft, RefreshCw, Terminal, CheckCircle2 } from 'lucide-react';

interface ChatLog {
  id: string;
  waktu: string;
  pesan_user?: string;
  jawaban_ai?: string;
  user_id?: string;
  playerId?: string;
  playerName?: string;
  user?: string;
  ai?: string;
  message?: string;
  text?: string;
  prompt?: string;
  content?: string;
  userInput?: string;
  ai_msg?: string;
  response?: string;
  answer?: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [logs, setLogs] = useState<ChatLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'NOXESCEOGANTENG123') {
      setIsAuthenticated(true);
      setLoginError('');
      fetchLogs('NOXESCEOGANTENG123');
    } else {
      setLoginError('HARAM MASUK BRE 🗿🤣');
    }
  };

  const fetchLogs = async (pwd: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/logs', {
        headers: {
          'x-admin-password': pwd,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      } else {
        setLoginError('HARAM MASUK BRE 🗿🤣');
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLog = async (id: string) => {
    if (!confirm('Hapus log chat ini bre?')) return;
    try {
      const res = await fetch(`/api/admin/logs/${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-password': 'NOXESCEOGANTENG123',
        },
      });
      if (res.ok) {
        setLogs((prev) => prev.filter((l) => l.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete log:', err);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Hapus SEMUA log chat bre? Gak bisa dibalikin lho!')) return;
    try {
      const res = await fetch('/api/admin/logs', {
        method: 'DELETE',
        headers: {
          'x-admin-password': 'NOXESCEOGANTENG123',
        },
      });
      if (res.ok) {
        setLogs([]);
      }
    } catch (err) {
      console.error('Failed to clear logs:', err);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const uText = log.pesan_user || log.user || log.message || log.text || log.prompt || log.content || log.userInput || '';
    const aText = log.jawaban_ai || log.ai || log.ai_msg || log.response || log.answer || '';
    const uId = log.user_id || log.playerId || '';
    const q = searchQuery.toLowerCase();
    return uText.toLowerCase().includes(q) || aText.toLowerCase().includes(q) || uId.toLowerCase().includes(q);
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#08080d] text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-[#222238] bg-[#12121a] p-8 shadow-2xl shadow-purple-950/40 text-center relative overflow-hidden">
          <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-[#00ffc6]/10 blur-2xl" />
          <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-[#7c4dff]/15 blur-2xl" />

          <div className="relative z-10">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00ffc6] to-[#7c4dff] p-0.5 shadow-lg shadow-cyan-950/40">
              <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#0c0c14]">
                <Lock className="h-7 w-7 text-[#00ffc6]" />
              </div>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight mb-1 text-transparent bg-clip-text bg-gradient-to-r from-[#00ffc6] to-[#7c4dff]">
              ADMIN ROOM V4
            </h1>
            <p className="text-xs text-slate-400 mb-6 font-mono">
              Noxes AI Security Gateway
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Masukkan Password Admin..."
                  className="w-full rounded-xl border border-[#2a2a3f] bg-[#1a1a28] px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-[#00ffc6] focus:outline-none focus:ring-1 focus:ring-[#00ffc6]/40 transition-all text-center font-mono"
                  autoFocus
                />
              </div>

              {loginError && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-3 text-center text-sm font-bold text-rose-300 animate-shake">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-[#00ffc6] to-[#7c4dff] py-3 text-sm font-extrabold text-[#08080d] shadow-lg shadow-[#00ffc6]/20 transition-all hover:opacity-95 active:scale-95"
              >
                BUKA PINTU BRE 🚪
              </button>
            </form>

            <div className="mt-6">
              <a
                href="/"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#00ffc6] transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Kembali ke Chat Utama</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08080d] text-slate-100 flex flex-col">
      {/* Admin Header */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#1b1b29] bg-[#08080d]/90 px-4 sm:px-8 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#00ffc6] to-[#7c4dff] p-0.5 shadow-lg shadow-cyan-950/40">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#0c0c14]">
              <Terminal className="h-5 w-5 text-[#00ffc6]" />
            </div>
          </div>
          <div>
            <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-white flex items-center gap-2">
              <span>NOXES AI ADMIN LOGS</span>
              <span className="rounded-full bg-[#00ffc6]/20 px-2 py-0.5 text-[10px] font-mono font-bold text-[#00ffc6] border border-[#00ffc6]/40">
                SECURE
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-mono">
              Total Log Tercatat: {logs.length} percakapan
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => fetchLogs('NOXESCEOGANTENG123')}
            className="flex items-center gap-1.5 rounded-xl border border-[#26263a] bg-[#12121a] px-3 py-2 text-xs font-semibold text-slate-200 transition-all hover:border-[#00ffc6]/60 hover:bg-[#1a1a26] hover:text-[#00ffc6]"
            title="Refresh logs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {logs.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-950/20 px-3 py-2 text-xs font-semibold text-rose-300 transition-all hover:bg-rose-900/40 hover:text-rose-200"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Clear All Logs</span>
            </button>
          )}

          <a
            href="/"
            className="flex items-center gap-1.5 rounded-xl border border-[#26263a] bg-[#181826] px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Keluar</span>
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-6">
        {/* Search & Stats Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-[#222235] bg-[#12121a] p-4 shadow-xl">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari pesan user, jawaban AI, atau user ID..."
              className="w-full rounded-xl border border-[#2a2a3f] bg-[#1a1a28] pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-[#00ffc6] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <CheckCircle2 className="h-4 w-4 text-[#00ffc6]" />
            <span>Database Memory Aktif & Aman</span>
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-hidden rounded-2xl border border-[#222235] bg-[#12121a] shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#222235] bg-[#161622] text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  <th className="p-4">Waktu</th>
                  <th className="p-4">User ID</th>
                  <th className="p-4">Pesan User</th>
                  <th className="p-4">Jawaban AI</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e2c] text-xs sm:text-sm">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500 italic">
                      {logs.length === 0 ? 'Belum ada log chat yang terekam bre.' : 'Tidak ditemukan log yang sesuai pencarian.'}
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => {
                    const userText = log.pesan_user || log.user || log.message || log.text || log.prompt || log.content || log.userInput || 'Pesan kosong';
                    const aiText = log.jawaban_ai || log.ai || log.ai_msg || log.response || log.answer || 'Balasan kosong';

                    return (
                      <tr key={log.id} className="transition-colors hover:bg-[#161622]/60">
                        <td className="p-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                          {log.waktu}
                        </td>
                        <td className="p-4 font-mono text-[11px] text-[#00ffc6] whitespace-nowrap">
                          {log.user_id || log.playerId || 'USER'}
                        </td>
                        <td className="p-4 max-w-xs sm:max-w-sm truncate text-slate-200">
                          {userText}
                        </td>
                        <td className="p-4 max-w-sm sm:max-w-md truncate text-slate-300">
                          {aiText}
                        </td>
                        <td className="p-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleDeleteLog(log.id)}
                            className="rounded-lg border border-rose-500/30 bg-rose-950/20 p-2 text-rose-300 hover:bg-rose-900/40 hover:text-rose-200 transition-colors"
                            title="Hapus log ini"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
