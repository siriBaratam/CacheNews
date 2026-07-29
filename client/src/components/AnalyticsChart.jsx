import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

const AnalyticsChart = ({ data, darkMode }) => {
  const avgLatency = data.length > 0
    ? (data.reduce((acc, d) => acc + d.latency, 0) / data.length).toFixed(2)
    : 0;

  const gridColor   = darkMode ? '#1f1f23' : '#e2e8f0';
  const axisColor   = darkMode ? '#52525b' : '#94a3b8';

  return (
    <div className={`w-full h-72 p-4 rounded-2xl border ${
      darkMode
        ? 'bg-zinc-950/60 border-zinc-800/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.5)]'
        : 'bg-slate-50/80 border-slate-200 shadow-[inset_0_2px_6px_rgba(0,0,0,0.04)]'
    }`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 12, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#10b981" stopOpacity={0.28} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.01} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />

          <XAxis
            dataKey="index"
            stroke={axisColor}
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => (v % Math.ceil(data.length / 6) === 0 ? v : '')}
          />
          <YAxis
            stroke={axisColor}
            fontSize={10}
            tickLine={false}
            axisLine={false}
            unit="ms"
          />

          {avgLatency > 0 && (
            <ReferenceLine
              y={parseFloat(avgLatency)}
              stroke="#6366f1"
              strokeDasharray="5 3"
              strokeWidth={1}
              label={{
                value: `avg ${avgLatency}ms`,
                position: 'insideTopRight',
                fill: '#6366f1',
                fontSize: 9,
                fontWeight: 700
              }}
            />
          )}

          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div className={`p-3 rounded-xl border text-[10px] shadow-2xl flex flex-col gap-1.5 min-w-[160px] ${
                  darkMode
                    ? 'bg-zinc-900/95 border-zinc-700 text-zinc-100'
                    : 'bg-white border-slate-200 text-zinc-800'
                }`}>
                  <p className="font-black text-xs">Request #{d.index}</p>
                  <p className={darkMode ? 'text-zinc-500 break-all' : 'text-slate-400 break-all'}>
                    <span className={darkMode ? 'text-zinc-300' : 'text-zinc-600'}>{d.path}</span>
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${d.hit ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    <span className={`font-bold ${d.hit ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {d.hit ? '⚡ CACHE HIT' : '⏱️ DB MISS'}
                    </span>
                  </div>
                  <p>
                    Latency:{' '}
                    <span className="font-black text-emerald-400">{d.latency.toFixed(3)} ms</span>
                  </p>
                </div>
              );
            }}
          />

          <Area
            type="monotone"
            dataKey="latency"
            stroke="#10b981"
            strokeWidth={1.8}
            fill="url(#latencyGrad)"
            dot={(props) => {
              const { cx, cy, payload } = props;
              return (
                <circle
                  key={`dot-${payload.index}`}
                  cx={cx} cy={cy} r={2.5}
                  fill={payload.hit ? '#10b981' : '#f59e0b'}
                  stroke="none"
                />
              );
            }}
            activeDot={{ r: 5, strokeWidth: 0, fill: '#10b981' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AnalyticsChart;
