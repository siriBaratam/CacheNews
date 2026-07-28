import React from 'react';
import { Zap, Database } from 'lucide-react';

const SpeedBadge = ({ hit, time }) => {
  const isHit = hit === 'HIT' || hit === true;

  if (isHit) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)] pulse-glow">
        <Zap className="w-3.5 h-3.5 fill-emerald-400 stroke-emerald-400" />
        <span>Served from cache in {time}</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
      <Database className="w-3.5 h-3.5" />
      <span>Database query in {time}</span>
    </div>
  );
};

export default SpeedBadge;
