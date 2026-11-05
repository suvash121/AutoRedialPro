import React, { useEffect, useRef } from 'react';
import { Activity, Clock, Zap, ShieldCheck } from 'lucide-react';
import { AudioDspMetrics } from '../utils/audioEngine';

export interface CallLogEntry {
  id: string;
  timestamp: string;
  attempt: number;
  detectedType: string;
  latencyMs: number;
  action: string;
  status: 'SUCCESS' | 'DISCONNECTED' | 'RINGING' | 'CONNECTED';
}

interface VadVisualizerProps {
  metrics: AudioDspMetrics;
  isSampling: boolean;
  callLogs: CallLogEntry[];
  lastCutSpeedMs: number | null;
  sensitivityLevel: number;
}

export const VadVisualizer: React.FC<VadVisualizerProps> = ({
  metrics,
  isSampling,
  callLogs,
  lastCutSpeedMs,
  sensitivityLevel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Render high-framerate oscilloscope & frequency canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Dark background
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, width, height);

      // Grid Lines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < width; x += 40) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += 30) {
        ctx.moveTo(y, 0);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Draw Center Baseline
      ctx.strokeStyle = '#334155';
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Render Time-Domain Waveform
      const timeData = metrics.timeData;
      if (timeData && timeData.length > 0) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = metrics.detectedType === 'VOICE_IVR' 
          ? '#f59e0b' 
          : metrics.detectedType === 'RINGBACK' 
            ? '#10b981' 
            : '#38bdf8';

        ctx.beginPath();
        const sliceWidth = width / timeData.length;
        let x = 0;

        for (let i = 0; i < timeData.length; i++) {
          const v = timeData[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }
        ctx.stroke();
      } else {
        // Flat baseline with slight jitter if active
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#0284c7';
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        for (let x = 0; x < width; x += 10) {
          const jitter = isSampling ? (Math.random() - 0.5) * 4 : 0;
          ctx.lineTo(x, height / 2 + jitter);
        }
        ctx.stroke();
      }

      // Draw Detection Threshold line
      const thresholdY = height * (1 - (sensitivityLevel === 3 ? 0.35 : sensitivityLevel === 2 ? 0.5 : 0.7));
      ctx.strokeStyle = '#ef444488';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, thresholdY);
      ctx.lineTo(width, thresholdY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#ef4444';
      ctx.font = '10px monospace';
      ctx.fillText('VAD TRIGGER THRESHOLD', 10, thresholdY - 4);

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [metrics, isSampling, sensitivityLevel]);

  return (
    <div className="space-y-4">
      {/* Waveform & DSP Card */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                PCM 16-Bit / 16kHz Real-Time Oscilloscope
              </h3>
              <p className="text-xs text-slate-400">
                20ms Low-Latency Circular Buffer &bull; Root Mean Square (RMS) Analysis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className={`px-2.5 py-1 rounded-full border ${
              metrics.detectedType === 'VOICE_IVR'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : metrics.detectedType === 'RINGBACK'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : metrics.detectedType === 'BUSY'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              {metrics.detectedType}
            </span>
          </div>
        </div>

        {/* Live Canvas */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
          <canvas
            ref={canvasRef}
            width={640}
            height={160}
            className="w-full h-40 block"
          />

          {/* Quick Info Badges Overlay */}
          <div className="absolute top-2 right-2 flex items-center gap-2 text-[11px] font-mono">
            <span className="px-2 py-0.5 rounded bg-slate-900/90 border border-slate-800 text-slate-300 backdrop-blur-sm">
              Level: <strong className="text-cyan-400">{metrics.dbValue} dB</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-900/90 border border-slate-800 text-slate-300 backdrop-blur-sm">
              RMS: <strong className="text-blue-400">{(metrics.rmsEnergy * 100).toFixed(0)}%</strong>
            </span>
          </div>
        </div>

        {/* Frequency Band Intelligence Explanation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center justify-between font-bold text-emerald-400 mb-1">
              <span>Standard Ringback</span>
              <ShieldCheck className="w-4 h-4" />
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Dual tones at <strong>440Hz + 480Hz</strong> with strict 2s ON / 4s OFF cadence. Goertzel filter locks and prevents disconnect.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center justify-between font-bold text-amber-400 mb-1">
              <span>IVR Robot / Voice Spike</span>
              <Zap className="w-4 h-4" />
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Broadband acoustic energy across 300Hz-3400Hz. Disconnects within <strong>&lt;35 milliseconds</strong> of first syllable.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center justify-between font-bold text-cyan-400 mb-1">
              <span>Smart Stop On Connect</span>
              <Clock className="w-4 h-4" />
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Telecom <strong>Call.STATE_ACTIVE</strong> fires on human answer. Stops redial loop instantly to let user converse uninterrupted.
            </p>
          </div>
        </div>
      </div>

      {/* Real-time Call Event & Millisecond Latency Log */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Real-Time Telephony &amp; Disconnect Log
              </h3>
              <p className="text-xs text-slate-400">
                Millisecond execution metrics &amp; state transitions
              </p>
            </div>
          </div>

          {lastCutSpeedMs && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs">
              <Zap className="w-3.5 h-3.5 fill-amber-300" />
              <span>Fastest Cut: <strong>{lastCutSpeedMs} ms</strong></span>
            </div>
          )}
        </div>

        {callLogs.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs font-mono">
            No call attempts registered yet. Click &quot;START AUTO-REDIAL&quot; or simulate a scenario below.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="pb-2">ATTEMPT</th>
                  <th className="pb-2">TIME</th>
                  <th className="pb-2">DETECTED SIGNAL</th>
                  <th className="pb-2">SPEED</th>
                  <th className="pb-2">ACTION EXECUTED</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {callLogs.slice(-6).reverse().map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 font-bold text-white">#{log.attempt}</td>
                    <td className="py-2.5 text-slate-400">{log.timestamp}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        log.detectedType.includes('IVR') || log.detectedType.includes('VOICE')
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : log.detectedType.includes('RING')
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : log.detectedType.includes('CONNECTED')
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {log.detectedType}
                      </span>
                    </td>
                    <td className="py-2.5 font-bold text-amber-400">
                      {log.latencyMs > 0 ? `${log.latencyMs} ms` : '--'}
                    </td>
                    <td className="py-2.5 text-slate-300 font-sans text-xs">
                      {log.action}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
