"use client";

import dynamic from "next/dynamic";

const TdahApp = dynamic(() => import("@/tdah/App"), {
  loading: () => (
    <main className="min-h-screen bg-[#FDFCFB] flex items-center justify-center p-6">
      <div className="rounded-[2rem] bg-white px-8 py-6 text-sm font-black uppercase tracking-widest text-slate-400 shadow-sm">
        Carregando 2o Cerebro...
      </div>
    </main>
  ),
  ssr: false
});

export default function Home() {
  return <TdahApp />;
}
