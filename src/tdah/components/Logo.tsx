import React from 'react';
import { Brain } from 'lucide-react';

export function Logo({ size = "md", iconOnly = false }: { size?: "sm" | "md" | "lg" | "xl", iconOnly?: boolean }) {
  const sizes = {
    sm: { container: "w-8 h-8", icon: 14, text: "text-base", sub: "text-[6px]", gap: "gap-2" },
    md: { container: "w-10 h-10", icon: 18, text: "text-lg", sub: "text-[8px]", gap: "gap-3" },
    lg: { container: "w-16 h-16", icon: 28, text: "text-2xl", sub: "text-[10px]", gap: "gap-4" },
    xl: { container: "w-20 md:w-24 h-20 md:h-24", icon: 36, text: "text-3xl md:text-4xl", sub: "text-[10px] md:text-xs", gap: "gap-4 md:gap-5" }
  };

  const s = sizes[size];

  return (
    <div className={`flex items-center ${s.gap} shrink-0 group cursor-default`}>
      <div className={`${s.container} bg-orange-500 rounded-[32%] flex items-center justify-center text-white shadow-xl shadow-orange-500/20 group-hover:rotate-6 transition-transform duration-500 ease-out relative overflow-hidden shrink-0`}>
        <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent opacity-60" />
        <Brain size={s.icon} className="relative z-10 drop-shadow-md" />
      </div>
      {!iconOnly && (
        <div className="flex flex-col text-left justify-center">
          <h1 className={`${s.text} font-black tracking-tighter text-slate-900 leading-none uppercase transition-all`}>
            2º Cérebro
          </h1>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="h-px w-3 bg-orange-500/30" />
            <span className={`${s.sub} font-black tracking-[0.25em] text-orange-500 uppercase transition-all whitespace-nowrap block`}>
              TDAH Assistant
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
