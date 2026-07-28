import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AnalyticsChart = ({ data }) => {
  // data matches structure: Array<{ index: number, latency: number, hit: boolean, path: string }>

  return (
    <div className="w-full h-72 bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" />
          <XAxis 
            dataKey="index" 
            stroke="#52525b" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
          />
          <YAxis
            stroke="#52525b"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            unit="ms"
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const dataPoint = payload[0].payload;
                return (
                  <div className="glass p-3 rounded-xl border border-zinc-800 text-[10px] shadow-2xl flex flex-col gap-1">
                    <p className="font-bold text-zinc-100">Request #{dataPoint.index}</p>
                    <p className="text-zinc-500 break-all">
                      URI: <span className="text-zinc-300 font-semibold">{dataPoint.path}</span>
                    </p>
                    <p className="flex items-center gap-1">
                      Type: 
                      <span className={`font-bold ${dataPoint.hit ? 'text-emerald-400 glow-emerald' : 'text-amber-400'}`}>
                        {dataPoint.hit ? 'CACHE HIT' : 'DB MISS'}
                      </span>
                    </p>
                    <p className="text-zinc-500">
                      Latency: <span className="font-bold text-zinc-100">{dataPoint.latency} ms</span>
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey="latency"
            stroke="#10b981"
            strokeWidth={1.5}
            dot={(props) => {
              const { cx, cy, payload } = props;
              const dotColor = payload.hit ? '#10b981' : '#f59e0b';
              const dotKey = `circle-dot-${payload.index}-${payload.path}`;
              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r={2.5}
                  fill={dotColor}
                  stroke="none"
                  key={dotKey}
                />
              );
            }}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AnalyticsChart;
