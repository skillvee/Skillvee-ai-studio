import { useState, useEffect, useCallback } from 'react';
import { VideoEvaluationState, Message } from '../types/index';
import { evaluateSession } from '../lib/ai/video-evaluation';

interface UseVideoEvaluationProps {
  shouldStart: boolean;
  screenshots: Blob[];
  chatHistory: Message[];
  videoBlob: Blob | null;
}

export function useVideoEvaluation({ shouldStart, screenshots, chatHistory, videoBlob }: UseVideoEvaluationProps) {
  const [state, setState] = useState<VideoEvaluationState>({
    status: 'PENDING',
    result: null,
    error: null
  });

  useEffect(() => {
    if (shouldStart && state.status === 'PENDING') {
      startEvaluation();
    }
  }, [shouldStart, state.status]);

  const startEvaluation = useCallback(async () => {
    setState(prev => ({ ...prev, status: 'PROCESSING' }));
    
    try {
      const result = await evaluateSession(screenshots, chatHistory, videoBlob);
      
      setState({
        status: 'COMPLETED',
        result,
        error: null
      });
    } catch (e) {
      console.error("Evaluation failed", e);
      setState(prev => ({ 
        ...prev, 
        status: 'FAILED', 
        error: "Failed to process video evaluation." 
      }));
    }
  }, [screenshots, chatHistory, videoBlob]);

  return state;
}