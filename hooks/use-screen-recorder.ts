import { useState, useRef, useCallback, useEffect } from 'react';
import { RecordingStatus, ScreenRecorderHook } from '../types/index';

export interface ExtendedScreenRecorderHook extends ScreenRecorderHook {
  videoBlob: Blob | null;
}

function getSupportedMimeType() {
  const types = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=h264,opus',
    'video/webm',
    'video/mp4'
  ];
  for (const t of types) {
    if (MediaRecorder.isTypeSupported(t)) return t;
  }
  return ''; // Let browser choose default
}

export function useScreenRecorder(): ExtendedScreenRecorderHook {
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [screenshots, setScreenshots] = useState<Blob[]>([]);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const screenshotIntervalRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const mimeTypeRef = useRef<string>('');

  // Setup the hidden video element for capturing frames
  useEffect(() => {
    const video = document.createElement('video');
    video.autoplay = true;
    video.muted = true; // Local playback muted
    video.playsInline = true;
    videoRef.current = video;
    
    return () => {
      video.srcObject = null;
      videoRef.current = null;
    };
  }, []);

  const captureScreenshot = useCallback(() => {
    const video = videoRef.current;
    if (!video || !mediaStreamRef.current) return;
    
    if (video.readyState < 2) return; // HAVE_CURRENT_DATA

    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            setScreenshots(prev => [...prev, blob]);
          }
          canvas.remove();
        }, 'image/jpeg', 0.6);
      }
    } catch (e) {
      console.error("Screenshot capture failed", e);
    }
  }, []);

  const cleanup = useCallback(() => {
    if (screenshotIntervalRef.current) {
      window.clearInterval(screenshotIntervalRef.current);
      screenshotIntervalRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startRecording = useCallback(async (): Promise<boolean> => {
    try {
      cleanup();
      setError(null);
      setScreenshots([]);
      setVideoBlob(null);
      chunksRef.current = [];

      // 1. Get Screen Stream
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 15 }
        },
        audio: true // System audio
      });

      // 2. Get Mic Stream
      let micStream: MediaStream | null = null;
      try {
        micStream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
      } catch (micErr) {
        console.warn("Microphone access denied:", micErr);
      }

      // 3. Combine Tracks
      const tracks = [
        ...screenStream.getVideoTracks(),
        ...screenStream.getAudioTracks(),
        ...(micStream ? micStream.getAudioTracks() : [])
      ];

      const combinedStream = new MediaStream(tracks);
      mediaStreamRef.current = combinedStream;

      // Attach to hidden video for screenshots
      if (videoRef.current) {
        videoRef.current.srcObject = combinedStream;
        videoRef.current.play().catch(e => console.warn("Hidden video play failed", e));
      }

      // Handle stream stop by user
      screenStream.getVideoTracks()[0].onended = () => {
        // If user clicks "Stop sharing", we need to stop the recorder gracefully
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
        setStatus('interrupted');
        // Delay cleanup slightly to allow recorder onstop to fire
        setTimeout(cleanup, 100);
      };

      // 4. Start Recorder with best MIME type
      const mimeType = getSupportedMimeType();
      mimeTypeRef.current = mimeType;
      console.log("Starting recording with MIME type:", mimeType || "default");

      const options = mimeType ? { mimeType } : undefined;
      const recorder = new MediaRecorder(combinedStream, options);

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const type = mimeTypeRef.current || 'video/webm';
        const fullBlob = new Blob(chunksRef.current, { type });
        console.log(`Recording stopped. Blob size: ${fullBlob.size} bytes, Type: ${fullBlob.type}`);
        setVideoBlob(fullBlob);
      };

      recorder.start(1000); // 1s chunks
      setStatus('recording');

      // Schedule screenshots
      screenshotIntervalRef.current = window.setInterval(captureScreenshot, 5000);
      
      return true;

    } catch (err: any) {
      console.error("Screen recording error:", err);
      cleanup();
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setStatus('denied');
        setError("Permission to record was denied.");
      } else {
        setStatus('error');
        setError("Failed to start recording.");
      }
      return false;
    }
  }, [captureScreenshot, cleanup]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
    }
    // Wait for the stop event to process before killing streams
    setTimeout(() => {
        cleanup();
        setStatus('idle');
    }, 200);
  }, [cleanup]);

  const resumeRecording = useCallback(async () => {
    return startRecording();
  }, [startRecording]);

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  return {
    status,
    error,
    startRecording,
    stopRecording,
    resumeRecording,
    screenshots,
    videoBlob
  };
}