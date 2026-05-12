import React, { useState, KeyboardEvent } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Target, 
  CloudUpload, 
  X, 
  MapPin, 
  Lightbulb, 
  Calendar, 
  Navigation,
  Map
} from 'lucide-react';
import { BrainEntry, BrainType, BrainPriority, BrainStatus } from '../services/geminiService';

interface RecordItemProps {
  key?: string | number;
  record: BrainEntry;
  onDelete: () => void;
  onUpdate: (updates: Partial<BrainEntry>) => void;
  onFocus?: (record: BrainEntry) => void;
  getTypeColor: (type: BrainType) => string;
  getPriorityData: (p: BrainPriority) => any;
}

export function RecordItem({ record, onDelete, onUpdate, onFocus, getTypeColor, getPriorityData }: RecordItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(record.conteudo);

  const handleBlur = () => {
    setIsEditing(false);
    if (editedValue !== record.conteudo) {
      onUpdate({ conteudo: editedValue });
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleBlur();
    }
    if (e.key === 'Escape') {
      setEditedValue(record.conteudo);
      setIsEditing(false);
    }
  };

  const toggleStatus = () => {
    const newStatus = record.status === BrainStatus.COMPLETED ? BrainStatus.PENDING : BrainStatus.COMPLETED;
    if (newStatus === BrainStatus.COMPLETED) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F97316', '#FB923C', '#FDBA74']
      });
    }
    onUpdate({ status: newStatus });
  };

  const isCompleted = record.status === BrainStatus.COMPLETED;

  const addToCalendar = () => {
    if (!record.dataHoraDetectada) return;
    const startTime = new Date(record.dataHoraDetectada).toISOString().replace(/-|:|\.\d+/g, "");
    const endTimeObj = new Date(new Date(record.dataHoraDetectada).getTime() + 60 * 60 * 1000); 
    const endTime = endTimeObj.toISOString().replace(/-|:|\.\d+/g, "");
    const details = `${record.conteudo}\n\nInsight: ${record.insight || ''}\nLocal: ${record.local || ''}`;
    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(record.tipo + ': ' + record.conteudo.slice(0, 50))}&dates=${startTime}/${endTime}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(record.local || '')}&sf=true&output=xml`;
    window.open(url, '_blank');
  };

  return (
    <motion.div 
      layout 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, scale: 0.9 }} 
      className={`bg-white rounded-[1.75rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm p-4 md:p-8 space-y-4 md:space-y-6 transition-opacity ${isCompleted ? 'opacity-60 grayscale-[0.5]' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <div className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest border uppercase ${getTypeColor(record.tipo)}`}>{record.tipo}</div>
          {!isCompleted && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-black border uppercase ${getPriorityData(record.prioridade).color}`}>
              {(() => { const P = getPriorityData(record.prioridade || BrainPriority.MEDIA); return <><P.icon size={10} />{P.label}</> })()}
            </div>
          )}
          {isCompleted && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-black border uppercase text-emerald-600 bg-emerald-50 border-emerald-100">
              <CheckCircle2 size={10} />FEITO
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-1.5 md:gap-4 shrink-0">
          {!isCompleted && onFocus && (
            <button 
              onClick={() => onFocus(record)}
              className="p-1 px-2 md:px-3 flex items-center gap-1.5 text-orange-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all"
              title="Entrar em Modo Foco"
            >
              <Target size={14} />
              <span className="hidden min-[390px]:inline text-[10px] font-black uppercase tracking-tight">Focar</span>
            </button>
          )}
          {record.hasPendingWrites && (
            <CloudUpload size={14} className="text-orange-400 animate-bounce" />
          )}
          <span className="hidden min-[430px]:inline text-[10px] font-mono font-bold text-slate-300">{record.timestamp}</span>
          <button onClick={onDelete} className="p-1 text-slate-200 hover:text-red-500 transition-all"><X size={16} /></button>
        </div>
      </div>

      <div className="flex gap-3 md:gap-6 items-start">
        <button 
          onClick={toggleStatus}
          className={`shrink-0 mt-1 w-6 h-6 md:w-8 md:h-8 rounded-xl border-2 flex items-center justify-center transition-all ${isCompleted ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-200 text-transparent hover:border-orange-200'}`}
        >
          <CheckCircle2 size={isCompleted ? 16 : 14} />
        </button>

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-4 w-full bg-slate-50/50 p-4 md:p-6 rounded-[2rem] border border-slate-100">
              <textarea
                autoFocus
                value={editedValue}
                onChange={(e) => setEditedValue(e.target.value)}
                className="w-full text-lg md:text-2xl font-bold text-slate-800 leading-tight border-none focus:ring-0 p-0 bg-transparent"
                rows={Math.max(1, editedValue.split('\n').length)}
              />
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm">
                  <MapPin size={16} className="text-orange-400" />
                  <input 
                    type="text"
                    placeholder="Local..."
                    value={record.local || ''}
                    onChange={(e) => onUpdate({ local: e.target.value })}
                    className="bg-transparent border-none focus:ring-0 p-0 text-xs font-bold w-full placeholder:text-slate-300"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-[10px] font-black uppercase text-slate-400 hover:text-slate-600">Cancelar</button>
                  <button onClick={() => { onUpdate({ conteudo: editedValue }); setIsEditing(false); }} className="px-5 py-2 bg-orange-500 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-orange-200">Salvar</button>
                </div>
              </div>
            </div>
          ) : (
            <p onClick={() => setIsEditing(true)} className={`text-[1.05rem] min-[390px]:text-lg md:text-2xl font-bold text-slate-800 leading-snug md:leading-tight cursor-pointer hover:bg-slate-50 transition-all rounded-xl p-2 -m-2 break-words ${isCompleted ? 'line-through text-slate-400' : ''}`}>
              {record.conteudo}
            </p>
          )}
        </div>
      </div>

      {(record.insight || record.dataHoraDetectada || record.local) && (
        <div className="pt-4 md:pt-6 border-t border-slate-50 space-y-4">
          {record.insight && (
            <div className="flex gap-3 text-orange-600 bg-orange-50/50 p-3 md:p-4 rounded-[1.5rem]">
              <Lightbulb size={16} className="shrink-0 mt-0.5" />
              <p className="text-xs md:text-sm font-bold leading-relaxed">{record.insight}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {record.dataHoraDetectada && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase">
                  <Calendar size={12} />
                  {new Date(record.dataHoraDetectada).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </div>
                <button onClick={addToCalendar} className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase transition-all">+ Agenda</button>
              </div>
            )}
            {record.local && (
              <div className="w-full min-w-0 rounded-2xl bg-emerald-50/80 p-2 text-emerald-700">
                <div className="flex items-center gap-2 px-1 pb-2 text-[10px] font-black uppercase">
                  <MapPin size={13} className="shrink-0" />
                  <span className="truncate">{record.local}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={record.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(record.local)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-2 text-[10px] font-black uppercase text-emerald-700 shadow-sm active:scale-95"
                  >
                    <Map size={13} />
                    Maps
                  </a>
                  <a
                    href={record.wazeUrl || `https://waze.com/ul?q=${encodeURIComponent(record.local)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-2 text-[10px] font-black uppercase text-blue-600 shadow-sm active:scale-95"
                  >
                    <Navigation size={13} />
                    Waze
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
