import React, { useState } from 'react';
import { 
  Phone, 
  PhoneCall, 
  PhoneOff, 
  Volume2, 
  VolumeX,
  Square, 
  Play, 
  UserCheck, 
  Radio, 
  Sparkles,
  Zap,
  Grid,
  Users,
  Plus,
  Delete,
  X,
  Check,
  Speaker,
  Clock
} from 'lucide-react';
import { telecomAudioEngine } from '../utils/audioEngine';

export type EmulatorCallState = 
  | 'IDLE' 
  | 'DIALING...' 
  | 'DETECTING AUDIO...' 
  | 'RINGING...' 
  | 'VOICE / BUSY DETECTED!' 
  | 'CONNECTED!' 
  | 'STOPPED';

export interface SavedHotline {
  id: string;
  name: string;
  number: string;
  category: 'doctor' | 'hospital' | 'emergency' | 'general';
}

interface AndroidEmulatorProps {
  callState: EmulatorCallState;
  stateDetail: string;
  attemptCount: number;
  lastCutSpeedMs: number | null;
  vadEnergy: number;
  dbValue: number;
  redialDelayMs: number;
  sensitivityLevel: number;
  phoneNumber: string;
  autoSpeaker: boolean;
  muteRedials: boolean;
  savedHotlines: SavedHotline[];
  onPhoneNumberChange: (val: string) => void;
  onRedialDelayChange: (val: number) => void;
  onSensitivityChange: (val: number) => void;
  onToggleAutoSpeaker: (enabled: boolean) => void;
  onToggleMuteRedials: (enabled: boolean) => void;
  onAddHotline: (hotline: SavedHotline) => void;
  onDeleteHotline: (id: string) => void;
  onStartRedial: () => void;
  onStopRedial: (reason?: string) => void;
  onSimulateScenario: (scenario: 'IVR_VOICE' | 'RINGBACK_TONE' | 'BUSY_TONE' | 'HUMAN_PICKUP') => void;
}

export const AndroidEmulator: React.FC<AndroidEmulatorProps> = ({
  callState,
  stateDetail,
  attemptCount,
  lastCutSpeedMs,
  vadEnergy,
  dbValue,
  redialDelayMs,
  phoneNumber,
  autoSpeaker,
  muteRedials,
  savedHotlines,
  onPhoneNumberChange,
  onRedialDelayChange,
  onToggleAutoSpeaker,
  onToggleMuteRedials,
  onAddHotline,
  onDeleteHotline,
  onStartRedial,
  onStopRedial,
}) => {
  const [showDialpad, setShowDialpad] = useState(false);
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [showAddHotlineModal, setShowAddHotlineModal] = useState(false);
  const [newHotlineName, setNewHotlineName] = useState('');
  const [newHotlineNumber, setNewHotlineNumber] = useState('');
  const [newHotlineCategory, setNewHotlineCategory] = useState<'doctor' | 'hospital' | 'emergency' | 'general'>('doctor');

  const isRunning = callState !== 'IDLE' && callState !== 'STOPPED' && callState !== 'CONNECTED!';

  // Preset mock contacts for contact picker
  const MOCK_CONTACTS = [
    { name: 'Dr. Sarah Jenkins (Cardiology)', number: '+1 (555) 019-2834', type: 'Doctor' },
    { name: 'City Hospital Emergency Desk', number: '+880 1711 000000', type: 'Emergency' },
    { name: 'Dr. Robert Chen (Pediatrician)', number: '+1 (555) 438-9201', type: 'Doctor' },
    { name: 'Central Health Clinic Hotline', number: '+1 800 555 0199', type: 'Clinic' },
    { name: 'National Medical Helpline', number: '16263', type: 'Helpline' },
  ];

  const handleDialpadTap = (digit: string) => {
    telecomAudioEngine.playDtmfTone(digit);
    onPhoneNumberChange(phoneNumber + digit);
  };

  const handleDialpadBackspace = () => {
    if (phoneNumber.length > 0) {
      onPhoneNumberChange(phoneNumber.slice(0, -1));
    }
  };

  const handleSaveCustomHotline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHotlineName.trim() || !newHotlineNumber.trim()) return;
    onAddHotline({
      id: Math.random().toString(),
      name: newHotlineName.trim(),
      number: newHotlineNumber.trim(),
      category: newHotlineCategory,
    });
    setNewHotlineName('');
    setNewHotlineNumber('');
    setShowAddHotlineModal(false);
  };

  const getStatusColor = () => {
    switch (callState) {
      case 'RINGING...': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'VOICE / BUSY DETECTED!': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'CONNECTED!': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      case 'DETECTING AUDIO...': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'DIALING...': return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30';
      default: return 'text-slate-400 bg-slate-800/40 border-slate-700/50';
    }
  };

  const getStatusIcon = () => {
    switch (callState) {
      case 'RINGING...': return <Volume2 className="w-8 h-8 text-emerald-400 animate-bounce" />;
      case 'VOICE / BUSY DETECTED!': return <PhoneOff className="w-8 h-8 text-amber-400 animate-pulse" />;
      case 'CONNECTED!': return <UserCheck className="w-8 h-8 text-cyan-400" />;
      case 'DETECTING AUDIO...': return <Radio className="w-8 h-8 text-blue-400 animate-spin" />;
      case 'DIALING...': return <PhoneCall className="w-8 h-8 text-indigo-400 animate-pulse" />;
      default: return <Phone className="w-8 h-8 text-blue-400" />;
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-[400px] rounded-[48px] bg-slate-950 p-3 shadow-2xl ring-1 ring-slate-800/80 shadow-blue-950/20">
      {/* Outer Phone Frame */}
      <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border border-slate-800 text-slate-100 flex flex-col h-[780px]">
        
        {/* Android Punch Hole & Status Bar */}
        <div className="flex items-center justify-between px-6 pt-3 pb-2 text-xs font-medium text-slate-400 select-none">
          <span>09:41</span>
          <div className="w-3.5 h-3.5 rounded-full bg-black ring-1 ring-slate-800/80 mx-auto" />
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold tracking-wider text-emerald-400">5G</span>
            <div className="w-5 h-2.5 rounded-sm border border-slate-500 p-0.5 flex items-center">
              <div className="h-full w-4/5 bg-emerald-400 rounded-2xs" />
            </div>
          </div>
        </div>

        {/* Material 3 App Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800/60 bg-slate-900/40 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-sm">
              <Zap className="w-4 h-4 fill-blue-400" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                AutoRedial Pro
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
                  v2.0
                </span>
              </h1>
              <p className="text-[10px] text-slate-400">In-App Dialpad &bull; Auto Speaker &bull; VAD</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {autoSpeaker && (
              <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" title="Auto Speaker Active">
                <Speaker className="w-3.5 h-3.5" />
              </span>
            )}
            {muteRedials && (
              <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" title="Redial Mute Active">
                <VolumeX className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Screen Content */}
        <div className="flex-1 overflow-y-auto px-5 py-3.5 space-y-3.5 scrollbar-thin">
          
          {/* Target Phone Input Row with Dialpad & Contact Buttons */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Target Phone Number
              </label>
              <button
                disabled={isRunning}
                onClick={() => setShowDialpad(true)}
                className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                <Grid className="w-3 h-3" />
                Open Dialpad
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 flex items-center">
                <div className="absolute left-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4 text-blue-400" />
                </div>
                <input
                  type="tel"
                  value={phoneNumber}
                  disabled={isRunning}
                  onChange={(e) => onPhoneNumberChange(e.target.value)}
                  placeholder="Enter or pick number"
                  className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-slate-900 border border-slate-700/80 text-white font-mono text-base tracking-wide focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-inner"
                />
              </div>

              {/* In-App Dialpad Trigger Button */}
              <button
                disabled={isRunning}
                onClick={() => setShowDialpad(true)}
                className="p-2.5 rounded-2xl bg-cyan-600/15 hover:bg-cyan-600/25 border border-cyan-500/30 text-cyan-300 transition-all active:scale-95 disabled:opacity-50"
                title="Open In-App Dialpad"
              >
                <Grid className="w-5 h-5" />
              </button>

              {/* Contact Picker Button */}
              <button
                disabled={isRunning}
                onClick={() => setShowContactPicker(true)}
                className="p-2.5 rounded-2xl bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-blue-300 transition-all active:scale-95 disabled:opacity-50"
                title="Select from Contacts / Call Logs"
              >
                <Users className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Saved Hotlines / Doctor Appointments Section */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                Saved Hotlines / Doctors
              </span>
              <button
                disabled={isRunning}
                onClick={() => setShowAddHotlineModal(true)}
                className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-0.5 transition-colors disabled:opacity-50"
              >
                <Plus className="w-3 h-3" />
                Add
              </button>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {savedHotlines.map((hotline) => (
                <div
                  key={hotline.id}
                  className="group flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-xs shrink-0 transition-all"
                >
                  <button
                    disabled={isRunning}
                    onClick={() => onPhoneNumberChange(hotline.number)}
                    className="flex items-center gap-1.5 text-slate-300 hover:text-white disabled:opacity-50"
                  >
                    <span className="text-[12px]">
                      {hotline.category === 'doctor' ? '🩺' : hotline.category === 'hospital' ? '🏥' : '🚨'}
                    </span>
                    <span className="font-medium text-[11px]">{hotline.name}</span>
                  </button>
                  <button
                    onClick={() => onDeleteHotline(hotline.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-opacity ml-0.5"
                    title="Remove"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Live Status Card */}
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-4 text-center shadow-xl relative overflow-hidden">
            <div className={`absolute inset-0 opacity-15 blur-2xl transition-colors duration-500 pointer-events-none ${
              callState === 'RINGING...' ? 'bg-emerald-500' :
              callState === 'VOICE / BUSY DETECTED!' ? 'bg-amber-500' :
              callState === 'CONNECTED!' ? 'bg-cyan-500' :
              isRunning ? 'bg-blue-600' : 'bg-transparent'
            }`} />

            <div className="relative mx-auto w-16 h-16 flex items-center justify-center my-0.5">
              {isRunning && (
                <div className="absolute inset-0 rounded-full border-2 border-blue-500/40 animate-ping opacity-60" />
              )}
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-lg transition-all duration-300 ${getStatusColor()}`}>
                {getStatusIcon()}
              </div>
            </div>

            <h2 className="text-base font-black tracking-wide text-white mt-2 font-mono">
              {callState}
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5 max-w-[260px] mx-auto leading-relaxed">
              {stateDetail}
            </p>

            {/* VAD Energy Level Bar */}
            <div className="mt-3 pt-2.5 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                <span className="flex items-center gap-1">
                  <Radio className="w-3 h-3 text-cyan-400" />
                  VAD AUDIO ENERGY
                </span>
                <span className="font-semibold text-cyan-400">{dbValue} dB</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden p-0.5">
                <div 
                  className="h-full rounded-full transition-all duration-75 bg-gradient-to-r from-blue-500 via-cyan-400 to-amber-400"
                  style={{ width: `${Math.min(vadEnergy * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-1.5 mt-3 pt-2.5 border-t border-slate-800/80 text-center">
              <div className="bg-slate-950/40 rounded-xl p-1.5 border border-slate-800/60">
                <div className="text-sm font-black text-white font-mono">#{attemptCount}</div>
                <div className="text-[9px] font-medium text-slate-400">ATTEMPTS</div>
              </div>

              <div className="bg-slate-950/40 rounded-xl p-1.5 border border-slate-800/60">
                <div className="text-sm font-black text-amber-400 font-mono">
                  {lastCutSpeedMs ? `${lastCutSpeedMs}ms` : '--'}
                </div>
                <div className="text-[9px] font-medium text-slate-400">CUT SPEED</div>
              </div>

              <div className="bg-slate-950/40 rounded-xl p-1.5 border border-slate-800/60">
                <div className="text-[10px] font-bold text-emerald-400 mt-0.5">440/480Hz</div>
                <div className="text-[9px] font-medium text-slate-400">RING FILTER</div>
              </div>
            </div>
          </div>

          {/* Audio & Speaker Controls Card */}
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800/80 p-3 space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Audio &amp; Speaker Settings
            </span>

            {/* Auto Speakerphone on Ringing Switch */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Speaker className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200">Auto Speaker on Ringing</div>
                  <div className="text-[10px] text-slate-400">Hands-free speakerphone on ring/pickup</div>
                </div>
              </div>
              <button
                onClick={() => onToggleAutoSpeaker(!autoSpeaker)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${autoSpeaker ? 'bg-cyan-500' : 'bg-slate-800'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${autoSpeaker ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Mute Rapid Redials Switch */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <VolumeX className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200">Mute Rapid Redial Clicks</div>
                  <div className="text-[10px] text-slate-400">Silences ear-piercing robot sounds during loop</div>
                </div>
              </div>
              <button
                onClick={() => onToggleMuteRedials(!muteRedials)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${muteRedials ? 'bg-indigo-500' : 'bg-slate-800'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${muteRedials ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          {/* Speed & Delay Controller (0 ms to 2000 ms) */}
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800/80 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-slate-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                Redial Loop Delay
              </span>
              <span className="font-mono text-blue-400 font-bold">
                {redialDelayMs === 0 ? '0 ms (Instant Cut)' : `${redialDelayMs} ms`}
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="2000"
              step="25"
              disabled={isRunning}
              value={redialDelayMs}
              onChange={(e) => onRedialDelayChange(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer disabled:opacity-50"
            />

            {/* Quick Delay Presets */}
            <div className="grid grid-cols-4 gap-1 pt-1">
              {[0, 50, 250, 1000].map((preset) => (
                <button
                  key={preset}
                  disabled={isRunning}
                  onClick={() => onRedialDelayChange(preset)}
                  className={`py-1 rounded-lg text-[10px] font-mono border transition-all ${
                    redialDelayMs === preset
                      ? 'bg-blue-600/30 text-blue-300 border-blue-500/50 font-bold'
                      : 'bg-slate-950/40 text-slate-400 border-slate-800 hover:bg-slate-800/50'
                  }`}
                >
                  {preset === 0 ? '0ms' : preset >= 1000 ? `${preset / 1000}s` : `${preset}ms`}
                </button>
              ))}
            </div>
          </div>

          {/* Call Controls: Start or Floating Stop Button */}
          <div className="pt-1">
            {!isRunning ? (
              <button
                onClick={onStartRedial}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]"
              >
                <Play className="w-4 h-4 fill-white" />
                START AUTO-REDIAL
              </button>
            ) : (
              <button
                onClick={() => onStopRedial('User clicked Stop')}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-sm shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] animate-pulse"
              >
                <Square className="w-4 h-4 fill-white" />
                STOP AUTO-REDIAL
              </button>
            )}
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 pb-1">
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span>Telecom InCallService &bull; Speakerphone Router</span>
          </div>

        </div>

        {/* In-App Dialpad BottomSheet Modal */}
        {showDialpad && (
          <div className="absolute inset-x-0 bottom-0 z-50 rounded-t-[36px] bg-slate-900/98 backdrop-blur-xl border-t border-slate-700/80 p-5 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-300">In-App Dialpad (DTMF Sound)</span>
              <button
                onClick={() => setShowDialpad(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Dialed Display */}
            <div className="flex items-center justify-between py-3 px-2">
              <div className="text-xl font-mono font-bold text-white tracking-widest overflow-x-auto">
                {phoneNumber || <span className="text-slate-600 font-sans text-sm">Tap digits...</span>}
              </div>
              <button
                onClick={handleDialpadBackspace}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 active:scale-90 transition-transform"
                title="Backspace"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>

            {/* 3x4 Dialpad Matrix */}
            <div className="grid grid-cols-3 gap-2.5 my-2">
              {[
                { digit: '1', letters: '' },
                { digit: '2', letters: 'ABC' },
                { digit: '3', letters: 'DEF' },
                { digit: '4', letters: 'GHI' },
                { digit: '5', letters: 'JKL' },
                { digit: '6', letters: 'MNO' },
                { digit: '7', letters: 'PQRS' },
                { digit: '8', letters: 'TUV' },
                { digit: '9', letters: 'WXYZ' },
                { digit: '*', letters: '' },
                { digit: '0', letters: '+' },
                { digit: '#', letters: '' },
              ].map(({ digit, letters }) => (
                <button
                  key={digit}
                  onClick={() => handleDialpadTap(digit)}
                  className="h-14 rounded-2xl bg-slate-950/70 hover:bg-slate-800 active:bg-blue-600/20 border border-slate-800/90 hover:border-slate-700 flex flex-col items-center justify-center transition-all active:scale-95 shadow-sm"
                >
                  <span className="text-lg font-bold font-mono text-white leading-none">{digit}</span>
                  {letters && <span className="text-[9px] text-slate-400 font-medium tracking-wider">{letters}</span>}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowDialpad(false)}
              className="w-full mt-2 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/20"
            >
              <Check className="w-4 h-4" />
              APPLY NUMBER
            </button>
          </div>
        )}

        {/* Contact Picker Modal */}
        {showContactPicker && (
          <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-md p-5 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-400" />
                Phone Contacts &amp; Call Logs
              </span>
              <button
                onClick={() => setShowContactPicker(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-2">
              {MOCK_CONTACTS.map((c, i) => (
                <button
                  key={i}
                  onClick={() => {
                    onPhoneNumberChange(c.number);
                    setShowContactPicker(false);
                  }}
                  className="w-full p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/60 text-left transition-all flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-white">{c.name}</div>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5">{c.number}</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                    {c.type}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add Hotline Modal */}
        {showAddHotlineModal && (
          <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-md p-5 flex flex-col justify-center">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-white">Save Quick Hotline / Doctor</span>
                <button
                  onClick={() => setShowAddHotlineModal(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveCustomHotline} className="space-y-3">
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">Contact Name</label>
                  <input
                    type="text"
                    value={newHotlineName}
                    onChange={(e) => setNewHotlineName(e.target.value)}
                    placeholder="e.g. Dr. Emily (Pediatrics)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={newHotlineNumber}
                    onChange={(e) => setNewHotlineNumber(e.target.value)}
                    placeholder="e.g. +1 (555) 019-9999"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">Category</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['doctor', 'hospital', 'emergency'] as const).map(cat => (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => setNewHotlineCategory(cat)}
                        className={`py-1 rounded-lg text-[10px] font-medium border capitalize ${
                          newHotlineCategory === cat
                            ? 'bg-blue-600/30 text-blue-300 border-blue-500/50'
                            : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddHotlineModal(false)}
                    className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                  >
                    Save Contact
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Android Gesture Bar */}
        <div className="py-2 flex justify-center">
          <div className="w-32 h-1 bg-slate-700/80 rounded-full" />
        </div>

      </div>
    </div>
  );
};
