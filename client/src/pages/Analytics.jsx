import React, { useState, useEffect } from 'react';
import { RefreshCw, Play, ShieldAlert, Cpu, Database, Zap, Sparkles, Trash2 } from 'lucide-react';
import api from '../api/axios';
import AnalyticsChart from '../components/AnalyticsChart';

const Analytics = ({ requestHistory, onRecordRequest, onClearHistory }) => {
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [simProgress, setSimProgress] = useState(0);

  const fetchStats = async () => {
    try {
      const res = await api.get('/analytics/cache-stats');
      setStats(res.data);
    } catch (error) {
      console.error('Failed to load telemetry stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Poll stats every 3 seconds to keep CPU/Memory/Eviction counters sync'd
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, []);

  const runSimulation = async () => {
    if (simulating) return;
    setSimulating(true);
    setSimProgress(0);

    const totalRequests = 1000;
    const chunkSize = 40; // execute 40 parallel calls in batches
    const routes = [
      '/posts/trending',
      '/posts/rising',
      '/posts/new',
      '/posts/search?q=node',
      '/posts/search?q=react',
      '/posts/search?q=cache'
    ];

    for (let i = 0; i < totalRequests; i += chunkSize) {
      const promises = [];
      const batchSize = Math.min(chunkSize, totalRequests - i);

      for (let j = 0; j < batchSize; j++) {
        const route = routes[Math.floor(Math.random() * routes.length)];
        const fireRequest = async () => {
          const start = performance.now();
          try {
            const res = await api.get(route);
            const hit = res.headers['x-cache'] || 'MISS';
            const latencyStr = res.headers['x-response-time'];
            const latency = latencyStr ? parseFloat(latencyStr.replace('ms', '')) : parseFloat((performance.now() - start).toFixed(3));
            
            onRecordRequest(route, latency, hit === 'HIT');
          } catch (e) {
            console.error('Sim request failed:', e);
          }
        };
        promises.push(fireRequest());
      }

      await Promise.all(promises);
      setSimProgress(prev => prev + batchSize);
      
      // Delay slightly between batches to animate the telemetry chart
      await new Promise(resolve => setTimeout(resolve, 80));
    }

    await fetchStats();
    setSimulating(false);
  };

  // Math aggregates from local logs history
  const hitsLog = requestHistory.filter(r => r.hit);
  const missesLog = requestHistory.filter(r => !r.hit);

  const avgHitLatency = hitsLog.length > 0 
    ? (hitsLog.reduce((acc, curr) => acc + curr.latency, 0) / hitsLog.length).toFixed(3)
    : '0.000';

  const avgMissLatency = missesLog.length > 0 
    ? (missesLog.reduce((acc, curr) => acc + curr.latency, 0) / missesLog.length).toFixed(2)
    : '0.00';

  const mappedChartData = requestHistory.map((item, idx) => ({
    index: idx + 1,
    latency: item.latency,
    hit: item.hit,
    path: item.path
  }));

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 flex flex-col gap-6">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-zinc-800/85 pb-4 flex-wrap gap-4">
        <div>
          <h2 className="text-base font-black tracking-wider text-zinc-100 flex items-center gap-2 uppercase">
            <Sparkles className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
            <span>Cache Analytics & Telemetry</span>
          </h2>
          <p className="text-[10px] text-zinc-500 font-semibold uppercase mt-1">
            Visualizing the difference between Mongoose db lookups and custom O(1) in-memory lookups.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {requestHistory.length > 0 && (
            <button
              onClick={onClearHistory}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-950/20 text-red-400 border border-red-900/30 text-[10px] font-bold uppercase transition-all hover:bg-red-950/40"
              title="Clear Chart Logs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Logs</span>
            </button>
          )}

          <button
            onClick={fetchStats}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800/40 text-zinc-400 border border-zinc-700/20 text-[10px] font-bold uppercase transition-all hover:bg-zinc-800"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* KPI 1: Hit Rate */}
        <div className="glass p-4 rounded-xl border border-zinc-800/80 flex flex-col gap-1 relative overflow-hidden">
          <div className="absolute right-3 top-3">
            <Zap className="w-5 h-5 text-emerald-400 fill-emerald-400/10 opacity-70" />
          </div>
          <span className="text-[10px] text-zinc-500 font-bold uppercase">Hit Ratio</span>
          <span className="text-2xl font-black text-white glow-emerald">
            {stats ? `${stats.hitRatio}%` : '0.00%'}
          </span>
          <span className="text-[9px] text-zinc-400 font-medium">
            {stats ? `Hits: ${stats.hits} | Misses: ${stats.misses}` : 'No connections'}
          </span>
        </div>

        {/* KPI 2: Heap Footprint */}
        <div className="glass p-4 rounded-xl border border-zinc-800/80 flex flex-col gap-1 relative overflow-hidden">
          <div className="absolute right-3 top-3">
            <Cpu className="w-5 h-5 text-emerald-400 opacity-70" />
          </div>
          <span className="text-[10px] text-zinc-500 font-bold uppercase">RAM Footprint</span>
          <span className="text-2xl font-black text-white">
            {stats ? `${stats.heapUsedMB} MB` : '0.00 MB'}
          </span>
          <span className="text-[9px] text-zinc-400 font-medium">
            {stats ? `Total Heap: ${stats.heapTotalMB} MB` : 'Estimating...'}
          </span>
        </div>

        {/* KPI 3: Eviction Count */}
        <div className="glass p-4 rounded-xl border border-zinc-800/80 flex flex-col gap-1 relative overflow-hidden">
          <div className="absolute right-3 top-3">
            <ShieldAlert className="w-5 h-5 text-amber-500 opacity-70" />
          </div>
          <span className="text-[10px] text-zinc-500 font-bold uppercase">Eviction Count</span>
          <span className="text-2xl font-black text-white">
            {stats ? stats.evictions : 0}
          </span>
          <span className="text-[9px] text-zinc-400 font-medium">
            {stats ? `Current Items: ${stats.itemCount}` : 'No capacity logs'}
          </span>
        </div>

        {/* KPI 4: Cache Latency */}
        <div className="glass p-4 rounded-xl border border-zinc-800/80 flex flex-col gap-1 relative overflow-hidden">
          <div className="absolute right-3 top-3">
            <Database className="w-5 h-5 text-amber-500 opacity-70" />
          </div>
          <span className="text-[10px] text-zinc-500 font-bold uppercase">Latencies (Avg)</span>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-emerald-400">
              HIT: {avgHitLatency} ms
            </span>
            <span className="text-xs font-bold text-amber-400">
              MISS: {avgMissLatency} ms
            </span>
          </div>
          <span className="text-[9px] text-zinc-400 font-medium">
            Computed from active logs
          </span>
        </div>
      </div>

      {/* Live Stream Line Graph */}
      <div className="glass p-5 rounded-2xl border border-zinc-800/80 flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex flex-col">
            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wide">Live Response Time Streaming</h3>
            <span className="text-[9px] text-zinc-500 font-semibold uppercase mt-0.5">
              Response time chart. Green dots are <span className="text-emerald-400">Hits</span>, amber dots are <span className="text-amber-400">DB lookups</span>.
            </span>
          </div>

          {/* Simulate 1000 requests */}
          <button
            onClick={runSimulation}
            disabled={simulating}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase transition-all shadow-[0_0_12px_rgba(16,185,129,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {simulating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Simulating... ({simProgress}/1000)</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Simulate 1,000 Requests</span>
              </>
            )}
          </button>
        </div>

        {mappedChartData.length === 0 ? (
          <div className="w-full h-72 rounded-2xl bg-zinc-950/60 border border-zinc-800 flex items-center justify-center text-zinc-600 text-xs font-semibold">
            No active query logs. Browse the app or run simulation.
          </div>
        ) : (
          <AnalyticsChart data={mappedChartData} />
        )}
      </div>
    </div>
  );
};

export default Analytics;
