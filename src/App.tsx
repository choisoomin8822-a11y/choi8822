/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { TimestampCanvas } from './components/TimestampCanvas';
import { ControlPanel } from './components/ControlPanel';
import { CameraModal } from './components/CameraModal';
import { TimestampSettings } from './types/timestamp';
import { PRESET_THEMES } from './constants/presets';
import { getCurrentDeviceLocation } from './utils/geo';
import { extractPhotoMetadata, formatDateTime } from './utils/exif';
import { downloadCanvas, renderTimestampOnCanvas } from './utils/canvas';
import {
  Upload,
  Camera,
  ImageIcon,
  CheckCircle2,
  Sparkles,
  Share2,
  AlertCircle,
  FileImage,
} from 'lucide-react';

export default function App() {
  // Format current local time as initial default
  const getInitialDateTime = () => {
    const now = new Date();
    return formatDateTime(now);
  };

  const initialDateTime = getInitialDateTime();

  // Timestamp settings state
  const [settings, setSettings] = useState<TimestampSettings>({
    dateText: initialDateTime.date,
    timeText: initialDateTime.time,
    locationText: '부산시, 남구, 대연동',
    memoText: '',
    showMemo: false,
    fontId: 'pretendard',
    fontSizeScale: 1.0,
    textColor: '#FFFFFF',
    shadowStyle: 'sample',
    iconType: 'pin-red',
    iconColor: '#FA3C3C',
    iconSizeScale: 1.0,
    position: 'bottom-right',
    customOffset: { x: 0.95, y: 0.95 },
    isCustomPosition: false,
    datePlacement: 'top',
    dateOffsetX: 0,
    dateOffsetY: 0,
    dateFormat: 'YYYY-MM-DD',
    timeFormat: 'HH:mm:ss',
    showDate: true,
    showTime: true,
    showLocation: true,
  });

  // Photo & Canvas state: Start empty (no default sample background photo)
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [imageFileName, setImageFileName] = useState<string>('photo.jpg');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'info' | 'success' } | null>(null);

  // Hidden file inputs
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mobileCameraInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (text: string, type: 'info' | 'success' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Helper to load an HTMLImageElement from a URL or ObjectURL
  const loadImageFromSource = useCallback((src: string, filename?: string) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImageElement(img);
      if (filename) setImageFileName(filename);
    };
    img.onerror = () => {
      showToast('이미지를 불러오는데 실패했습니다.', 'info');
    };
    img.src = src;
  }, []);

  // Handle uploaded file (detect EXIF date and GPS automatically)
  const processImageFile = async (file: File | Blob, originalFilename?: string) => {
    const objectUrl = URL.createObjectURL(file);
    loadImageFromSource(objectUrl, originalFilename || 'timestamp_photo.jpg');

    showToast('사진을 불러왔습니다. 메타데이터를 분석 중...', 'info');

    // 1. Try to extract EXIF
    try {
      const metadata = await extractPhotoMetadata(file);

      const updates: Partial<TimestampSettings> = {};

      if (metadata.hasExifDate && metadata.dateStr && metadata.timeStr) {
        updates.dateText = metadata.dateStr;
        updates.timeText = metadata.timeStr;
      } else {
        // Fallback to current device time
        const now = new Date();
        const { date, time } = formatDateTime(now);
        updates.dateText = date;
        updates.timeText = time;
      }

      if (metadata.hasExifGps && metadata.locationStr) {
        updates.locationText = metadata.locationStr;
        showToast('사진의 EXIF 위치 및 날짜를 자동으로 적용했습니다.', 'success');
      } else {
        // No EXIF GPS -> automatically attempt device GPS
        try {
          const deviceLoc = await getCurrentDeviceLocation();
          if (deviceLoc?.address) {
            updates.locationText = deviceLoc.address;
            showToast('현재 위치(GPS) 및 날짜를 자동으로 적용했습니다.', 'success');
          }
        } catch {
          // Keep current or sample location if GPS denied
        }
      }

      setSettings((prev) => ({ ...prev, ...updates }));
    } catch (e) {
      console.warn('Metadata detection error:', e);
    }
  };

  // File input change handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file, file.name);
    }
    // reset input
    e.target.value = '';
  };

  // Location manual refresh handler
  const handleDetectLocation = async () => {
    setIsDetectingLocation(true);
    try {
      const loc = await getCurrentDeviceLocation();
      if (loc && loc.address) {
        setSettings((prev) => ({
          ...prev,
          locationText: loc.address,
        }));
        showToast(`위치가 감지되었습니다: ${loc.address}`, 'success');
      }
    } catch (err: any) {
      showToast('위치 감지 실패: 브라우저 위치 접근 권한을 확인해주세요.', 'info');
    } finally {
      setIsDetectingLocation(false);
    }
  };

  // Time sync with current clock
  const handleSyncCurrentTime = () => {
    const now = new Date();
    const { date, time } = formatDateTime(now);
    setSettings((prev) => ({
      ...prev,
      dateText: date,
      timeText: time,
    }));
    showToast('현재 날짜와 시간으로 동기화되었습니다.', 'success');
  };

  // Save / Export High-Res Canvas
  const handleSave = (format: 'jpeg' | 'png' = 'jpeg') => {
    if (!imageElement) return;

    // Create high-res export canvas
    const exportCanvas = document.createElement('canvas');
    renderTimestampOnCanvas(exportCanvas, {
      image: imageElement,
      settings,
    });

    const cleanDate = settings.dateText.replace(/[^0-9]/g, '');
    const cleanTime = settings.timeText.replace(/[^0-9]/g, '');
    const ext = format === 'jpeg' ? 'jpg' : 'png';
    const filename = `timestamp_${cleanDate}_${cleanTime}.${ext}`;

    downloadCanvas(exportCanvas, filename, format);
    showToast('고화질 타임스탬프 사진이 저장되었습니다!', 'success');
  };

  // Mobile Web Share if supported
  const handleShare = async () => {
    if (!imageElement || !navigator.share) return;
    try {
      const exportCanvas = document.createElement('canvas');
      renderTimestampOnCanvas(exportCanvas, {
        image: imageElement,
        settings,
      });

      exportCanvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], 'timestamp_photo.jpg', { type: 'image/jpeg' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: '타임스탬프 스튜디오',
            text: `${settings.dateText} ${settings.timeText} | ${settings.locationText}`,
            files: [file],
          });
        } else {
          handleSave('jpeg');
        }
      }, 'image/jpeg', 0.95);
    } catch (err) {
      console.log('Share canceled or not supported:', err);
    }
  };

  // Drag and drop image onto window
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processImageFile(file, file.name);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans"
    >
      {/* Hidden inputs for file upload & direct mobile environment camera */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={mobileCameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Top Header */}
      <Header
        onOpenCamera={() => setIsCameraOpen(true)}
        onUploadClick={() => fileInputRef.current?.click()}
        onSaveClick={() => handleSave('jpeg')}
        hasImage={!!imageElement}
      />

      {/* Main Studio Workspace: 2-column on desktop, stacked on mobile */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
        {/* Left Column: Canvas Preview Viewport (lg:col-span-8) */}
        <div className="lg:col-span-8 flex flex-col bg-slate-950 relative min-h-[50vh] lg:min-h-0 border-b lg:border-b-0 border-slate-800">
          {imageElement ? (
            <TimestampCanvas
              imageElement={imageElement}
              settings={settings}
              onUpdatePosition={(newOffset) => {
                setSettings((prev) => ({
                  ...prev,
                  customOffset: newOffset,
                  isCustomPosition: true,
                }));
              }}
              onResetPosition={() => {
                setSettings((prev) => ({
                  ...prev,
                  isCustomPosition: false,
                  position: 'bottom-right',
                }));
              }}
              onUpdateDateOffset={(offset) => {
                setSettings((prev) => ({
                  ...prev,
                  dateOffsetX: offset.x,
                  dateOffsetY: offset.y,
                }));
              }}
              onResetDateOffset={() => {
                setSettings((prev) => ({
                  ...prev,
                  dateOffsetX: 0,
                  dateOffsetY: 0,
                }));
              }}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="p-4 rounded-full bg-slate-900 border border-slate-800 mb-4">
                <FileImage className="h-10 w-10 text-rose-500" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">사진을 업로드하거나 촬영하세요</h2>
              <p className="text-sm text-slate-400 max-w-md mb-6">
                사진을 불러오면 촬영 일시와 위치가 자동으로 감지되며, 원하는 폰트와 스타일로 감성적인 타임스탬프가 완성됩니다.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-semibold text-sm transition shadow-md shadow-rose-600/20 active:scale-95 cursor-pointer"
                >
                  <Upload className="h-4 w-4" />
                  <span>사진 파일 첨부</span>
                </button>
                <button
                  onClick={() => {
                    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                      navigator.userAgent
                    );
                    if (isMobile && mobileCameraInputRef.current) {
                      mobileCameraInputRef.current.click();
                    } else {
                      setIsCameraOpen(true);
                    }
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold text-sm transition border border-slate-700 active:scale-95 cursor-pointer"
                >
                  <Camera className="h-4 w-4 text-amber-400" />
                  <span>카메라로 촬영</span>
                </button>
              </div>
            </div>
          )}

          {/* Quick share button overlay for mobile */}
          {imageElement && typeof navigator !== 'undefined' && 'share' in navigator && (
            <div className="absolute top-4 right-4 z-10 lg:hidden">
              <button
                onClick={handleShare}
                className="p-2.5 rounded-full bg-slate-900/90 text-white border border-slate-700 shadow-lg backdrop-blur-md cursor-pointer"
                title="공유하기"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Full Control & Customization Panel (lg:col-span-4) */}
        <div className="lg:col-span-4 flex flex-col h-full bg-slate-900 overflow-hidden">
          <ControlPanel
            settings={settings}
            onUpdateSettings={(newSettings) =>
              setSettings((prev) => ({ ...prev, ...newSettings }))
            }
            onDetectLocation={handleDetectLocation}
            isDetectingLocation={isDetectingLocation}
            onSyncCurrentTime={handleSyncCurrentTime}
            onSave={handleSave}
            onUploadClick={() => fileInputRef.current?.click()}
            onCameraClick={() => {
              const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                navigator.userAgent
              );
              if (isMobile && mobileCameraInputRef.current) {
                mobileCameraInputRef.current.click();
              } else {
                setIsCameraOpen(true);
              }
            }}
            hasImage={!!imageElement}
          />
        </div>
      </main>

      {/* Camera Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(blob) => processImageFile(blob, 'captured_photo.jpg')}
        settings={settings}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/95 border border-slate-700/80 text-white text-xs sm:text-sm font-medium shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          ) : (
            <Sparkles className="h-4 w-4 text-rose-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
}
