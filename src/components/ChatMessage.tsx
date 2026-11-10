import React, { useState, useRef } from 'react';
import { Check, Copy, RotateCcw, Sparkles, Download, Maximize2, X, Image as ImageIcon } from 'lucide-react';
import { Message } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ChatMessageProps {
  message: Message;
  isLastAI?: boolean;
  onRegenerate?: () => void;
  isLoading?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isLastAI = false,
  onRegenerate,
  isLoading = false,
}) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  const handleDownloadImage = (url: string, filename = 'noxes-ai-photo.png') => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formattedTime = new Date(message.timestamp).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const isSystemFilter = message.content.includes('[⚠️ SYSTEM FILTER');
  if (isSystemFilter) {
    return (
      <div className="flex w-full justify-center px-4 py-4 my-2">
        <div className="max-w-lg w-full rounded-2xl bg-slate-800/90 border border-slate-700/60 p-4 text-center shadow-xl backdrop-blur-md">
          <p className="whitespace-pre-wrap text-xs sm:text-sm font-mono leading-relaxed text-slate-200 select-text text-center">
            {message.content}
          </p>
          <div className="mt-2 text-[10px] text-slate-400 font-mono text-center">
            {formattedTime}
          </div>
        </div>
      </div>
    );
  }

  if (isUser && message.type === 'voice') {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const togglePlay = () => {
      if (!audioRef.current && message.audioUrl) {
        audioRef.current = new Audio(message.audioUrl);
        audioRef.current.onended = () => setIsPlaying(false);
      }
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          audioRef.current.play().catch(() => {});
          setIsPlaying(true);
        }
      }
    };

    return (
      <div className="flex w-full justify-end px-3 py-2 sm:px-4">
        <div className="flex max-w-[88%] sm:max-w-[78%] flex-col items-end">
          <div className="group relative rounded-2xl rounded-tr-sm bg-gradient-to-r from-[#7c4dff] via-[#875bf7] to-[#9254de] px-4 py-3 text-white shadow-lg shadow-purple-950/40 flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlay}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
            >
              {isPlaying ? <span className="text-xs font-bold">⏸</span> : <span className="text-xs font-bold ml-0.5">▶</span>}
            </button>
            <div className="flex items-center gap-1">
              <div className="h-4 w-1 bg-white/80 rounded-full animate-pulse" />
              <div className="h-6 w-1 bg-white rounded-full animate-pulse delay-75" />
              <div className="h-3 w-1 bg-white/60 rounded-full animate-pulse delay-150" />
              <div className="h-5 w-1 bg-white rounded-full animate-pulse delay-100" />
              <div className="h-2 w-1 bg-white/50 rounded-full animate-pulse" />
              <div className="h-4 w-1 bg-white/80 rounded-full animate-pulse delay-200" />
            </div>
            <span className="text-xs font-mono font-bold text-white/90">
              {message.duration || '00:05'}
            </span>
          </div>
          <span className="mt-1 text-[11px] font-mono text-slate-500">
            {formattedTime}
          </span>
        </div>
      </div>
    );
  }

  if (isUser) {
    return (
      <div className="flex w-full justify-end px-3 py-2 sm:px-4">
        <div className="flex max-w-[88%] sm:max-w-[78%] flex-col items-end">
          <div className="group relative rounded-2xl rounded-tr-sm bg-gradient-to-r from-[#7c4dff] via-[#875bf7] to-[#9254de] px-4 py-3 text-white shadow-lg shadow-purple-950/40">
            {/* Attached User Image if present */}
            {message.image?.data && (
              <div className="mb-2.5 overflow-hidden rounded-xl border border-white/20 bg-black/20 shadow-inner">
                <img
                  src={message.image.data}
                  alt="Foto yang diupload"
                  className="max-h-60 w-auto rounded-lg object-contain cursor-pointer hover:opacity-95 transition-opacity"
                  onClick={() => setLightboxUrl(message.image?.data || null)}
                />
              </div>
            )}
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed select-text font-normal">
              {message.content}
            </p>
          </div>
          <span className="mt-1 text-[11px] font-mono text-slate-500">
            {formattedTime}
          </span>
        </div>

        {/* Lightbox Modal */}
        {lightboxUrl && (
          <LightboxModal url={lightboxUrl} onClose={() => setLightboxUrl(null)} />
        )}
      </div>
    );
  }

  return (
    <div className="flex w-full justify-start px-3 py-2 sm:px-4">
      <div className="flex max-w-[94%] sm:max-w-[85%] items-start gap-2.5 sm:gap-3.5">
        {/* N Avatar Badge with Gradient */}
        <div className="relative flex-shrink-0 mt-0.5">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#00ffc6] to-[#7c4dff] p-[1.5px] shadow-md shadow-cyan-900/30">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#0c0c14]">
              <span className="font-extrabold text-xs sm:text-sm tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#00ffc6] to-[#7c4dff]">
                N
              </span>
            </div>
          </div>
          {/* Subtle online cyan dot */}
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#08080d] bg-[#00ffc6]" />
        </div>

        {/* Message bubble card */}
        <div className="flex flex-col items-start min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-xs text-transparent bg-clip-text bg-gradient-to-r from-[#00ffc6] to-[#7c4dff] tracking-wide">
              Noxes A.i
            </span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-[#1e1e2d] text-[#00ffc6]/80 border border-[#2c2c40]">
              By Izz dev
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              {formattedTime}
            </span>
          </div>

          <div className="relative w-full rounded-2xl rounded-tl-sm bg-[#12121a] border border-[#222234] px-4 py-3.5 text-slate-100 shadow-xl shadow-black/50 transition-all hover:border-[#2f2f48]">
            {/* Generated AI Image / Face Edit Result if present */}
            {message.generatedImage?.url && (
              <div className="mb-3.5 overflow-hidden rounded-2xl border border-[#00ffc6]/40 bg-[#08080d] p-1.5 shadow-2xl shadow-cyan-950/40">
                <div className="relative group overflow-hidden rounded-xl">
                  <img
                    src={message.generatedImage.url}
                    alt={message.generatedImage.title || 'Foto Hasil Edit Wajah'}
                    className="w-full max-h-[460px] object-cover cursor-pointer transition-transform duration-300 group-hover:scale-[1.02]"
                    onClick={() => setLightboxUrl(message.generatedImage?.url || null)}
                  />
                  {/* Floating Action Overlay on Hover */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => setLightboxUrl(message.generatedImage?.url || null)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/70 backdrop-blur-md text-white hover:text-[#00ffc6] border border-white/20"
                      title="Layar Penuh"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleDownloadImage(
                          message.generatedImage!.url,
                          `noxes-face-${Date.now()}.png`
                        )
                      }
                      className="flex items-center gap-1.5 rounded-lg bg-[#00ffc6] px-2.5 py-1.5 text-xs font-bold text-[#08080d] hover:bg-[#33ffd0] shadow-md shadow-[#00ffc6]/30"
                      title="Unduh Foto HD"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Unduh</span>
                    </button>
                  </div>

                  {/* Bottom Info Ribbon */}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2.5 flex items-center justify-between text-xs">
                    <span className="font-semibold text-white drop-shadow">
                      {message.generatedImage.title || 'Foto Wajah Asli 100%'}
                    </span>
                    <span className="rounded bg-[#00ffc6]/20 px-2 py-0.5 text-[10px] font-mono font-bold text-[#00ffc6] border border-[#00ffc6]/40">
                      MUKA 100% ORI
                    </span>
                  </div>
                </div>
              </div>
            )}

            <MarkdownRenderer content={message.content} />

            {/* Action Bar at bottom of AI response */}
            <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-[#1e1e2c] pt-2.5">
              <div className="flex items-center gap-1.5">
                {/* Copy Response Button */}
                <button
                  type="button"
                  onClick={handleCopy}
                  title="Salin respon ke clipboard"
                  className={`group flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all duration-200 ${
                    copied
                      ? 'bg-[#00ffc6]/15 text-[#00ffc6] border border-[#00ffc6]/40 shadow-sm shadow-[#00ffc6]/20'
                      : 'bg-[#181826] text-slate-400 hover:text-white hover:bg-[#232338] border border-[#26263a]'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-[#00ffc6] transition-transform scale-110" />
                      <span className="font-semibold text-[#00ffc6]">Tersalin bree!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 group-hover:text-[#00ffc6] transition-colors" />
                      <span>Salin Respon</span>
                    </>
                  )}
                </button>

                {/* Regenerate button for the latest AI message */}
                {isLastAI && onRegenerate && (
                  <button
                    type="button"
                    onClick={onRegenerate}
                    disabled={isLoading}
                    title="Buat ulang respon ini"
                    className="flex items-center gap-1 rounded-lg border border-[#26263a] bg-[#181826] px-2.5 py-1 text-xs text-slate-400 transition-colors hover:bg-[#232338] hover:text-[#7c4dff] disabled:opacity-50"
                  >
                    <RotateCcw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Ulangi</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <Sparkles className="h-3 w-3 text-[#7c4dff]" />
                <span className="hidden sm:inline">NOXES V5</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxUrl && (
        <LightboxModal url={lightboxUrl} onClose={() => setLightboxUrl(null)} />
      )}
    </div>
  );
};

const LightboxModal: React.FC<{ url: string; onClose: () => void }> = ({ url, onClose }) => {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-fade-in cursor-zoom-out"
    >
      <div className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl border border-[#2e2e42] bg-[#0c0c14] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <img src={url} alt="Enlarged view" className="max-h-[85vh] max-w-full object-contain" />
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white hover:bg-rose-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
