import React from 'react';
import { motion } from 'framer-motion';

interface ChartBarProps {
  label: string;
  value: number;
  max?: number;
  color?: string;
}

export function SimpleBarChart({ data, label }: { data: any[]; label: string }) {
  const maxValue = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-200">{label}</h3>
      {data.map((item, idx) => (
        <div key={idx} className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">{item.range || item.label}</span>
            <span className="text-slate-300 font-semibold">{item.count}</span>
          </div>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.6, delay: idx * 0.1 }}
            className="h-2 bg-slate-900 rounded-full overflow-hidden"
          >
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              style={{ originX: 0, width: `${(item.count / maxValue) * 100}%` }}
              className="h-full bg-linear-to-r from-[#FF5A1F] to-[#FF7A4A] rounded-full"
            />
          </motion.div>
        </div>
      ))}
    </div>
  );
}

export function SimpleLineChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;

  const values = data.map(d => d.score || d.percentage || 0);
  const maxValue = Math.max(...values, 100);
  const minValue = Math.min(...values, 0);
  const range = maxValue - minValue || 1;

  const points = values.map((v, i) => ({
    x: (i / Math.max(values.length - 1, 1)) * 100,
    y: 100 - ((v - minValue) / range) * 100,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className="h-64 relative">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 90, 31, 0.3)" />
            <stop offset="100%" stopColor="rgba(255, 90, 31, 0)" />
          </linearGradient>
        </defs>
        <path d={pathD} fill="none" stroke="url(#lineGradient)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
        <path d={`${pathD} L 100 100 L 0 100 Z`} fill="url(#lineGradient)" />
        {points.map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="0.8"
            fill="#FF5A1F"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex items-end justify-between px-2 pb-2 text-xs text-slate-400 pointer-events-none">
        {data.map((_, i) => i % Math.ceil(data.length / 4) === 0 && <span key={i}>{i + 1}</span>)}
      </div>
    </div>
  );
}

export function StatCard({
  icon: Icon,
  label,
  value,
  color = 'text-[#FF5A1F]',
  trend,
}: {
  icon?: any;
  label: string;
  value: string | number;
  color?: string;
  trend?: { value: number; direction: 'up' | 'down' };
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-[#FF5A1F]/30 transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{label}</p>
          <p className={`text-2xl md:text-3xl font-black ${color}`}>{value}</p>
          {trend && (
            <div className={`text-xs mt-2 ${trend.direction === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
              {trend.direction === 'up' ? '↑' : '↓'} {trend.value}%
            </div>
          )}
        </div>
        {Icon && <Icon className={`w-8 h-8 ${color} opacity-50`} />}
      </div>
    </motion.div>
  );
}
