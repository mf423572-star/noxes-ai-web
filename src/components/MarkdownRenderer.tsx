import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Split into code blocks and normal markdown segments
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 text-[15px] leading-relaxed break-words">
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const match = part.match(/^```([a-zA-Z0-9_-]*)\n([\s\S]*?)```$/);
          const language = match ? match[1] || 'code' : 'code';
          const code = match ? match[2] : part.slice(3, -3);

          return <CodeBlock key={index} code={code.trim()} language={language} />;
        }

        return <FormattedParagraph key={index} text={part} />;
      })}
    </div>
  );
};

const CodeBlock: React.FC<{ code: string; language: string }> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-[#2b2b3d] bg-[#0c0c14] shadow-md">
      <div className="flex items-center justify-between border-b border-[#222233] bg-[#161622] px-4 py-1.5 text-xs text-slate-400">
        <span className="font-mono font-medium text-[#00ffc6] uppercase tracking-wider">{language}</span>
        <button
          onClick={handleCopy}
          type="button"
          className="flex items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors hover:bg-[#252538] hover:text-white"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-[#00ffc6]" />
              <span className="text-[#00ffc6]">Disalin!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Salin kode</span>
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-xs sm:text-sm font-mono text-cyan-50 selection:bg-[#00ffc6]/20">
        <code>{code}</code>
      </pre>
    </div>
  );
};

const FormattedParagraph: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;

  // Split lines
  const lines = text.split('\n');

  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={i} className="h-1.5" />;
        }

        // Headers
        if (line.startsWith('### ')) {
          return (
            <h4 key={i} className="font-bold text-[#00ffc6] text-base mt-2 mb-1">
              {formatInline(line.replace('### ', ''))}
            </h4>
          );
        }
        if (line.startsWith('## ')) {
          return (
            <h3 key={i} className="font-bold text-white text-lg mt-3 mb-1 border-b border-white/10 pb-1">
              {formatInline(line.replace('## ', ''))}
            </h3>
          );
        }
        if (line.startsWith('# ')) {
          return (
            <h2 key={i} className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#00ffc6] to-[#7c4dff] text-xl mt-3 mb-1">
              {formatInline(line.replace('# ', ''))}
            </h2>
          );
        }

        // Bullet lists
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <div key={i} className="flex items-start gap-2 pl-2">
              <span className="text-[#00ffc6] font-bold mt-1 text-xs">•</span>
              <span className="flex-1">{formatInline(line.substring(2))}</span>
            </div>
          );
        }

        // Numbered lists
        const numMatch = line.match(/^(\d+)\.\s(.*)$/);
        if (numMatch) {
          return (
            <div key={i} className="flex items-start gap-2 pl-2">
              <span className="font-semibold text-[#7c4dff] text-sm min-w-4">{numMatch[1]}.</span>
              <span className="flex-1">{formatInline(numMatch[2])}</span>
            </div>
          );
        }

        // Blockquotes
        if (line.startsWith('> ')) {
          return (
            <blockquote key={i} className="border-l-2 border-[#7c4dff] pl-3 py-1 my-1 italic text-slate-300 bg-purple-950/20 rounded-r">
              {formatInline(line.substring(2))}
            </blockquote>
          );
        }

        // Regular line
        return <p key={i}>{formatInline(line)}</p>;
      })}
    </div>
  );
};

// Helper to format inline bold, italics, inline code, and URLs
function formatInline(str: string): React.ReactNode {
  // Split by inline code first
  const codeParts = str.split(/(`[^`]+`)/g);

  return codeParts.map((subPart, subIdx) => {
    if (subPart.startsWith('`') && subPart.endsWith('`') && subPart.length > 2) {
      return (
        <code
          key={subIdx}
          className="rounded bg-[#1a1a28] px-1.5 py-0.5 font-mono text-xs text-[#00ffc6] border border-[#2d2d42]"
        >
          {subPart.slice(1, -1)}
        </code>
      );
    }

    // Process bold (**...**)
    const boldParts = subPart.split(/(\*\*[^*]+\*\*)/g);
    return (
      <React.Fragment key={subIdx}>
        {boldParts.map((bPart, bIdx) => {
          if (bPart.startsWith('**') && bPart.endsWith('**') && bPart.length > 4) {
            return (
              <strong key={bIdx} className="font-semibold text-white">
                {bPart.slice(2, -2)}
              </strong>
            );
          }

          // Process italics (*...*)
          const italParts = bPart.split(/(\*[^*]+\*)/g);
          return italParts.map((itPart, itIdx) => {
            if (itPart.startsWith('*') && itPart.endsWith('*') && itPart.length > 2) {
              return <em key={itIdx} className="italic text-slate-200">{itPart.slice(1, -1)}</em>;
            }
            return itPart;
          });
        })}
      </React.Fragment>
    );
  });
}
