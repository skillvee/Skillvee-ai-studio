import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  CheckCircle2, AlertTriangle, ChevronDown, ChevronUp, Sparkles, 
  Loader2, Play, Pause, SkipBack, SkipForward, Download, ArrowLeft, Maximize2, PlayCircle, FileText, Share2
} from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, ScrollArea } from '../ui/index';
import { EvaluationResult, DimensionName, DimensionScore, Message, KeyHighlight } from '../../types/index';
import { useVideoEvaluation } from '../../hooks/use-video-evaluation';
import { cn } from '../../lib/utils';

interface ResultsViewProps {
  onRestart: () => void;
  screenshots: Blob[];
  chatHistory: Message[];
  videoBlob: Blob | null;
}

export function ResultsView({ onRestart, screenshots, chatHistory, videoBlob }: ResultsViewProps) {
  const { status, result } = useVideoEvaluation({ shouldStart: true, screenshots, chatHistory, videoBlob });
  const [loadingStep, setLoadingStep] = useState(0);

  // Simulate loading steps for better UX
  useEffect(() => {
    if (status === 'PROCESSING') {
      const interval = setInterval(() => {
        setLoadingStep(prev => (prev < 3 ? prev + 1 : prev));
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [status]);

  if (status === 'PENDING' || status === 'PROCESSING') {
    const steps = [
      "Uploading session data & screenshots...",
      "Analyzing communication & collaboration patterns...",
      "Evaluating technical problem solving & code quality...",
      "Generating your personalized hiring report..."
    ];

    return (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-slate-50 p-6 font-sans overflow-hidden">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="relative mx-auto w-24 h-24">
             <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
             <div className="absolute inset-0 border-4 border-[#237CF1] border-t-transparent rounded-full animate-spin"></div>
             <Sparkles className="absolute inset-0 m-auto text-[#237CF1] animate-pulse" size={32} />
          </div>
          
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Assessing Your Session</h2>
            <div className="space-y-3">
              {steps.map((step, idx) => (
                <div key={idx} className={cn(
                  "flex items-center gap-3 text-sm transition-all duration-500",
                  idx <= loadingStep ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
                  idx === loadingStep ? "text-[#237CF1] font-medium" : "text-slate-500"
                )}>
                  {idx < loadingStep ? (
                    <CheckCircle2 size={16} className="text-green-500" />
                  ) : idx === loadingStep ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300" />
                  )}
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'FAILED' || !result) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-slate-50">
        <div className="text-center max-w-md p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
          <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Analysis Failed</h2>
          <p className="text-slate-500 mb-6 text-sm">We couldn't generate your report at this time. This usually happens if the AI service is busy or the recording data was incomplete.</p>
          <Button onClick={onRestart} variant="outline" className="w-full">Try Again</Button>
        </div>
      </div>
    );
  }

  // Calculate circle properties
  const radius = 56; // Reduced slightly from 60 to prevent stroke cutting
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-y-auto scroll-smooth">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onRestart} className="text-slate-500 hover:text-slate-900">
            <ArrowLeft size={20} />
          </Button>
          <div className="h-6 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-[#237CF1] rounded-lg flex items-center justify-center text-white font-bold">S</div>
            <span className="font-bold text-lg hidden md:inline tracking-tight">Assessment Report</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="hidden md:flex gap-2 border-slate-200 hover:bg-slate-50">
            <Download size={14} />
            Export
          </Button>
          <Button size="sm" className="bg-[#237CF1] hover:bg-blue-600 gap-2 shadow-lg shadow-blue-500/20">
            <Share2 size={14} />
            Share
          </Button>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-6 md:p-8 space-y-8 pb-32">
        
        {/* Top Hero: Score & Recommendation */}
        <div className="grid lg:grid-cols-4 gap-6">
          
          {/* OVERALL SCORE CARD - Dark Theme to match landing page */}
          <Card className="lg:col-span-1 border-slate-800 shadow-xl overflow-hidden relative bg-[#020617] text-white">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#237CF1] to-purple-500" />
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-[#237CF1] rounded-full blur-[60px] opacity-20 pointer-events-none" />
            
            <CardContent className="pt-10 pb-10 text-center relative z-10">
              <div className="relative inline-block mb-6">
                <svg className="w-36 h-36 transform -rotate-90 overflow-visible">
                  {/* Track */}
                  <circle 
                    cx="64" cy="64" r={radius} 
                    stroke="#1e293b" 
                    strokeWidth="8" 
                    fill="transparent" 
                  />
                  {/* Progress */}
                  <circle 
                    cx="64" cy="64" r={radius} 
                    stroke={result.overallScore >= 4 ? "#22c55e" : result.overallScore >= 3 ? "#eab308" : "#ef4444"} 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - (circumference * (result.overallScore / 5))}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black tracking-tighter">{result.overallScore}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Overall</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <Badge className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-bold shadow-none uppercase tracking-wider border-0",
                  result.recommendation === 'hire' ? "bg-green-500/20 text-green-400" :
                  result.recommendation === 'maybe' ? "bg-yellow-500/20 text-yellow-400" :
                  "bg-red-500/20 text-red-400"
                )}>
                  {result.recommendation === 'hire' ? "Strong Hire" : 
                   result.recommendation === 'maybe' ? "Needs Review" : "No Hire"}
                </Badge>
                <p className="text-xs text-slate-400 font-medium flex items-center justify-center gap-1.5">
                   <Sparkles size={12} className="text-[#237CF1]" />
                   Confidence: <span className="text-slate-200 capitalize">{result.confidence}</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* SUMMARY CARD */}
          <Card className="lg:col-span-3 border-slate-200 shadow-sm flex flex-col justify-center bg-white relative overflow-hidden">
            <CardHeader className="pb-2 relative z-10">
              <CardTitle className="text-xl font-bold text-slate-900 tracking-tight">Executive Summary</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-slate-600 leading-relaxed mb-8 max-w-4xl">
                {result.overallSummary}
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-emerald-50/50 rounded-xl p-5 border border-emerald-100/60">
                  <h4 className="text-xs font-black text-emerald-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <CheckCircle2 size={16} /> Key Strengths
                  </h4>
                  <ul className="space-y-3">
                    {result.overallGreenFlags.slice(0, 3).map((flag, i) => (
                      <li key={i} className="text-sm text-slate-700 flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                        {flag}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-amber-50/50 rounded-xl p-5 border border-amber-100/60">
                  <h4 className="text-xs font-black text-amber-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <AlertTriangle size={16} /> Areas to Probe
                  </h4>
                  <ul className="space-y-3">
                     {result.overallRedFlags.length > 0 ? (
                       result.overallRedFlags.slice(0, 3).map((flag, i) => (
                        <li key={i} className="text-sm text-slate-700 flex items-start gap-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                          {flag}
                        </li>
                      ))
                     ) : (
                       <li className="text-sm text-slate-400 italic">No significant concerns flagged.</li>
                     )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid xl:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Video & Timeline (5 cols) */}
          <div className="xl:col-span-5 space-y-6">
            <div className="sticky top-24 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 tracking-tight">
                  <PlayCircle size={20} className="text-[#237CF1]" />
                  Session Replay
                </h3>
              </div>

              <EvidencePlayer 
                videoBlob={videoBlob}
                highlights={result.keyHighlights} 
              />
              
              <Card className="border-slate-200 shadow-sm max-h-[500px] flex flex-col bg-white">
                <CardHeader className="py-4 border-b border-slate-100 bg-slate-50/50">
                  <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500">Key Moments</CardTitle>
                </CardHeader>
                <ScrollArea className="flex-1">
                  <div className="p-2">
                    {result.keyHighlights.length > 0 ? (
                      result.keyHighlights.map((highlight, idx) => (
                        <div 
                          key={idx} 
                          className="group flex gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100"
                        >
                          <div className={cn(
                            "mt-1.5 w-2 h-2 rounded-full shrink-0 shadow-sm",
                            highlight.type === 'positive' ? "bg-green-500" : "bg-amber-500"
                          )} />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="font-mono text-[10px] h-5 px-1.5 bg-slate-100 text-slate-600 border-slate-200">
                                {highlight.timestamp}
                              </Badge>
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{highlight.dimension}</span>
                            </div>
                            <p className="text-sm text-slate-700 leading-snug font-medium">
                              {highlight.description}
                            </p>
                            {highlight.quote && (
                              <p className="text-xs text-slate-500 italic pl-3 border-l-2 border-slate-200 mt-2 font-serif">
                                "{highlight.quote}"
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-slate-400 text-sm">
                        No specific highlights extracted from this session.
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </Card>
            </div>
          </div>

          {/* RIGHT COLUMN: Skill Breakdown (7 cols) */}
          <div className="xl:col-span-7 space-y-6">
            <div className="flex items-center gap-4 mb-2">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Detailed Skill Evaluation</h3>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="grid gap-4">
              {Object.entries(result.dimensionScores).map(([key, score]) => (
                <SkillCard key={key} title={key as DimensionName} data={score} />
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function SkillCard({ title, data }: { title: DimensionName, data: DimensionScore }) {
  const [isOpen, setIsOpen] = useState(false);
  
  if (data.score === null) return null;

  const getLevelColor = (score: number) => {
    if (score >= 4.5) return "bg-purple-50 text-purple-700 border-purple-100";
    if (score >= 4) return "bg-green-50 text-green-700 border-green-100";
    if (score >= 3) return "bg-blue-50 text-blue-700 border-blue-100";
    return "bg-slate-50 text-slate-600 border-slate-100";
  };

  const getBarColor = (score: number) => {
    if (score >= 4) return "bg-green-500";
    if (score >= 3) return "bg-blue-500";
    return "bg-amber-500";
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md hover:border-[#237CF1]/20 group">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center p-5 gap-6"
      >
        <div className="flex-1 text-left">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-slate-900 text-base capitalize flex items-center gap-2">
              {title.replace(/_/g, " ").toLowerCase()}
              {data.trainableGap && (
                <Badge variant="outline" className="text-[9px] h-4 px-1.5 text-slate-400 font-normal border-slate-200 bg-slate-50">
                  Coachable
                </Badge>
              )}
            </span>
            <span className="font-mono font-bold text-slate-900 text-lg">{data.score}<span className="text-slate-300 text-sm font-normal">/5</span></span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={cn("h-full rounded-full transition-all duration-1000", getBarColor(data.score))} 
                style={{ width: `${(data.score / 5) * 100}%` }}
              />
            </div>
            <div className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded border", getLevelColor(data.score))}>
              {data.score >= 4.5 ? "Exceptional" : data.score >= 4 ? "Strong" : data.score >= 3 ? "Adequate" : "Developing"}
            </div>
          </div>
        </div>
        
        <div className={cn("text-slate-300 transition-transform duration-200", isOpen && "rotate-180")}>
          <ChevronDown size={20} />
        </div>
      </button>

      {isOpen && (
        <div className="px-5 pb-6 pt-0 animate-slide-up">
          <div className="h-px w-full bg-slate-50 mb-5" />
          
          <div className="flex items-start gap-4 mb-6">
            <div className="mt-1 shrink-0">
               <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#237CF1]">
                 <FileText size={16} />
               </div>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed pt-1">
              {data.rationale}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-4 bg-slate-50/50 rounded-xl p-5 border border-slate-100/80">
            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Evidence</h4>
              <ul className="space-y-2">
                {data.greenFlags.length > 0 ? data.greenFlags.map((flag, i) => (
                  <li key={i} className="flex gap-2.5 text-xs text-slate-700 font-medium">
                    <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                    {flag}
                  </li>
                )) : <span className="text-xs text-slate-400 italic">No specific strengths noted.</span>}
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Concerns</h4>
               <ul className="space-y-2">
                {data.redFlags.length > 0 ? data.redFlags.map((flag, i) => (
                  <li key={i} className="flex gap-2.5 text-xs text-slate-700 font-medium">
                    <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                    {flag}
                  </li>
                )) : <span className="text-xs text-slate-400 italic">No specific concerns noted.</span>}
              </ul>
            </div>
          </div>

          {data.timestamps.length > 0 && (
            <div className="flex items-center gap-3 mt-5 pt-5 border-t border-slate-50">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Citations:</span>
              <div className="flex flex-wrap gap-2">
                {data.timestamps.map(ts => (
                  <Badge key={ts} variant="secondary" className="font-mono text-[10px] text-slate-600 bg-white border border-slate-200 cursor-pointer hover:border-[#237CF1]/50 transition-colors shadow-sm">
                    {ts}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- EVIDENCE PLAYER ---

interface EvidencePlayerProps {
  videoBlob: Blob | null;
  highlights: KeyHighlight[];
}

function EvidencePlayer({ videoBlob, highlights }: EvidencePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoError, setVideoError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (videoBlob) {
      if (videoBlob.size === 0) {
        setVideoError("Video recording is empty (0 bytes).");
        return;
      }
      console.log(`EvidencePlayer received blob: ${videoBlob.size} bytes, ${videoBlob.type}`);
      const url = URL.createObjectURL(videoBlob);
      setVideoUrl(url);
      setVideoError(null);
      return () => URL.revokeObjectURL(url);
    } else {
      setVideoError("No video data available.");
    }
  }, [videoBlob]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(e => {
          console.error("Play failed:", e);
          setVideoError("Playback failed: " + e.message);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "00:00";
    const mins = Math.floor(timeInSeconds / 60);
    const secs = Math.floor(timeInSeconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Map highlights to timeline markers
  const markers = useMemo(() => {
    return highlights.map(h => {
      const [m, s] = h.timestamp.split(':').map(Number);
      const seconds = (m || 0) * 60 + (s || 0);
      return { seconds, type: h.type };
    });
  }, [highlights]);

  if (videoError) {
    return (
      <div className="w-full aspect-video bg-[#020617] rounded-xl flex items-center justify-center text-slate-500 border border-slate-800 p-6 text-center shadow-lg">
        <div>
          <AlertTriangle className="mx-auto mb-2 text-amber-500 opacity-80" />
          <p className="text-sm font-medium text-slate-400">{videoError}</p>
          <p className="text-xs text-slate-600 mt-2">The browser may have blocked the recording or the window was closed.</p>
        </div>
      </div>
    );
  }

  if (!videoUrl) {
    return (
      <div className="w-full aspect-video bg-[#020617] rounded-xl flex items-center justify-center text-slate-500 border border-slate-800 shadow-lg">
        <div className="text-center">
          <Loader2 className="mx-auto mb-2 animate-spin opacity-50" />
          <p className="text-sm">Loading video...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#020617] rounded-xl overflow-hidden shadow-2xl border border-slate-800 ring-1 ring-slate-900/50">
      {/* Viewer */}
      <div className="relative aspect-video bg-black group">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          onError={(e) => {
            console.error("Video error:", e);
            setVideoError("Error decoding video.");
          }}
          controls={true} // Enable native controls as backup/reliability
          playsInline
        />
        
        {/* Custom Overlay (Optional - visible only when native controls are hidden or if desired for styling) */}
        {!isPlaying && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer group-hover:bg-black/10 transition-colors pointer-events-none"
          >
            <div className="h-16 w-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center pointer-events-auto border border-white/20 transition-transform group-hover:scale-110" onClick={togglePlay}>
              <Play className="text-white fill-white ml-1 w-6 h-6" />
            </div>
          </div>
        )}
      </div>

      {/* Custom Controls Container - Keeping timeline visualization */}
      <div className="p-4 space-y-3 bg-[#020617] border-t border-slate-800">
        {/* Timeline with Highlights */}
        <div className="relative group/timeline py-2">
          {/* We rely on native controls for scrubbing mainly, but this visualizes AI markers */}
          <div className="w-full h-1 bg-slate-800 rounded-lg relative overflow-visible">
             <div 
                className="absolute top-0 left-0 h-full bg-[#237CF1] rounded-lg transition-all duration-200" 
                style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
             />
             {/* Markers */}
             {markers.map((m, i) => (
                <div 
                  key={i}
                  className={cn(
                    "absolute -top-1 w-2.5 h-2.5 rounded-full pointer-events-none transform -translate-x-1/2 z-10 shadow-sm border border-black/50 ring-2 ring-[#020617]",
                    m.type === 'positive' ? "bg-green-500" : "bg-amber-500"
                  )}
                  style={{ left: `${(m.seconds / (duration || 1)) * 100}%` }}
                  title={m.type === 'positive' ? 'Strength' : 'Improvement Area'}
                />
             ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-slate-400">
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-slate-500">
              <span className="text-slate-200 font-bold">{formatTime(currentTime)}</span>
              <span className="mx-1 opacity-50">/</span>
              <span>{formatTime(duration)}</span>
            </span>
          </div>
          
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 flex gap-4 items-center">
             <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Strength</div>
             <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> Note</div>
          </div>
        </div>
      </div>
    </div>
  );
}