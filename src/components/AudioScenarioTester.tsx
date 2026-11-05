import React from 'react';
import { Volume2, PhoneOff, UserCheck, Mic, MicOff, Bot, Sparkles } from 'lucide-react';
import { AudioScenario } from '../utils/audioEngine';

interface AudioScenarioTesterProps {
  currentScenario: AudioScenario;
  isMicActive: boolean;
  onSelectScenario: (scenario: AudioScenario) => void;
  onToggleMic: () => void;
}

export const AudioScenarioTester: React.FC<AudioScenarioTesterProps> = ({
  currentScenario,
  isMicActive,
  onSelectScenario,
  onToggleMic,
}) => {
  return (
    <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Interactive Audio &amp; VAD Signal Generator
            </h3>
            <p className="text-xs text-slate-400">
              Test the millisecond cut-off engine against simulated telecom signals or live mic
            </p>
          </div>
        </div>

        <button
          onClick={onToggleMic}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            isMicActive
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
          }`}
        >
          {isMicActive ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-cyan-400" />}
          <span>{isMicActive ? 'Stop Mic' : 'Test Real Mic'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Scenario 1: IVR Robot Prompt */}
        <button
          onClick={() => onSelectScenario('IVR_VOICE')}
          className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden group ${
            currentScenario === 'IVR_VOICE'
              ? 'bg-amber-500/15 border-amber-500/60 ring-1 ring-amber-500/30'
              : 'bg-slate-950/50 border-slate-800 hover:bg-slate-800/40 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
              <Bot className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
              CUT &lt;35ms
            </span>
          </div>
          <h4 className="text-xs font-bold text-white mb-1 group-hover:text-amber-300 transition-colors">
            IVR Voice / Robot Prompt
          </h4>
          <p className="text-[11px] text-slate-400 leading-tight">
            &quot;The number is busy...&quot; or &quot;আপনার কাঙ্ক্ষিত নম্বরটি...&quot;
          </p>
        </button>

        {/* Scenario 2: Standard Ringback Tone */}
        <button
          onClick={() => onSelectScenario('RINGBACK_TONE')}
          className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden group ${
            currentScenario === 'RINGBACK_TONE'
              ? 'bg-emerald-500/15 border-emerald-500/60 ring-1 ring-emerald-500/30'
              : 'bg-slate-950/50 border-slate-800 hover:bg-slate-800/40 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
              <Volume2 className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
              PRESERVED
            </span>
          </div>
          <h4 className="text-xs font-bold text-white mb-1 group-hover:text-emerald-300 transition-colors">
            Standard Ringing Tone
          </h4>
          <p className="text-[11px] text-slate-400 leading-tight">
            440Hz + 480Hz Cadence. System lets phone ring normally!
          </p>
        </button>

        {/* Scenario 3: Fast Busy / Reorder */}
        <button
          onClick={() => onSelectScenario('BUSY_TONE')}
          className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden group ${
            currentScenario === 'BUSY_TONE'
              ? 'bg-rose-500/15 border-rose-500/60 ring-1 ring-rose-500/30'
              : 'bg-slate-950/50 border-slate-800 hover:bg-slate-800/40 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300">
              <PhoneOff className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
              FAST CUT
            </span>
          </div>
          <h4 className="text-xs font-bold text-white mb-1 group-hover:text-rose-300 transition-colors">
            Operator Busy / Reorder
          </h4>
          <p className="text-[11px] text-slate-400 leading-tight">
            480Hz + 620Hz rapid congestion beep. Disconnects instantly.
          </p>
        </button>

        {/* Scenario 4: Human Recipient Answers */}
        <button
          onClick={() => onSelectScenario('HUMAN_PICKUP')}
          className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden group ${
            currentScenario === 'HUMAN_PICKUP'
              ? 'bg-cyan-500/15 border-cyan-500/60 ring-1 ring-cyan-500/30'
              : 'bg-slate-950/50 border-slate-800 hover:bg-slate-800/40 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
              <UserCheck className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
              SMART STOP
            </span>
          </div>
          <h4 className="text-xs font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">
            Recipient Answers (&quot;Hello?&quot;)
          </h4>
          <p className="text-[11px] text-slate-400 leading-tight">
            Call.STATE_ACTIVE locks. Loop stops so you can talk!
          </p>
        </button>
      </div>
    </div>
  );
};
