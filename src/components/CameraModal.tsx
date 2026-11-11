import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, X, AlertCircle } from 'lucide-react';
import { TimestampSettings } from '../types/timestamp';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (blob: Blob) => void;
  settings: TimestampSettings;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  settings,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isShutterActive, setIsShutterActive] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState(settings.timeText);

  // Live clock tick in camera mode
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      setCurrentTimeStr(`${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Start media stream
  useEffect(() => {
    if (!isOpen) {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
      return;
    }

    let isMounted = true;
    setCameraError(null);

    async function startCamera() {
      try {
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }

        const newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });

        if (!isMounted) {
          newStream.getTracks().forEach((track) => track.stop());
          return;
        }

        setStream(newStream);
        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
        }
      } catch (err: any) {
        console.error('Camera access error:', err);
        if (isMounted) {
          setCameraError(
            err.name === 'NotAllowedError'
              ? '카메라 권한이 차단되었습니다. 브라우저 설정에서 카메라 권한을 허용해주세요.'
              : '카메라 장치를 시작할 수 없습니다. 아래 파일 첨부 또는 모바일 기본 카메라를 사용해주세요.'
          );
        }
      }
    }

    startCamera();

    return () => {
      isMounted = false;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, facingMode]);

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    
    // Trigger shutter flash
    setIsShutterActive(true);
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(40);
      } catch {}
    }
    setTimeout(() => setIsShutterActive(false), 200);

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (facingMode === 'user') {
      // Mirror front camera
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          onCapture(blob);
          onClose();
        }
      },
      'image/jpeg',
      0.95
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-4xl h-[88vh] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800/80 bg-slate-950/70 z-10">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
            <h3 className="text-sm font-semibold text-white">실시간 타임스탬프 카메라</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFacingMode}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
              title="전면/후면 카메라 전환"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
              title="닫기"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Viewfinder Area */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
          {cameraError ? (
            <div className="flex flex-col items-center justify-center p-6 text-center max-w-md">
              <AlertCircle className="h-12 w-12 text-rose-500 mb-3" />
              <p className="text-slate-200 font-medium mb-2">{cameraError}</p>
              <p className="text-xs text-slate-400 mb-6">
                스마트폰 브라우저에서는 아래 '기본 카메라 앱으로 촬영' 버튼을 눌러 촬영할 수도 있습니다.
              </p>
              <label className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-medium text-sm transition cursor-pointer">
                <Camera className="h-4 w-4" />
                <span>스마트폰 카메라로 촬영</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onCapture(file);
                      onClose();
                    }
                  }}
                />
              </label>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-contain ${
                  facingMode === 'user' ? 'scale-x-[-1]' : ''
                }`}
              />

              {/* Shutter flash effect */}
              {isShutterActive && (
                <div className="absolute inset-0 bg-white opacity-80 pointer-events-none transition-opacity duration-150" />
              )}

              {/* Live Timestamp Preview Overlay */}
              <div className="absolute bottom-6 right-6 pointer-events-none text-right select-none pr-2 pb-2">
                {settings.showDate && (
                  <div
                    className={`text-sm sm:text-base font-semibold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]`}
                  >
                    {settings.dateText}
                  </div>
                )}
                {settings.showTime && (
                  <div
                    className={`text-3xl sm:text-4xl font-bold text-white tracking-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]`}
                  >
                    {currentTimeStr}
                  </div>
                )}
                {settings.showLocation && (
                  <div className="flex items-center justify-end gap-1.5 text-xs sm:text-sm font-medium text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mt-0.5">
                    {settings.iconType !== 'none' && (
                      <img
                        src="/assets/location_marker.png"
                        alt="위치 마크"
                        className="h-3.5 sm:h-4 w-auto object-contain inline-block shrink-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                      />
                    )}
                    <span>{settings.locationText || '위치 정보 확인 중...'}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Bottom Shutter Controls */}
        <div className="flex items-center justify-center p-5 bg-slate-950 border-t border-slate-800/80">
          <button
            onClick={handleCapture}
            disabled={!!cameraError}
            className={`group relative flex items-center justify-center w-16 h-16 rounded-full border-4 border-white/80 p-1 transition active:scale-95 cursor-pointer ${
              cameraError ? 'opacity-40 cursor-not-allowed' : 'hover:border-white'
            }`}
          >
            <div className="w-full h-full rounded-full bg-rose-500 group-hover:bg-rose-600 transition shadow-lg" />
          </button>
        </div>
      </div>
    </div>
  );
};
