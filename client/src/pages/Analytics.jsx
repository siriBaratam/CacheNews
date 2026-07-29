import React, { useState, useEffect } from 'react';
import {
  RefreshCw, Play, ShieldAlert, Cpu, Database,
  Zap, Sparkles, Trash2, TrendingUp, Activity
} from 'lucide-react';
import api from '../api/axios';
import AnalyticsChart from '../components/AnalyticsChart';
import { useTheme } from '../context/ThemeContext';

/* ─── Tiny reusable KPI card ─────────────────────────────────── */
const KpiCard = ({ label, value, sub, icon: Icon, iconColor, accentClass, darkMode }) => (
  <div className={`glass p-4 rounded-2xl border flex flex-col gap-2 relative overflow-hidden group transition-all hover:-translate-y-0.5 ${
    darkMode ? 'border-zinc-800/80' : 'border-slate-200'
  }`}>
    {/* Accent top bar */}
    <div className={`absolute top-0 left-0 right-0 h-[2px] ${accentClass}`} />

    <div className="flex items-start justify-between">
      <span className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
        {label}
      </span>
      <div className={`p-1.5 rounded-lg ${darkMode ? 'bg-zinc-800/60' : 'bg-slate-100'}`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
    </div>

    <span className={`text-2xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-zinc-900'}`}>
      {value}
    </span>

    {sub && (
      <span className={`text-[10px] font-medium leading-relaxed ${darkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
        {sub}
      </span>
    )}
  </div>
);

/* ─── Main Analytics Page ─────────────────────────────────────── */
const Analytics = ({ requestHistory, onRecordRequest, onClearHistory }) => {
  const { darkMode } = useTheme();
  const [stats, setStats]               = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [simulating, setSimulating]     = useState(false);
  const [simProgress, setSimProgress]   = useState(0);

  const fetchStats = async () => {
    try {
      const res = await api.get('/analytics/cache-stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load telemetry stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, []);

  const runSimulation = async () => {
    if (simulating) return;
    setSimulating(true);
    setSimProgress(0);

    const totalRequests = 1000;
    const chunkSize     = 40;
    const routes = [
      '/posts/trending', '/posts/rising', '/posts/new',
      '/posts/search?q=node', '/posts/search?q=react', '/posts/search?q=cache'
    ];

    for (let i = 0; i < totalRequests; i += chunkSize) {
      const batchSize = Math.min(chunkSize, totalRequests - i);
      const promises  = Array.from({ length: batchSize }, () => {
        const route = routes[Math.floor(Math.random() * routes.length)];
        return (async () => {
          const start = performance.now();
          try {
            const res     = await api.get(route);
            const hit     = res.headers['x-cache'] || 'MISS';
            const latStr  = res.headers['x-response-time'];
            const latency = latStr
              ? parseFloat(latStr.replace('ms', ''))
              : parseFloat((performance.now() - start).toFixed(3));
            onRecordRequest(route, latency, hit === 'HIT');
          } catch (e) { /* silent */ }
        })();
      });

      await Promise.all(promises);
      setSimProgress(prev => prev + batchSize);
      await new Promise(r => setTimeout(r, 80));
    }

    await fetchStats();
    setSimulating(false);
  };

  /* ── Computed metrics ── */
  const hitsLog    = requestHistory.filter(r => r.hit);
  const missesLog  = requestHistory.filter(r => !r.hit);
  const totalReqs  = requestHistory.length;

  const avgHitLatency = hitsLog.length > 0
    ? (hitsLog.reduce((a, c) => a + c.latency, 0) / hitsLog.length).toFixed(3)
    : '—';

  const avgMissLatency = missesLog.length > 0
    ? (missesLog.reduce((a, c) => a + c.latency, 0) / missesLog.length).toFixed(2)
    : '—';

  const speedup = (avgHitLatency !== '—' && avgMissLatency !== '—')
    ? (parseFloat(avgMissLatency) / parseFloat(avgHitLatency)).toFixed(1)
    : '—';

  const hitPct = totalReqs > 0
    ? Math.round((hitsLog.length / totalReqs) * 100)
    : 0;

  const mappedChartData = requestHistory.map((item, idx) => ({
    index: idx + 1,
    latency: item.latency,
    hit: item.hit,
    path: item.path
  }));

  const border = darkMode ? 'border-zinc-800/80' : 'border-slate-200';
  const subText = darkMode ? 'text-zinc-500' : 'text-slate-400';

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 flex flex-col gap-6">

      {/* ── Header ── */}
      <div className={`flex items-start justify-between border-b ${border} pb-5 flex-wrap gap-4`}>
        <div>
          <h2 className={`text-lg font-black tracking-tight flex items-center gap-2 uppercase ${
            darkMode ? 'text-zinc-100' : 'text-zinc-900'
          }`}>
            <Sparkles className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
            Cache Telemetry
          </h2>
          <p className={`text-[10px] font-semibold uppercase mt-1 max-w-md ${subText}`}>
            Live diagnostics comparing O(1) in-memory cache hits vs Mongoose DB roundtrips.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {requestHistory.length > 0 && (
            <button
              onClick={onClearHistory}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold uppercase transition-all hover:bg-red-500/20"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Logs
            </button>
          )}
          <button
            onClick={fetchStats}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[10px] font-bold uppercase transition-all ${
              darkMode
                ? 'bg-zinc-800/40 text-zinc-400 border-zinc-700/20 hover:bg-zinc-800'
                : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Sync
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          darkMode={darkMode}
          label="Cache Hit Ratio"
          value={stats ? `${stats.hitRatio}%` : '—'}
          sub={stats ? `${stats.hits} hits · ${stats.misses} misses` : 'Polling...'}
          icon={Zap}
          iconColor="text-emerald-400"
          accentClass="bg-gradient-to-r from-emerald-500 to-emerald-400"
        />
        <KpiCard
          darkMode={darkMode}
          label="Heap Used"
          value={stats ? `${stats.heapUsedMB} MB` : '—'}
          sub={stats ? `Total heap: ${stats.heapTotalMB} MB` : 'Estimating...'}
          icon={Cpu}
          iconColor="text-sky-400"
          accentClass="bg-gradient-to-r from-sky-500 to-sky-400"
        />
        <KpiCard
          darkMode={darkMode}
          label="LRU Evictions"
          value={stats ? stats.evictions : 0}
          sub={stats ? `${stats.itemCount} items in cache` : 'No eviction data'}
          icon={ShieldAlert}
          iconColor="text-amber-400"
          accentClass="bg-gradient-to-r from-amber-500 to-amber-400"
        />
        <KpiCard
          darkMode={darkMode}
          label="Avg Latencies"
          value={speedup !== '—' ? `${speedup}×` : '—'}
          sub={`HIT: ${avgHitLatency}ms · MISS: ${avgMissLatency}ms`}
          icon={Database}
          iconColor="text-violet-400"
          accentClass="bg-gradient-to-r from-violet-500 to-violet-400"
        />
      </div>

      {/* ── Request Stats Bar ── */}
      {totalReqs > 0 && (
        <div className={`glass rounded-2xl border ${border} p-4 flex flex-col gap-3`}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>
                Request Breakdown
              </span>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase">
              <span className={darkMode ? 'text-zinc-500' : 'text-slate-400'}>
                Total: <span className={darkMode ? 'text-zinc-200' : 'text-zinc-700'}>{totalReqs.toLocaleString()}</span>
              </span>
              <span className="text-emerald-400">⚡ {hitsLog.length.toLocaleString()} hits</span>
              <span className="text-amber-400">⏱ {missesLog.length.toLocaleString()} misses</span>
            </div>
          </div>

          {/* Hit / Miss visual bar */}
          <div className={`w-full h-2.5 rounded-full overflow-hidden ${darkMode ? 'bg-zinc-800' : 'bg-slate-200'}`}>
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700"
              style={{ width: `${hitPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[9px] font-bold uppercase">
            <span className="text-emerald-400">{hitPct}% cache hits</span>
            <span className="text-amber-400">{100 - hitPct}% db misses</span>
          </div>
        </div>
      )}

      {/* ── Live Chart Panel ── */}
      <div className={`glass rounded-2xl border ${border} p-5 flex flex-col gap-4`}>
        {/* Chart header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className={`text-xs font-bold uppercase tracking-wide ${darkMode ? 'text-zinc-200' : 'text-zinc-700'}`}>
              Live Response Time Stream
            </h3>
            <p className={`text-[9px] font-semibold uppercase mt-0.5 ${subText}`}>
              <span className="text-emerald-400">● Green</span> = Cache Hit &nbsp;·&nbsp;
              <span className="text-amber-400">● Amber</span> = DB Roundtrip &nbsp;·&nbsp;
              <span className="text-violet-400">— Purple</span> = Average
            </p>
          </div>

          <button
            onClick={runSimulation}
            disabled={simulating}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase transition-all shadow-[0_0_16px_rgba(16,185,129,0.25)] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {simulating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>{simProgress} / 1,000</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Simulate 1,000 Requests</span>
              </>
            )}
          </button>
        </div>

        {/* Simulation Progress Bar */}
        {simulating && (
          <div className={`w-full h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-zinc-800' : 'bg-slate-200'}`}>
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-150"
              style={{ width: `${(simProgress / 1000) * 100}%` }}
            />
          </div>
        )}

        {/* Chart or Empty State */}
        {mappedChartData.length === 0 ? (
          <div className={`w-full h-72 rounded-2xl border flex flex-col items-center justify-center gap-3 ${
            darkMode
              ? 'bg-zinc-950/60 border-zinc-800'
              : 'bg-slate-50/80 border-slate-200'
          }`}>
            <TrendingUp className={`w-8 h-8 ${darkMode ? 'text-zinc-700' : 'text-slate-300'}`} />
            <p className={`text-xs font-bold ${darkMode ? 'text-zinc-600' : 'text-slate-400'}`}>
              No logs yet
            </p>
            <p className={`text-[10px] ${darkMode ? 'text-zinc-700' : 'text-slate-300'}`}>
              Browse the feed or click Simulate to begin.
            </p>
          </div>
        ) : (
          <AnalyticsChart data={mappedChartData} darkMode={darkMode} />
        )}
      </div>
    </div>
  );
};

export default Analytics;
