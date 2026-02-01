import React, { useState } from 'react';
import { Monitor, Mic, Plus, ArrowRight, Loader2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/index';
import { cn } from '../../lib/utils';

interface RecordingConsentModalProps {
  onConfirm: () => Promise<void>;
  isOpen: boolean;
  error?: string | null;
}

export function RecordingConsentModal({ onConfirm, isOpen, error }: RecordingConsentModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />

      {/* Modal Card */}
      <div className="relative w-full max-w-[500px] bg-white rounded-2xl shadow-2xl p-8 animate-slide-up">
        
        {/* Header Icons */}
        <div className="flex justify-center items-center gap-4 mb-6">
          <div className="h-16 w-16 bg-[#237CF1]/10 rounded-2xl flex items-center justify-center">
            <Monitor className="h-8 w-8 text-[#237CF1]" />
          </div>
          <Plus className="text-slate-300" />
          <div className="h-16 w-16 bg-[#237CF1]/10 rounded-2xl flex items-center justify-center">
            <Mic className="h-8 w-8 text-[#237CF1]" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Recording Notice</h2>
          <p className="text-slate-500 text-sm">To provide you with detailed feedback on your work</p>
        </div>

        {/* Explanation Box */}
        <div className="bg-slate-50 rounded-xl p-5 mb-8 border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">We need to record the following:</h3>
          
          <div className="space-y-5">
            <div className="flex gap-4">
              <div className="h-8 w-8 rounded-full bg-[#237CF1]/10 flex items-center justify-center shrink-0">
                <Monitor size={14} className="text-[#237CF1]" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Screen Recording</p>
                <p className="text-xs text-slate-500 mt-0.5">Your screen will be recorded during the coding task</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="h-8 w-8 rounded-full bg-[#237CF1]/10 flex items-center justify-center shrink-0">
                <Mic size={14} className="text-[#237CF1]" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Voice Recording</p>
                <p className="text-xs text-slate-500 mt-0.5">Voice conversations will be recorded and transcribed</p>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-200 my-4" />
          
          <div className="flex items-center gap-2 justify-center">
            <ShieldCheck size={12} className="text-slate-400" />
            <p className="text-[10px] text-slate-400">
              Your recordings are private and only used for assessment.
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 border border-red-100 animate-fade-in">
            <AlertTriangle size={16} className="shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Action */}
        <div className="space-y-3">
          <Button 
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn(
              "w-full h-12 rounded-full text-base font-semibold shadow-lg shadow-blue-500/20 transition-all",
              "bg-[#237CF1] hover:bg-blue-600 hover:scale-[1.02] active:scale-[0.98]",
              error && "bg-slate-900 hover:bg-slate-800 shadow-slate-900/20"
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Starting Recording...
              </>
            ) : (
              <>
                {error ? "Try Again" : "Accept & Continue"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
          
          <p className="text-[11px] text-center text-slate-400 font-medium">
            You will be prompted to share your screen next
          </p>
        </div>

      </div>
    </div>
  );
}