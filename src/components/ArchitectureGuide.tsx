import React from 'react';
import { 
  Cpu, 
  ShieldAlert, 
  Terminal, 
  CheckCircle2, 
  HelpCircle,
  Code2
} from 'lucide-react';

export const ArchitectureGuide: React.FC = () => {
  return (
    <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
        <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
          <Cpu className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide">
            Android Telecom &amp; Millisecond VAD Architecture Guide
          </h2>
          <p className="text-xs text-slate-400">
            Technical blueprint, OS constraints, and production deployment specifications
          </p>
        </div>
      </div>

      {/* Grid of Core Technical Concepts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Concept 1: Telecom Call Termination */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
          <div className="flex items-center gap-2 text-sm font-bold text-blue-400">
            <Terminal className="w-4 h-4" />
            <span>1. Instant Call Disconnect (&lt;10ms)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Starting with Android 9 (API 28) and Android 10+ (API 29–34), Google deprecated unrestricted call termination via reflection. AutoRedial Pro provides a two-tier architecture:
          </p>
          <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
            <li>
              <strong className="text-slate-200">Primary (InCallService):</strong> The app registers an <code className="text-blue-300 font-mono">android.telecom.InCallService</code>. When granted default phone app or companion status, <code className="text-blue-300 font-mono">call.disconnect()</code> terminates the call in &lt;5 milliseconds!
            </li>
            <li>
              <strong className="text-slate-200">Fallback (AccessibilityService):</strong> For users keeping their native Samsung or Xiaomi dialer, our <code className="text-blue-300 font-mono">RedialAccessibilityService</code> automatically identifies and triggers the active dialer&apos;s &quot;End Call&quot; node in ~15ms.
            </li>
          </ul>
        </div>

        {/* Concept 2: Voice Activity Detection (VAD) */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
          <div className="flex items-center gap-2 text-sm font-bold text-cyan-400">
            <Code2 className="w-4 h-4" />
            <span>2. Millisecond DSP Audio Buffer</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            To catch the first syllable (e.g. &quot;আ...&quot;, &quot;The...&quot;) before the robot sentence finishes:
          </p>
          <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
            <li>
              Sample Rate: <strong className="text-slate-200">16,000 Hz Mono (PCM 16-bit)</strong>.
            </li>
            <li>
              Chunk Size: <strong className="text-slate-200">320 samples = 20 milliseconds</strong>.
            </li>
            <li>
              Real-time Root Mean Square (RMS) energy is computed on each 20ms chunk.
            </li>
            <li>
              If 2 consecutive chunks (40ms) exceed the calibrated noise threshold and are not pure ringback tones, <code className="text-cyan-300 font-mono">disconnectCallInstantly()</code> is fired immediately!
            </li>
          </ul>
        </div>

        {/* Concept 3: Ringback Tone Cadence Lock */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>3. Ringing Tone Cadence Filter</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Standard ring tones have strict spectral cadences:
          </p>
          <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
            <li>
              North America: Dual sine waves at <strong className="text-slate-200">440 Hz + 480 Hz</strong> (2s ON / 4s OFF).
            </li>
            <li>
              UK / Europe / Asia: Dual sine waves at <strong className="text-slate-200">400 Hz + 450 Hz</strong>.
            </li>
            <li>
              Our <code className="text-emerald-300 font-mono">AudioToneClassifier</code> uses the Goertzel algorithm to detect these specific frequencies. When locked, the call is marked as <strong className="text-emerald-300">&quot;RINGING&quot;</strong> and protected from being cut.
            </li>
          </ul>
        </div>

        {/* Concept 4: Smart Stop Condition */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
            <ShieldAlert className="w-4 h-4" />
            <span>4. Smart Stop on Human Pickup</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Preventing accidental interruption when the recipient answers:
          </p>
          <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
            <li>
              In Android Telecom, <code className="text-amber-300 font-mono">Call.Callback.onStateChanged</code> fires with <code className="text-amber-300 font-mono">Call.STATE_ACTIVE</code> when offhook transitions to live two-way media.
            </li>
            <li>
              AutoRedial Pro intercepts this event, shuts down the background redial coroutine loop, and unregisters audio recorders so normal phone audio flows seamlessly.
            </li>
          </ul>
        </div>

      </div>

      {/* Production Setup Steps for Android Studio */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/40 to-slate-950/40 border border-blue-900/40">
        <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2 flex items-center gap-2">
          <HelpCircle className="w-4 h-4" />
          How to Build &amp; Run in Android Studio
        </h4>
        <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside leading-relaxed">
          <li>Click <strong className="text-white">&quot;Download Android Studio Project (.ZIP)&quot;</strong> above.</li>
          <li>Extract the ZIP file and open the directory in <strong>Android Studio Ladybug (2024.2+)</strong>.</li>
          <li>Gradle will automatically sync with Kotlin 1.9.23, compileSdk 34, and Material 3 dependencies.</li>
          <li>Connect a physical Android smartphone via USB debugging or start an Android Emulator with telephony image.</li>
          <li>Press <strong className="text-white">Run &apos;app&apos; (Shift + F10)</strong>. When prompted on the phone, grant Phone Call &amp; Audio permissions.</li>
        </ol>
      </div>
    </div>
  );
};
