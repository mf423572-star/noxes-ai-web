import React, { useRef, useEffect, useState } from 'react';
import { Send, Square, Sparkles, ImagePlus, X, Wand2 } from 'lucide-react';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSend: (text: string, image?: { data: string; mimeType: string }) => void;
  isLoading: boolean;
  onStop?: () => void;
  suggestedPrompts?: string[];
  showSuggestions?: boolean;
  playerId?: string;
  playerName?: string;
  onUpdatePlayerName?: (newName: string) => void;
  onSendVoice?: (audioBlob: Blob, transcript: string, duration: string) => void;
}

const PHOTO_EDIT_PROMPTS = [
  'bikin gua lagi nongkrong di cafe estetik',
  'edit gua jadi astronot di luar angkasa',
  'bikin gua lagi santuy di pantai sunset',
  'edit vibes cyberpunk masa depan',
  'bikin gua jadi boss sultan di penthouse mewah',
];

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  onSend,
  isLoading,
  onStop,
  suggestedPrompts = [],
  showSuggestions = false,
  playerId = 'USER_XXXX',
  playerName = 'USER_XXXX',
  onUpdatePlayerName,
  onSendVoice,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<{
    data: string;
    mimeType: string;
    name?: string;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const speechRecognitionRef = useRef<any>(null);

  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Browser lu gak support Speech Recognition, bree! Coba pake Google Chrome.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'id-ID';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInput(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      speechRecognitionRef.current = recognition;
    } catch (err) {
      console.error('SpeechRecognition start failed:', err);
      setIsListening(false);
    }
  };

  const stopSpeechRecognition = () => {
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {}
      speechRecognitionRef.current = null;
    }
    setIsListening(false);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(Math.max(scrollHeight, 44), 180)}px`;
    }
  }, [input]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processImageFile(file);
    // Reset file input value so user can re-select same file if needed
    e.target.value = '';
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Tolong pilih file gambar ya Bos (JPG, PNG, WEBP)!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setSelectedImage({
          data: dataUrl,
          mimeType: file.type || 'image/jpeg',
          name: file.name,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle paste image from clipboard
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          processImageFile(file);
          break;
        }
      }
    }
  };

  const handleSubmit = (e?: React.FormEvent, overrideText?: string) => {
    if (e) e.preventDefault();
    const textToSend = overrideText !== undefined ? overrideText : input;
    if ((!textToSend.trim() && !selectedImage) || isLoading) return;

    const imgPayload = selectedImage
      ? { data: selectedImage.data, mimeType: selectedImage.mimeType }
      : undefined;

    onSend(textToSend.trim() || 'Edit foto muka gua bree', imgPayload);
    setSelectedImage(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) processImageFile(file);
      }}
      className="w-full bg-gradient-to-t from-[#08080d] via-[#08080d]/95 to-transparent pt-2 pb-3 px-3 sm:px-6"
    >
      <div className="mx-auto max-w-4xl">
        {/* Photo Edit Quick Suggestion Chips when Image is Attached */}
        {selectedImage && (
          <div className="mb-2.5 animate-fade-in">
            <div className="flex items-center gap-1.5 mb-1.5 text-[11px] font-semibold text-[#00ffc6]">
              <Wand2 className="h-3.5 w-3.5" />
              <span>Pilih gaya edit foto wajah (Muka 100% Ori):</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PHOTO_EDIT_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSubmit(undefined, prompt)}
                  disabled={isLoading}
                  className="rounded-full border border-[#00ffc6]/40 bg-[#00ffc6]/10 px-3 py-1 text-xs text-[#00ffc6] transition-all hover:bg-[#00ffc6]/20 hover:scale-[1.02] shadow-sm disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Normal Suggested Prompts (when empty chat) */}
        {!selectedImage && showSuggestions && suggestedPrompts.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2 justify-center sm:justify-start">
            {suggestedPrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSend(prompt)}
                disabled={isLoading}
                className="group flex items-center gap-1.5 rounded-full border border-[#222234] bg-[#12121a]/80 px-3.5 py-1.5 text-xs text-slate-300 transition-all hover:border-[#00ffc6]/50 hover:bg-[#1a1a28] hover:text-[#00ffc6] shadow-sm disabled:opacity-50"
              >
                <Sparkles className="h-3 w-3 text-[#7c4dff] group-hover:text-[#00ffc6] transition-colors" />
                <span>{prompt}</span>
              </button>
            ))}
          </div>
        )}

        {/* Input Bar Form */}
        <form
          onSubmit={(e) => handleSubmit(e)}
          className={`relative flex flex-col rounded-2xl border bg-[#12121a] p-2 shadow-2xl shadow-black/60 transition-all ${
            isDragging
              ? 'border-[#00ffc6] ring-2 ring-[#00ffc6]/40 bg-[#161a24]'
              : 'border-[#252538] focus-within:border-[#00ffc6]/60 focus-within:ring-1 focus-within:ring-[#00ffc6]/30'
          }`}
        >
          {/* Image Thumbnail Preview Box if attached */}
          {selectedImage && (
            <div className="mb-2 flex items-center gap-2.5 rounded-xl border border-[#2b2b3f] bg-[#181826] p-2 mx-1">
              <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border border-[#3b3b55]">
                <img
                  src={selectedImage.data}
                  alt="Upload preview"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-xs font-semibold text-white">
                  {selectedImage.name || 'Foto Siap Diedit'}
                </p>
                <p className="text-[11px] text-[#00ffc6]">
                  Muka lu bakal 100% dipertahankan ori, bree!
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-[#252538] hover:text-rose-400"
                title="Hapus foto"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="flex items-end gap-1.5">
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Image Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Upload Foto Wajah / Gambar (Bisa drag & drop / paste)"
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-[#26263a] bg-[#181826] text-slate-300 transition-all hover:border-[#00ffc6]/60 hover:bg-[#222236] hover:text-[#00ffc6]"
            >
              <ImagePlus className="h-4 w-4" />
            </button>

            {/* Textarea or Listening display */}
            {isListening ? (
              <div className="flex-1 flex items-center gap-2 px-3 py-2 text-sm text-rose-400 font-mono">
                <span className="inline-block h-3 w-3 rounded-full bg-rose-600 animate-ping" />
                <span className="animate-pulse">● Mendengarkan suara (Ngomong aja bre)...</span>
              </div>
            ) : (
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                placeholder={
                  selectedImage
                    ? 'Ketik instruksi edit (contoh: "bikin gua lagi di kafe", "edit jadi astronot")...'
                    : 'Tanya apa aja ke Noxes A.i, santuy bree...'
                }
                disabled={isLoading && !onStop}
                className="flex-1 max-h-44 resize-none bg-transparent px-2.5 py-2 text-sm sm:text-[15px] text-white placeholder-slate-500 focus:outline-none selection:bg-[#00ffc6]/30"
              />
            )}

            {/* Right Action: Mic & Send Buttons */}
            <div className="flex items-center gap-1.5 pl-1 pb-0.5">
              {isLoading ? (
                <button
                  type="button"
                  onClick={onStop}
                  title="Hentikan balasan"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#222233] text-slate-300 transition-all hover:bg-rose-900/60 hover:text-rose-200"
                >
                  <Square className="h-4 w-4 fill-current" />
                </button>
              ) : isListening ? (
                <button
                  type="button"
                  onClick={stopSpeechRecognition}
                  title="Berhenti rekam"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white font-bold shadow-lg shadow-rose-600/50 transition-all animate-pulse hover:bg-rose-500 cursor-pointer ring-4 ring-rose-500/30"
                >
                  ⏹
                </button>
              ) : (
                <>
                  {!input.trim() && !selectedImage && (
                    <button
                      type="button"
                      onClick={startSpeechRecognition}
                      title="Mulai Rekam Suara (Speech to Text)"
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00ffc6] text-[#08080d] font-bold shadow-lg shadow-[#00ffc6]/30 transition-all hover:bg-[#33ffd0] hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      🎤
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={!input.trim() && !selectedImage}
                    title="Kirim pesan (Enter)"
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00ffc6] text-[#08080d] font-bold shadow-lg shadow-[#00ffc6]/30 transition-all hover:bg-[#33ffd0] hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 disabled:shadow-none cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </form>

        <div className="mt-2 flex items-center justify-between px-2 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5 font-mono">
            <span>ID: {playerId} ({playerName})</span>
            <button
              type="button"
              onClick={() => {
                const newName = prompt('Ganti Nama Player:', playerName);
                if (newName && newName.trim() && onUpdatePlayerName) {
                  onUpdatePlayerName(newName.trim());
                }
              }}
              className="p-1 hover:text-[#00ffc6] transition-colors cursor-pointer"
              title="Ganti Nama Player"
            >
              ✏️
            </button>
          </span>
          <span className="text-[#00ffc6] font-medium hidden sm:inline">NOXES V5 • Face Editor</span>
        </div>
      </div>
    </div>
  );
};
