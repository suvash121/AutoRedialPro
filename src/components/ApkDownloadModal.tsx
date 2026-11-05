import React, { useState } from 'react';
import { 
  Download, 
  X, 
  Smartphone, 
  Terminal, 
  CheckCircle2, 
  GitBranch, 
  Copy, 
  Check, 
  HelpCircle,
  ExternalLink,
  Cpu
} from 'lucide-react';
import { downloadAndroidProjectZip } from '../utils/projectExporter';

interface ApkDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkDownloadModal: React.FC<ApkDownloadModalProps> = ({ isOpen, onClose }) => {
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [lang, setLang] = useState<'bn' | 'en'>('bn');

  if (!isOpen) return null;

  const buildCommand = `./gradlew assembleDebug && cp app/build/outputs/apk/debug/app-debug.apk ./app-debug.apk && echo "APK_READY"`;

  const handleCopy = () => {
    navigator.clipboard.writeText(buildCommand);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsDownloadingZip(true);
    try {
      await downloadAndroidProjectZip();
    } finally {
      setIsDownloadingZip(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {lang === 'bn' ? 'APK ফাইল তৈরি ও ডাউনলোড নির্দেশিকা' : 'APK Build & Download Guide'}
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Android 14+
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                AutoRedial Pro &bull; com.autoredial.pro
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="flex items-center rounded-xl bg-slate-800 p-0.5 text-xs font-semibold">
              <button
                onClick={() => setLang('bn')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${lang === 'bn' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                বাংলা
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${lang === 'en' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                English
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin">
          
          {/* Important Notice Banner */}
          <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/30 text-xs text-blue-200 flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-white block font-semibold">
                {lang === 'bn' ? 'ব্রাউজার ও সার্ভার থেকে সরাসরি APK কেন আসে না?' : 'Why can’t a web browser compile Android binaries directly?'}
              </strong>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                {lang === 'bn'
                  ? 'অ্যান্ড্রয়েড APK তৈরি করার জন্য অফিসিয়াল Android SDK 34 এবং Java (JDK 17) কম্পাইলার প্রয়োজন (যা প্রায় ৩-৪ জিবি সাইজের)। নিচে দেওয়া ২টি সহজ উপায়ে আপনি এখনই APK তৈরি করে আপনার ফোনে ইনস্টল করতে পারবেন:'
                  : 'Compiling a native Android APK requires the official Android SDK 34 and Java JDK 17 (3–4 GB of build tools). Use one of the 2 easy methods below to build and install your APK:'}
              </p>
            </div>
          </div>

          {/* Method 1: Android Studio (Recommended & Instant) */}
          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                {lang === 'bn' ? 'পদ্ধতি ১: Android Studio দিয়ে সরাসরি APK তৈরি (সবচেয়ে সহজ)' : 'Method 1: Direct Build in Android Studio (Instant)'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                {lang === 'bn' ? '১ মিনিটে তৈরি' : '1 min'}
              </span>
            </div>

            <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
              <li>
                {lang === 'bn' 
                  ? 'নিচের বাটনে ক্লিক করে সম্পূর্ণ প্রজেক্টের ZIP ফাইলটি ডাউনলোড করুন:'
                  : 'Click the button below to download the complete ready-to-run Android Studio project:'}
              </li>
            </ol>

            <button
              onClick={handleDownloadZip}
              disabled={isDownloadingZip}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              <span>
                {isDownloadingZip 
                  ? (lang === 'bn' ? 'ZIP তৈরি হচ্ছে...' : 'Generating ZIP...') 
                  : (lang === 'bn' ? 'সম্পূর্ণ Android প্রজেক্ট ZIP ডাউনলোড করুন' : 'Download Complete Android Project (.ZIP)')}
              </span>
            </button>

            <ol start={2} className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed pt-1">
              <li>
                {lang === 'bn' 
                  ? 'ডাউনলোড করা ZIP ফাইলটি আনজিপ (Extract) করুন।' 
                  : 'Unzip the downloaded file.'}
              </li>
              <li>
                {lang === 'bn' 
                  ? 'Android Studio ওপেন করে File > Open দিয়ে এই ফোল্ডারটি সিলেক্ট করুন।' 
                  : 'Open Android Studio and select File > Open with this folder.'}
              </li>
              <li>
                {lang === 'bn' 
                  ? 'উপরের মেনু থেকে Build > Build Bundle(s) / APK(s) > Build APK(s) চাপুন।' 
                  : 'From the top menu, select Build > Build Bundle(s) / APK(s) > Build APK(s).'}
              </li>
              <li>
                {lang === 'bn' 
                  ? 'তৈরি হওয়া app-debug.apk ফাইলটি সরাসরি আপনার ফোনে পাঠিয়ে ইনস্টল করে নিন!' 
                  : 'The generated app-debug.apk is ready to transfer and install on your phone!'}
              </li>
            </ol>
          </div>

          {/* Method 2: Free 1-Click Cloud APK Build with GitHub Actions */}
          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-bold text-blue-400">
                <GitBranch className="w-4 h-4" />
                {lang === 'bn' ? 'পদ্ধতি ২: কম্পিউটার ছাড়া ক্লাউড থেকে APK বিল্ড (GitHub Actions)' : 'Method 2: Free Cloud APK Build via GitHub Actions'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                {lang === 'bn' ? 'কম্পিউটার ছাড়া' : 'No PC Needed'}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {lang === 'bn' 
                ? 'আমরা ইতিমধ্যে এই প্রজেক্টের ভেতরে .github/workflows/build-apk.yml ফাইলটি যুক্ত করে দিয়েছি। আপনি এই কোডটি একটি নতুন GitHub রিপোজিটরিতে পুশ করলেই গিটহাব ক্লাউড অটোমেটিক APK তৈরি করে দেবে!'
                : 'A pre-configured .github/workflows/build-apk.yml is already included in the codebase. Push this project to a GitHub repository, and GitHub will automatically compile the APK in the cloud for free!'}
            </p>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div>&bull; {lang === 'bn' ? 'GitHub রিপোজিটরিতে কোড পুশ করুন।' : 'Push code to a GitHub repo.'}</div>
              <div>&bull; {lang === 'bn' ? 'Actions ট্যাবে গেলে দেখবেন "Assemble Debug APK" রান হচ্ছে।' : 'Click the "Actions" tab to watch "Assemble Debug APK" build.'}</div>
              <div>&bull; {lang === 'bn' ? 'বিল্ড শেষ হলে Artifacts থেকে সরাসরি app-debug.apk ডাউনলোড করুন!' : 'Download app-debug.apk directly from the Artifacts section!'}</div>
            </div>
          </div>

          {/* Method 3: Terminal Command (For Developers) */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-amber-400" />
                {lang === 'bn' ? 'টার্মিনালে সরাসরি রান করার কমান্ড:' : 'Terminal Command:'}
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
              >
                {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCmd ? (lang === 'bn' ? 'কপি হয়েছে!' : 'Copied!') : (lang === 'bn' ? 'কমান্ড কপি করুন' : 'Copy')}</span>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 font-mono text-[11px] text-amber-300 overflow-x-auto border border-slate-800">
              <code>{buildCommand}</code>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>{lang === 'bn' ? 'Android 8.0 থেকে Android 14+ সাপোর্টেড' : 'Supports Android 8.0 to Android 14+'}</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
