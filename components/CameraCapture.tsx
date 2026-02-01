import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from './Button';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onCancel: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }, 
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError('');
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      // Browser security blocks camera on non-HTTPS (except localhost).
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        setError("Camera Access Error: The camera requires a secure HTTPS connection. If you are testing on mobile via IP, this will likely fail. Please use a secure tunnel (ngrok) or upload a file instead.");
      } else {
        setError("Could not access camera. Please deny/allow permissions again or try uploading a file.");
      }
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Match canvas size to video size
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
            onCapture(file);
            stopCamera();
          }
        }, 'image/jpeg', 0.95);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-slate-900 md:rounded-2xl overflow-hidden relative">
      {error ? (
        <div className="text-center p-6 bg-white rounded-lg mx-4 max-w-sm z-10">
          <p className="text-[#c02126] font-semibold mb-2">Camera Unavailable</p>
          <p className="text-slate-600 mb-6 text-sm leading-relaxed">{error}</p>
          <Button onClick={onCancel} variant="outline" fullWidth>Use File Upload</Button>
        </div>
      ) : (
        <>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover absolute inset-0"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center space-x-6 px-4 z-20">
            <Button onClick={onCancel} variant="secondary" className="bg-white/90 backdrop-blur-sm shadow-lg">
              Cancel
            </Button>
            <button 
              onClick={handleCapture}
              className="w-20 h-20 rounded-full bg-white border-4 border-[#c02126] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-red-300"
              aria-label="Take photo"
            >
              <div className="w-16 h-16 rounded-full bg-[#c02126]"></div>
            </button>
          </div>
        </>
      )}
    </div>
  );
};