import { useState, useEffect, useRef } from 'react';
import { 
  AndroidEmulator, 
  EmulatorCallState,
  SavedHotline
} from './components/AndroidEmulator';
import { 
  VadVisualizer, 
  CallLogEntry 
} from './components/VadVisualizer';
import { 
  AudioScenarioTester 
} from './components/AudioScenarioTester';
import { 
  CodeViewer 
} from './components/CodeViewer';
import { 
  ArchitectureGuide 
} from './components/ArchitectureGuide';
import { 
  telecomAudioEngine, 
  AudioScenario, 
  AudioDspMetrics 
} from './utils/audioEngine';
import { downloadAndroidProjectZip } from './utils/projectExporter';
import { ApkDownloadModal } from './components/ApkDownloadModal';
import { 
  Smartphone, 
  Code2, 
  BookOpen, 
  Download, 
  Zap
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'code' | 'architecture'>('simulator');
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);
  
  // Emulator and Telephony State
  const [callState, setCallState] = useState<EmulatorCallState>('IDLE');
  const [stateDetail, setStateDetail] = useState<string>('Ready to start millisecond VAD auto-redial');
  const [attemptCount, setAttemptCount] = useState<number>(0);
  const [lastCutSpeedMs, setLastCutSpeedMs] = useState<number | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>('+1 (555) 019-2834');
  const [redialDelayMs, setRedialDelayMs] = useState<number>(50); // 0 to 2000 ms
  const [sensitivityLevel, setSensitivityLevel] = useState<number>(3); // 1 = Low, 2 = Medium, 3 = Ultra
  
  // New Feature States
  const [autoSpeaker, setAutoSpeaker] = useState<boolean>(true);
  const [muteRedials, setMuteRedials] = useState<boolean>(true);
  const [savedHotlines, setSavedHotlines] = useState<SavedHotline[]>([
    { id: '1', name: 'Dr. Clinic', number: '+1 (555) 019-2834', category: 'doctor' },
    { id: '2', name: 'Hospital Desk', number: '+880 1711 000000', category: 'hospital' },
    { id: '3', name: 'Emergency 911', number: '911', category: 'emergency' },
  ]);

  // Audio & Scenario Testing State
  const [activeScenario, setActiveScenario] = useState<AudioScenario>('SILENCE');
  const [isMicActive, setIsMicActive] = useState<boolean>(false);
  const [callLogs, setCallLogs] = useState<CallLogEntry[]>([]);
  
  // Real-time Audio Metrics
  const [metrics, setMetrics] = useState<AudioDspMetrics>({
    rmsEnergy: 0,
    dbValue: -90,
    detectedType: 'SILENCE',
    frequencyData: new Uint8Array(0),
    timeData: new Uint8Array(0),
  });

  const redialLoopRef = useRef<boolean>(false);
  const dialTimestampRef = useRef<number>(0);

  // Audio metrics polling loop (60 FPS)
  useEffect(() => {
    let animId: number;

    const poll = () => {
      const current = telecomAudioEngine.getMetrics();
      setMetrics(current);

      // Check if we are actively dialing and audio VAD triggers
      if (redialLoopRef.current) {
        // Condition 1: Voice / IVR detected!
        if (current.detectedType === 'VOICE_IVR' && current.rmsEnergy > (sensitivityLevel === 3 ? 0.08 : 0.20)) {
          const cutLatency = Math.max(18, Math.round(performance.now() - dialTimestampRef.current));
          setLastCutSpeedMs(cutLatency);
          triggerDisconnectAndRedial(
            'VOICE / BUSY DETECTED!',
            `IVR robot / voice detected. Instant cut in ${cutLatency}ms! Redialing...`,
            'IVR_VOICE',
            cutLatency
          );
        }
        // Condition 2: Operator Busy tone detected!
        else if (current.detectedType === 'BUSY' && current.rmsEnergy > 0.12) {
          const cutLatency = Math.max(22, Math.round(performance.now() - dialTimestampRef.current));
          setLastCutSpeedMs(cutLatency);
          triggerDisconnectAndRedial(
            'VOICE / BUSY DETECTED!',
            `Busy / congestion tone detected. Disconnected in ${cutLatency}ms!`,
            'BUSY_TONE',
            cutLatency
          );
        }
        // Condition 3: Standard Ringback tone detected! (Cadence lock)
        else if (current.detectedType === 'RINGBACK') {
          setCallState('RINGING...');
          setStateDetail(
            autoSpeaker 
              ? 'Ringing verified (Speaker ON - Handsfree Active). Keeping call alive!'
              : 'Ringing cadence locked (440Hz/480Hz). Keeping call active!'
          );
        }
      }

      animId = requestAnimationFrame(poll);
    };

    animId = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(animId);
  }, [sensitivityLevel, redialDelayMs, autoSpeaker]);

  // Handle Disconnect & Immediate Redial Loop
  const triggerDisconnectAndRedial = (
    newState: EmulatorCallState,
    detail: string,
    detectedSignal: string,
    latency: number
  ) => {
    if (!redialLoopRef.current) return;

    setCallState(newState);
    setStateDetail(detail);

    // Stop current audio burst immediately (simulating instant call.disconnect())
    telecomAudioEngine.stopAllAudio();
    setActiveScenario('SILENCE');

    // Add entry to call logs
    setCallLogs(prev => [
      ...prev,
      {
        id: Math.random().toString(),
        timestamp: new Date().toLocaleTimeString(),
        attempt: attemptCount,
        detectedType: detectedSignal,
        latencyMs: latency,
        action: `Instant InCallService disconnect (<${latency}ms) & redial`,
        status: 'DISCONNECTED',
      }
    ]);

    // Wait configured redial delay (0 - 2000ms) then dial again
    setTimeout(() => {
      if (!redialLoopRef.current) return;
      executeNextDialAttempt();
    }, redialDelayMs);
  };

  const executeNextDialAttempt = () => {
    if (!redialLoopRef.current) return;

    setAttemptCount(prev => {
      const nextAttempt = prev + 1;
      setCallState('DIALING...');
      setStateDetail(`Placing attempt #${nextAttempt} to ${phoneNumber}...`);
      dialTimestampRef.current = performance.now();

      // Transition to DETECTING AUDIO after brief connection phase
      setTimeout(() => {
        if (!redialLoopRef.current) return;
        setCallState('DETECTING AUDIO...');
        setStateDetail(
          muteRedials 
            ? 'Monitoring audio stream (Redial Mute ON - Ear clicks silenced)...' 
            : 'Monitoring audio stream with 20ms VAD buffers...'
        );
      }, 350);

      return nextAttempt;
    });
  };

  const handleStartRedial = () => {
    if (!phoneNumber.trim()) {
      alert("Please enter a valid phone number");
      return;
    }
    redialLoopRef.current = true;
    setAttemptCount(0);
    setLastCutSpeedMs(null);
    executeNextDialAttempt();
  };

  const handleStopRedial = (reason: string = 'User manually pressed Stop') => {
    redialLoopRef.current = false;
    telecomAudioEngine.stopAllAudio();
    setActiveScenario('SILENCE');
    setIsMicActive(false);
    setCallState('STOPPED');
    setStateDetail(reason);

    setCallLogs(prev => [
      ...prev,
      {
        id: Math.random().toString(),
        timestamp: new Date().toLocaleTimeString(),
        attempt: attemptCount,
        detectedType: 'MANUAL_STOP',
        latencyMs: 0,
        action: 'Redial loop stopped and reset',
        status: 'SUCCESS',
      }
    ]);
  };

  // Scenario Simulator
  const handleSelectScenario = (scenario: AudioScenario) => {
    setActiveScenario(scenario);

    if (scenario === 'IVR_VOICE') {
      telecomAudioEngine.playIvrVoice("The number you have dialed is currently busy, please try again later.");
    } else if (scenario === 'RINGBACK_TONE') {
      telecomAudioEngine.playRingbackTone();
      if (redialLoopRef.current) {
        setCallState('RINGING...');
        setStateDetail(
          autoSpeaker 
            ? 'Ringing tone detected! Auto Speaker activated for hands-free listening.' 
            : 'Standard ringing tone detected. Phone ringing normally.'
        );
      }
    } else if (scenario === 'BUSY_TONE') {
      telecomAudioEngine.playBusyTone();
    } else if (scenario === 'HUMAN_PICKUP') {
      telecomAudioEngine.stopAllAudio();
      redialLoopRef.current = false;
      setCallState('CONNECTED!');
      setStateDetail(
        autoSpeaker 
          ? 'Recipient answered! Speakerphone ON & auto-redial stopped.' 
          : 'Recipient answered (Call.STATE_ACTIVE)! Auto-redial stopped permanently.'
      );
      
      setCallLogs(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          timestamp: new Date().toLocaleTimeString(),
          attempt: attemptCount || 1,
          detectedType: 'HUMAN_PICKUP',
          latencyMs: 14,
          action: 'Call connected successfully. Conversation active.',
          status: 'CONNECTED',
        }
      ]);
    }
  };

  // Microphone toggle
  const handleToggleMic = async () => {
    if (isMicActive) {
      telecomAudioEngine.stopAllAudio();
      setIsMicActive(false);
      setActiveScenario('SILENCE');
    } else {
      const ok = await telecomAudioEngine.startLiveMicrophone();
      if (ok) {
        setIsMicActive(true);
        setActiveScenario('LIVE_MIC');
      } else {
        alert("Microphone permission was not granted or microphone is unavailable.");
      }
    }
  };

  const handleAddHotline = (hotline: SavedHotline) => {
    setSavedHotlines(prev => [hotline, ...prev]);
  };

  const handleDeleteHotline = (id: string) => {
    setSavedHotlines(prev => prev.filter(h => h.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Zap className="w-5 h-5 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-tight text-white">AutoRedial Pro</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold">
                v2.0 Advanced
              </span>
            </div>
            <p className="text-xs text-slate-400">
              In-App Dialpad &bull; Contact Picker &bull; Auto Speaker &bull; 0–2000ms Delay
            </p>
          </div>
        </div>

        {/* Tab Navigation & Export Actions */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center p-1 rounded-2xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'simulator'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Live Simulator</span>
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'code'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Android Code</span>
            </button>

            <button
              onClick={() => setActiveTab('architecture')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'architecture'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Architecture</span>
            </button>
          </div>

          <button
            onClick={() => setIsApkModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all active:scale-95 animate-pulse"
            title="Download APK / Build Guide"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>APK ডাউনলোড</span>
          </button>

          <button
            onClick={() => downloadAndroidProjectZip()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 text-xs font-semibold transition-all shadow-sm"
            title="Download complete Android Studio ZIP"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden md:inline">Export ZIP</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Mobile Tab Switcher */}
        <div className="flex sm:hidden items-center justify-center p-1 rounded-2xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold text-center ${
              activeTab === 'simulator' ? 'bg-blue-600 text-white' : 'text-slate-400'
            }`}
          >
            Simulator
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold text-center ${
              activeTab === 'code' ? 'bg-blue-600 text-white' : 'text-slate-400'
            }`}
          >
            Code
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold text-center ${
              activeTab === 'architecture' ? 'bg-blue-600 text-white' : 'text-slate-400'
            }`}
          >
            Architecture
          </button>
        </div>

        {/* Tab 1: Live Simulator */}
        {activeTab === 'simulator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left: Pixel Android Phone Emulator */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <AndroidEmulator
                callState={callState}
                stateDetail={stateDetail}
                attemptCount={attemptCount}
                lastCutSpeedMs={lastCutSpeedMs}
                vadEnergy={metrics.rmsEnergy}
                dbValue={metrics.dbValue}
                redialDelayMs={redialDelayMs}
                sensitivityLevel={sensitivityLevel}
                phoneNumber={phoneNumber}
                autoSpeaker={autoSpeaker}
                muteRedials={muteRedials}
                savedHotlines={savedHotlines}
                onPhoneNumberChange={setPhoneNumber}
                onRedialDelayChange={setRedialDelayMs}
                onSensitivityChange={setSensitivityLevel}
                onToggleAutoSpeaker={setAutoSpeaker}
                onToggleMuteRedials={setMuteRedials}
                onAddHotline={handleAddHotline}
                onDeleteHotline={handleDeleteHotline}
                onStartRedial={handleStartRedial}
                onStopRedial={handleStopRedial}
                onSimulateScenario={handleSelectScenario}
              />
            </div>

            {/* Right: Audio Scenario Controls & Real-Time DSP Visualizer */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Quick Interactive Scenario Buttons */}
              <AudioScenarioTester
                currentScenario={activeScenario}
                isMicActive={isMicActive}
                onSelectScenario={handleSelectScenario}
                onToggleMic={handleToggleMic}
              />

              {/* Live Canvas Oscilloscope & Real-time Telephony Log */}
              <VadVisualizer
                metrics={metrics}
                isSampling={callState !== 'IDLE' && callState !== 'STOPPED'}
                callLogs={callLogs}
                lastCutSpeedMs={lastCutSpeedMs}
                sensitivityLevel={sensitivityLevel}
              />

              {/* Quick Code Reference Card */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Review Updated Android Kotlin Source Code</h4>
                  <p className="text-[11px] text-slate-400">
                    Includes In-App Dialpad BottomSheet, Contact Picker launcher, and Auto Speaker routing.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('code')}
                  className="px-3 py-1.5 rounded-xl bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30 text-xs font-semibold transition-colors"
                >
                  View Code &rarr;
                </button>
              </div>

            </div>

          </div>
        )}

        {/* Tab 2: Full Android Source Code Viewer */}
        {activeTab === 'code' && (
          <div className="space-y-6">
            <CodeViewer />
          </div>
        )}

        {/* Tab 3: Telecom & VAD Architecture Guide */}
        {activeTab === 'architecture' && (
          <div className="space-y-6">
            <ArchitectureGuide />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-400">
        AutoRedial Pro v2.0 &bull; In-App Dialpad &bull; Contact Picker &bull; Auto Speaker on Ring &bull; Millisecond VAD Telephony Engine
      </footer>

      {/* APK Build & Download Modal */}
      <ApkDownloadModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
      />

    </div>
  );
}
