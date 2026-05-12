import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell 
} from 'recharts';
import { motion } from 'motion/react';
import { Target, Zap, Clock, CheckCircle2 } from 'lucide-react';

interface StatsData {
  date: string;
  completed: number;
  focusMinutes: number;
}

interface DashboardProps {
  stats: StatsData[];
  streak: number;
}

export function Dashboard({ stats, streak }: DashboardProps) {
  const latest = stats[stats.length - 1] || { completed: 0, focusMinutes: 0 };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Zap className="text-orange-500" size={20} />
            <span className="text-[10px] font-black uppercase text-slate-300 italic">Streak</span>
          </div>
          <div className="text-3xl font-black text-slate-900">{streak}</div>
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Dias seguidos</div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <CheckCircle2 className="text-blue-500" size={20} />
            <span className="text-[10px] font-black uppercase text-slate-300 italic">Feito</span>
          </div>
          <div className="text-3xl font-black text-slate-900">{latest.completed}</div>
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Hoje</div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Clock className="text-purple-500" size={20} />
            <span className="text-[10px] font-black uppercase text-slate-300 italic">Foco</span>
          </div>
          <div className="text-3xl font-black text-slate-900">{latest.focusMinutes}m</div>
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Minutos hoje</div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Target className="text-emerald-500" size={20} />
            <span className="text-[10px] font-black uppercase text-slate-300 italic">Meta</span>
          </div>
          <div className="text-3xl font-black text-slate-900">{Math.round((latest.completed / 5) * 100)}%</div>
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Do objetivo diário</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Progresso Semanal</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 900, fill: '#cbd5e1' }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 900 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="#F97316" 
                  strokeWidth={4} 
                  dot={{ r: 4, fill: '#F97316', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Minutos de Foco</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 900, fill: '#cbd5e1' }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 900 }}
                />
                <Bar dataKey="focusMinutes" radius={[10, 10, 10, 10]}>
                  {stats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === stats.length - 1 ? '#F97316' : '#cbd5e1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
