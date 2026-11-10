import React, { useState, useRef, useEffect } from 'react';
import { Menu, Plus, Zap, Send, ShieldCheck, MessageSquare, Trash2, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  isAudio?: boolean;
  audioUrl?: string;
  duration?: number;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

const AudioPlayerBubble = ({ audioUrl, duration }: { audioUrl: string; duration: number }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.ontimeupdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    audio.onended = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    return () => {
      audio.pause();
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remSecs = Math.floor(secs % 60);
    return `${mins}:${remSecs < 10 ? '0' : ''}${remSecs}`;
  };

  return (
    <div className="flex items-center gap-3 w-48 sm:w-56 py-1">
      <button
        onClick={togglePlay}
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#00FF88] text-[#0A0A0A] shadow-md transition-transform active:scale-95"
      >
        {isPlaying ? (
          <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
        ) : (
          <svg className="h-5 w-5 fill-current ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        )}
      </button>
      <div className="flex-1 flex flex-col gap-1">
        <div className="flex items-center gap-0.5 h-6">
          {[40, 70, 30, 90, 50, 80, 60, 100, 40, 70, 30, 85, 60, 45, 75, 90, 35].map((height, i) => (
            <div
              key={i}
              className="flex-1 rounded-full transition-all duration-150"
              style={{
                height: `${height}%`,
                backgroundColor: progress > (i / 17) * 100 ? '#00FF88' : '#4A5568',
              }}
            />
          ))}
        </div>
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-300">
          <span>{isPlaying ? formatTime((audioRef.current?.currentTime || 0)) : formatTime(duration)}</span>
          <span className="text-[9px] text-[#00FF88] font-bold">VN • WA STYLE</span>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [playerId] = useState<string>(() => {
    let id = localStorage.getItem('noxes_user_id');
    if (!id) {
      id = 'NOXES-' + Math.random().toString(36).substr(2, 6).toUpperCase();
      localStorage.setItem('noxes_user_id', id);
    }
    return id;
  });

  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('noxes_chat_sessions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [
      {
        id: 'session-' + Date.now(),
        title: 'Obrolan Baru',
        messages: [],
        createdAt: Date.now(),
      },
    ];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string>(() => sessions[0]?.id || '');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);

  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const speechRecognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>('');
  const recordingTimerRef = useRef<any>(null);
  const pressStartTimeRef = useRef<number>(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentSession = sessions.find((s) => s.id === currentSessionId) || sessions[0];

  useEffect(() => {
    localStorage.setItem('noxes_chat_sessions', JSON.stringify(sessions));
  }, [sessions]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages, isLoading]);

  const createNewChat = () => {
    const newSess: ChatSession = {
      id: 'session-' + Date.now(),
      title: 'Obrolan Baru',
      messages: [],
      createdAt: Date.now(),
    };
    setSessions((prev) => [newSess, ...prev]);
    setCurrentSessionId(newSess.id);
    setIsSidebarOpen(false);
  };

  const executeDeleteSession = (id: string) => {
    const updated = sessions.filter((s) => s.id !== id);
    if (updated.length === 0) {
      const fresh: ChatSession = {
        id: 'session-' + Date.now(),
        title: 'Obrolan Baru',
        messages: [],
        createdAt: Date.now(),
      };
      setSessions([fresh]);
      setCurrentSessionId(fresh.id);
    } else {
      setSessions(updated);
      if (currentSessionId === id) {
        setCurrentSessionId(updated[0].id);
      }
    }
  };

  const executeClearAll = () => {
    const fresh: ChatSession = {
      id: 'session-' + Date.now(),
      title: 'Obrolan Baru',
      messages: [],
      createdAt: Date.now(),
    };
    setSessions([fresh]);
    setCurrentSessionId(fresh.id);
  };

  const startRecording = async (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    pressStartTimeRef.current = Date.now();
    transcriptRef.current = '';
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'id-ID';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
          let interim = '';
          let final = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              final += event.results[i][0].transcript;
            } else {
              interim += event.results[i][0].transcript;
            }
          }
          transcriptRef.current = final || interim || transcriptRef.current;
        };

        recognition.start();
        speechRecognitionRef.current = recognition;
      }
    } catch (err) {
      console.error('Mic permission denied:', err);
      alert('Izinkan mic dulu, bree');
    }
  };

  const stopAndSendRecording = async (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!isRecording) return;

    const pressDuration = Date.now() - pressStartTimeRef.current;
    setIsRecording(false);
    clearInterval(recordingTimerRef.current);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {}
    }

    if (pressDuration < 1000) {
      audioChunksRef.current = [];
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 250));

    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    const audioUrl = URL.createObjectURL(audioBlob);
    const duration = recordingTime || 1;

    const spokenText = transcriptRef.current.trim() || 'Halo Noxes';

    const userMsg: Message = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: '',
      timestamp: Date.now(),
      isAudio: true,
      audioUrl,
      duration,
    };

    const updatedMessages = [...currentSession.messages, userMsg];
    const sessionTitle = currentSession.messages.length === 0
      ? (spokenText.length > 25 ? spokenText.substring(0, 25) + '...' : spokenText)
      : currentSession.title;

    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSession.id
          ? { ...s, messages: updatedMessages, title: sessionTitle }
          : s
      )
    );

    sendPromptToNoxes(spokenText, updatedMessages);
  };

  const sendPromptToNoxes = async (textToSend: string, updatedMessages: Message[]) => {
    setIsLoading(true);

    try {
      const formattedMessages = updatedMessages.map((m) => ({
        role: m.role,
        content: m.isAudio ? (m === updatedMessages[updatedMessages.length - 1] ? textToSend : '[Voice Note]') : m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-player-id': playerId,
          'x-player-name': 'CEO Noxes',
        },
        body: JSON.stringify({
          messages: formattedMessages,
          userId: playerId,
          stream: true,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error: ${res.status}`);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';
      let errorText = '';

      if (reader) {
        const modelMsgId = 'msg-' + (Date.now() + 1);
        const initialModelMsg: Message = {
          id: modelMsgId,
          role: 'model',
          content: '',
          timestamp: Date.now(),
        };

        setSessions((prev) =>
          prev.map((s) =>
            s.id === currentSession.id
              ? { ...s, messages: [...s.messages, initialModelMsg] }
              : s
          )
        );

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunkStr = decoder.decode(value, { stream: true });
          const lines = chunkStr.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.chunk) {
                  accumulatedText += data.chunk;
                  setSessions((prev) =>
                    prev.map((s) =>
                      s.id === currentSession.id
                        ? {
                            ...s,
                            messages: s.messages.map((m) =>
                              m.id === modelMsgId ? { ...m, content: accumulatedText } : m
                            ),
                          }
                        : s
                    )
                  );
                }
                if (data.error) {
                  errorText = data.error;
                }
                if (data.done) {
                  break;
                }
              } catch (e) {}
            }
          }
        }

        if (errorText) {
          throw new Error(errorText);
        }
      }
    } catch (err: any) {
      console.error('Noxes AI Error:', err);
      const errorMsg: Message = {
        id: 'msg-' + (Date.now() + 1),
        role: 'model',
        content: err?.message || String(err),
        timestamp: Date.now(),
      };
      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSession.id
            ? { ...s, messages: [...s.messages, errorMsg] }
            : s
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: text.trim(),
      timestamp: Date.now(),
    };

    if (!textToSend) {
      setInput('');
    }

    const updatedMessages = [...currentSession.messages, userMsg];
    const sessionTitle = currentSession.messages.length === 0 
      ? (text.trim().length > 25 ? text.trim().substring(0, 25) + '...' : text.trim())
      : currentSession.title;

    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSession.id
          ? { ...s, messages: updatedMessages, title: sessionTitle }
          : s
      )
    );

    sendPromptToNoxes(text.trim(), updatedMessages);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  const isHeroView = currentSession.messages.length === 0;

  return (
    <div className="flex h-screen w-full flex-col bg-[#0A0A0A] text-white selection:bg-[#00FF88]/30 overflow-hidden relative">
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Kiri */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#0D0D14] border-r border-[#1F1F2E] transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center gap-3 px-4 border-b border-[#1F1F2E] flex-shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#00FF88] to-[#A855F7] p-[1px] shadow-md">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#0A0A0A]">
              <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#00FF88] to-[#A855F7]">
                N
              </span>
            </div>
          </div>
          <span className="font-bold tracking-wide text-white">Noxes Ai by Izz</span>
        </div>

        {/* New Chat Button */}
        <div className="p-4 flex-shrink-0">
          <button
            onClick={createNewChat}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00FF88] to-[#A855F7] px-4 py-3 font-bold text-[#0A0A0A] shadow-lg shadow-emerald-500/10 transition-transform active:scale-95"
          >
            <Plus className="h-5 w-5" />
            <span>Obrolan Baru</span>
          </button>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1.5 min-h-0">
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-2 px-1">
            Riwayat Obrolan
          </div>
          {sessions.map((sess) => (
            <div
              key={sess.id}
              onClick={() => {
                setCurrentSessionId(sess.id);
                setIsSidebarOpen(false);
              }}
              className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm cursor-pointer transition-colors ${
                sess.id === currentSessionId
                  ? 'bg-[#1C1C2E] text-[#00FF88] font-medium border border-[#2D2D44]'
                  : 'text-slate-300 hover:bg-[#141420] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate flex-1 min-w-0 pr-2">
                <MessageSquare className="h-4 w-4 flex-shrink-0 text-slate-400" />
                <span className="truncate">{sess.title}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setDeleteTargetId(sess.id);
                }}
                className="flex items-center justify-center w-10 h-10 p-2 text-red-500 hover:text-white hover:bg-red-600 rounded-xl transition-colors flex-shrink-0 relative z-10 cursor-pointer"
                style={{ pointerEvents: 'auto', touchAction: 'manipulation' }}
                title="Hapus obrolan"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>

        {/* Clear All Chats Button */}
        <div className="px-4 py-3 border-t border-[#1F1F2E] flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setShowClearAllConfirm(true);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-950/70 border border-red-900 px-4 py-3 text-xs sm:text-sm font-bold text-red-400 hover:bg-red-900 hover:text-white transition-all shadow-md active:scale-95 relative z-10 cursor-pointer"
            style={{ pointerEvents: 'auto', touchAction: 'manipulation' }}
          >
            <Trash2 className="h-4 w-4 text-red-400" />
            <span>Hapus Semua Obrolan</span>
          </button>
        </div>

        {/* Sidebar Footer (Dirilis Resmi & ShieldCheck) */}
        <div className="p-4 border-t border-[#1F1F2E] flex flex-col items-center justify-center text-center space-y-2 flex-shrink-0">
          <p className="text-xs font-medium text-[#00FF88]">Dirilis resmi oleh Izz Dev</p>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#141420] border border-[#00FF88]/30">
            <ShieldCheck className="h-6 w-6 text-[#00FF88]" />
          </div>
        </div>
      </aside>

      {/* Header Atas */}
      <header className="flex h-16 items-center justify-between border-b border-[#1F1F2E] bg-[#0A0A0A]/90 px-4 sm:px-6 backdrop-blur-md z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white hover:bg-white/10 transition-colors"
            title="Menu"
          >
            <Menu className="h-6 w-6 stroke-[1.5]" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#00FF88] to-[#A855F7] p-[1.5px] shadow-lg shadow-emerald-500/20">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#0A0A0A]">
                <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#00FF88] to-[#A855F7]">
                  N
                </span>
              </div>
            </div>
            <span className="font-bold text-base tracking-wide text-white">
              Noxes A.i
            </span>
            <div className="hidden sm:flex items-center gap-1 rounded-full bg-[#00FF88]/10 border border-[#00FF88]/30 px-2.5 py-0.5 text-xs font-mono font-bold text-[#00FF88]">
              <Zap className="h-3 w-3 fill-[#00FF88]" />
              <span>UNLIMITED</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={createNewChat}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Obrolan Baru"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-4 py-6 flex flex-col justify-between">
        {isHeroView ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center max-w-2xl mx-auto py-12">
            {/* Logo N besar dengan glow */}
            <div className="relative mb-6">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-[#00FF88]/30 to-[#A855F7]/30 blur-2xl opacity-70 animate-pulse" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#00FF88] to-[#A855F7] p-[2px] shadow-2xl">
                <div className="flex h-full w-full items-center justify-center rounded-[22px] bg-[#0A0A0A]">
                  <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#00FF88] to-[#A855F7]">
                    N
                  </span>
                </div>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
              Halo bree! Gua Noxes A.i
            </h1>
            <p className="text-sm sm:text-base text-slate-400 mb-8 leading-relaxed">
              Dirilis resmi oleh CEO Noxes Ai v4, yaitu Izz Dev bree, AI yang ngerti gaya lu, santuy tapi pinter.
            </p>

            {/* 3 Suggestion Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 w-full">
              {[
                'Bikin caption IG yang kece',
                'Jelasin materi sekolah dengan santuy',
                'Kasih ide konten TikTok viral',
              ].map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(sug)}
                  className="rounded-full border border-[#26263A] bg-[#12121A] px-4 py-2.5 text-xs sm:text-sm text-slate-300 hover:border-[#00FF88]/50 hover:bg-[#1C1C2E] hover:text-white transition-all shadow-md active:scale-95"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl w-full space-y-4 py-4">
            {currentSession.messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} py-1`}
                >
                  {!isUser && (
                    <div className="mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#00FF88] to-[#A855F7] p-[1px]">
                      <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-[#0A0A0A]">
                        <span className="text-xs font-bold text-[#00FF88]">N</span>
                      </div>
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm sm:text-[15px] leading-relaxed shadow-lg ${
                      isUser
                        ? 'rounded-tr-sm bg-gradient-to-r from-[#7C4DFF] to-[#9254DE] text-white'
                        : 'rounded-tl-sm border border-[#26263A] bg-[#12121A] text-slate-100'
                    }`}
                  >
                    {m.isAudio && m.audioUrl ? (
                      <AudioPlayerBubble audioUrl={m.audioUrl} duration={m.duration || 3} />
                    ) : (
                      <p className="whitespace-pre-wrap select-text">{m.content}</p>
                    )}
                    <span
                      className={`mt-1 block text-[10px] font-mono ${
                        isUser ? 'text-purple-200/80 text-right' : 'text-slate-500'
                      }`}
                    >
                      {new Date(m.timestamp).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex w-full justify-start py-1">
                <div className="mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#00FF88] to-[#A855F7] p-[1px]">
                  <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-[#0A0A0A]">
                    <span className="text-xs font-bold text-[#00FF88]">N</span>
                  </div>
                </div>
                <div className="rounded-2xl rounded-tl-sm border border-[#26263A] bg-[#12121A] px-4 py-3 text-slate-400">
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    <span className="h-2 w-2 rounded-full bg-[#00FF88] animate-bounce" />
                    <span className="h-2 w-2 rounded-full bg-[#A855F7] animate-bounce delay-150" />
                    <span className="h-2 w-2 rounded-full bg-[#00FF88] animate-bounce delay-300" />
                    <span className="ml-2">Noxes lagi ngetik nih bree...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input Chat Area */}
        <div className="mx-auto max-w-3xl w-full pt-4 pb-2 relative">
          {/* WhatsApp style recording overlay */}
          {isRecording && (
            <div className="absolute -top-14 left-0 right-0 flex items-center justify-center gap-3 bg-red-950/95 border border-red-800 rounded-full py-2.5 px-6 text-xs text-red-200 shadow-xl animate-pulse z-20">
              <span className="h-3 w-3 rounded-full bg-red-500 animate-ping" />
              <span className="font-mono font-bold text-sm">Merekam suara... 0:0{recordingTime}</span>
              <span className="text-slate-300 italic">(Lepas tombol untuk kirim)</span>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 rounded-full border border-[#26263A] bg-[#12121A] p-2 pl-5 shadow-2xl focus-within:border-[#00FF88]/60 transition-colors"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanya apa aja ke Noxes A.i, santuy bree..."
              disabled={isLoading || isRecording}
              className="flex-1 bg-transparent text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none"
            />

            {/* Mic VN Button (Press and Hold) */}
            <button
              type="button"
              onMouseDown={startRecording}
              onMouseUp={stopAndSendRecording}
              onMouseLeave={stopAndSendRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopAndSendRecording}
              onContextMenu={(e) => e.preventDefault()}
              className={`flex h-11 w-11 items-center justify-center rounded-full transition-all shadow-md select-none touch-none cursor-pointer flex-shrink-0 ${
                isRecording
                  ? 'bg-red-600 text-white scale-110 shadow-red-500/50 animate-pulse'
                  : 'bg-[#222233] text-slate-300 hover:bg-[#2A2A40] hover:text-white'
              }`}
              style={{
                pointerEvents: 'auto',
                touchAction: 'none',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                WebkitTouchCallout: 'none',
              }}
              title="Tekan dan tahan untuk kirim Voice Note"
            >
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>
              </svg>
            </button>

            <button
              type="submit"
              disabled={isLoading || !input.trim() || isRecording}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-[#00FF88] to-[#A855F7] text-[#0A0A0A] font-bold shadow-md transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>

          {/* Footer Sub-text */}
          <div className="mt-3 text-center space-y-0.5 font-mono text-[11px] text-slate-500">
            <p>NOXES AI V4 • By Izz dev</p>
            <p className="text-[10px] text-slate-600">User ID: {playerId}</p>
          </div>
        </div>
      </main>

      {/* Confirmation Modal: Delete Single Chat */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#141420] border border-[#2B2B3D] p-6 text-center shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Hapus obrolan ini?</h3>
            <p className="text-sm text-slate-400 mb-6">Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="flex-1 rounded-xl bg-[#222233] px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-[#2A2A40] transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  executeDeleteSession(deleteTargetId);
                  setDeleteTargetId(null);
                }}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-500 transition-colors shadow-lg shadow-red-600/30"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Clear All Chats */}
      {showClearAllConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#141420] border border-[#2B2B3D] p-6 text-center shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Hapus SEMUA obrolan?</h3>
            <p className="text-sm text-slate-400 mb-6">Semua chat akan hilang dan tidak bisa dikembalikan.</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setShowClearAllConfirm(false)}
                className="flex-1 rounded-xl bg-[#222233] px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-[#2A2A40] transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  executeClearAll();
                  setShowClearAllConfirm(false);
                }}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-500 transition-colors shadow-lg shadow-red-600/30"
              >
                Ya, Hapus Semua
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
