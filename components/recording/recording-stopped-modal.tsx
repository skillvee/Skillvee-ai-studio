import React, { useState } from 'react';
import { AlertTriangle, Loader2, Monitor } from 'lucide-react';
import { Button } from '../ui/index';
import { cn } from '../../lib/utils';

interface RecordingStoppedModalProps {
  onResume: () => Promise<void>;
  isOpen: boolean;
}

export function RecordingStoppedModal({ onResume, isOpen }: RecordingStoppedModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleResume = async () => {
    setIsLoading(true);
    await onResume();
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop - darker and non-dismissable */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-lg" />

      {/* Modal Card */}
      <div className="relative w-full max-w-[420px] bg-white rounded-2xl shadow-2xl p-8 animate-pulse-slow">
        
        {/* Header Icon */}
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 bg-red-500/10 rounded-3xl flex items-center justify-center shadow-inner">
            <AlertTriangle className="h-10 w-10 text-red-500" strokeWidth={2.5} />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Screen Recording Stopped</h2>
          <p className="text-slate-500 text-sm">Your screen recording has been interrupted</p>
        </div>

        {/* Message Box */}
        <div className="bg-slate-50 rounded-xl p-5 mb-8 border border-slate-200 text-center">
          <p className="text-sm font-semibold text-slate-800 mb-2">
            To continue with the assessment, you need to share your screen again.
          </p>
          <p className="text-xs text-slate-500 leading-relaxed">
            Screen recording is required to capture your work process and provide you with detailed feedback.
          </p>
        </div>

        {/* Action */}
        <div className="space-y-3">
          <Button 
            onClick={handleResume}
            disabled={isLoading}
            className={cn(
              "w-full h-12 rounded-full text-base font-semibold shadow-lg shadow-blue-500/20 transition-all",
              "bg-[#237CF1] hover:bg-blue-600"
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Requesting Permission...
              </>
            ) : (
              <>
                <Monitor className="mr-2 h-5 w-5" />
                Resume Screen Sharing
              </>
            )}
          </Button>
          
          <p className="text-[11px] text-center text-red-400 font-medium">
            You cannot continue without screen sharing enabled
          </p>
        </div>

      </div>
    </div>
  );
}