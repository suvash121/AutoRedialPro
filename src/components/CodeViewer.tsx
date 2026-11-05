import React, { useState } from 'react';
import { 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  Layers, 
  FileText
} from 'lucide-react';
import { ANDROID_PROJECT_FILES, AndroidFile } from '../types/androidCode';
import { downloadAndroidProjectZip } from '../utils/projectExporter';

export const CodeViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<AndroidFile>(ANDROID_PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsExporting(true);
    try {
      await downloadAndroidProjectZip();
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadSingleFile = () => {
    const blob = new Blob([selectedFile.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredFiles = activeCategory === 'all' 
    ? ANDROID_PROJECT_FILES 
    : ANDROID_PROJECT_FILES.filter(f => f.category === activeCategory);

  return (
    <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-4">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Production-Ready Android Source Repository
              </h2>
              <p className="text-xs text-slate-400">
                100% Native Kotlin &amp; Material 3 XML ready for Android Studio
              </p>
            </div>
          </div>
        </div>

        {/* Global Download Project ZIP Button */}
        <button
          onClick={handleDownloadZip}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{isExporting ? 'Generating ZIP...' : 'Download Android Studio Project (.ZIP)'}</span>
        </button>
      </div>

      {/* Category Pills & File Selection */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {[
          { id: 'all', label: 'All Files' },
          { id: 'manifest', label: 'Manifest & Perms' },
          { id: 'layout', label: 'XML Layouts & Themes' },
          { id: 'kotlin', label: 'Kotlin Source & Services' },
          { id: 'config', label: 'Gradle Config' },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              activeCategory === cat.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-950/60 text-slate-400 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* File Tab Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {filteredFiles.map((file) => (
          <button
            key={file.path}
            onClick={() => setSelectedFile(file)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all border ${
              selectedFile.path === file.path
                ? 'bg-slate-800 text-blue-300 border-blue-500/50 shadow-md ring-1 ring-blue-500/30'
                : 'bg-slate-950/40 text-slate-400 border-slate-800 hover:bg-slate-800/60'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-blue-400" />
            <span>{file.filename}</span>
          </button>
        ))}
      </div>

      {/* Active File Info Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-white">{selectedFile.path}</span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {selectedFile.language}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
            {selectedFile.description}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>

          <button
            onClick={handleDownloadSingleFile}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="Download this file"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Code Window with Line Numbers */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
        <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            <span className="ml-2 text-slate-300 font-semibold">{selectedFile.filename}</span>
          </div>
          <span>{selectedFile.content.split('\n').length} lines</span>
        </div>

        <div className="max-h-[500px] overflow-y-auto p-4 font-mono text-xs text-slate-200 leading-relaxed scrollbar-thin">
          <pre className="overflow-x-auto">
            <code>{selectedFile.content}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
