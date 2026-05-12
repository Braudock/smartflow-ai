import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Pause, Play, StopCircle } from 'lucide-react';
import { BrainEntry } from '../services/geminiService';

interface FocusModeProps {
  record: BrainEntry;
  onClose: () => void;
  onComplete: () => void;
}

export function FocusMode({ record, onClose, onComplete }: FocusModeProps) {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(() => {});
      
      if (!isBreak) {
        if (confirm("Sessão finalizada! Deseja marcar como concluída?")) {
          onComplete();
        } else {
          setIsBreak(true);
          setTimeLeft(5 * 60);
        }
      } else {
        setIsBreak(false);
        setTimeLeft(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, isBreak, onComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center p-6 text-center"
    >
      <div className="max-w-md w-full space-y-12">
        <div className="space-y-4">
          <div className="flex justify-center">
            <span className="px-4 py-1.5 bg-orange-100 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest">
              {isBreak ? 'Intervalo' : 'Em Foco'}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
            {record.conteudo}
          </h2>
        </div>

        <div className="relative flex flex-col items-center">
          <div className="text-[120px] md:text-[160px] font-black text-slate-900 tracking-tighter tabular-nums leading-none">
            {formatTime(timeLeft)}
          </div>
          <div className="flex gap-4 items-center">
            <button 
              onClick={() => setIsActive(!isActive)}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                isActive ? 'bg-slate-100 text-slate-600' : 'bg-orange-500 text-white shadow-xl shadow-orange-500/30'
              }`}
            >
              {isActive ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
            </button>
            <button 
              onClick={() => {
                setIsActive(false);
                setTimeLeft(25 * 60);
                setIsBreak(false);
              }}
              className="w-16 h-16 rounded-full bg-slate-50 text-slate-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-all"
            >
              <StopCircle size={32} />
            </button>
          </div>
        </div>

        <div className="pt-12">
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2 mx-auto"
          >
            <X size={16} /> Parar Sessão e Voltar
          </button>
        </div>
      </div>
    </motion.div>
  );
}
