import React, { useRef, useEffect, useState, useCallback } from 'react';
import { TimestampSettings } from '../types/timestamp';
import { renderTimestampOnCanvas, getCustomMarkerImage } from '../utils/canvas';
import { Move, RotateCcw, Maximize2, ZoomIn, ZoomOut, Calendar } from 'lucide-react';

interface TimestampCanvasProps {
  imageElement: HTMLImageElement | null;
  settings: TimestampSettings;
  onUpdatePosition: (newOffset: { x: number; y: number }) => void;
  onResetPosition: () => void;
  onUpdateDateOffset: (offset: { x: number; y: number }) => void;
  onResetDateOffset: () => void;
}

export const TimestampCanvas: React.FC<TimestampCanvasProps> = ({
  imageElement,
  settings,
  onUpdatePosition,
  onResetPosition,
  onUpdateDateOffset,
  onResetDateOffset,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<'all' | 'date'>('all');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [dragStartPoint, setDragStartPoint] = useState<{ clientX: number; clientY: number } | null>(null);
  const [initialDateOffset, setInitialDateOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Redraw canvas whenever image or settings change
  const redraw = useCallback(() => {
    if (!canvasRef.current || !imageElement) return;
    renderTimestampOnCanvas(canvasRef.current, {
      image: imageElement,
      settings,
    });
  }, [imageElement, settings]);

  useEffect(() => {
    getCustomMarkerImage(redraw);
    redraw();
  }, [redraw]);

  // Handle Dragging overlay position directly on the photo
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    setIsDragging(true);
    setDragStartPoint({ clientX, clientY });
    setInitialDateOffset({ x: settings.dateOffsetX || 0, y: settings.dateOffsetY || 0 });

    if (dragMode === 'all') {
      const normX = Math.max(0.05, Math.min(0.95, (clientX - rect.left) / rect.width));
      const normY = Math.max(0.05, Math.min(0.95, (clientY - rect.top) / rect.height));
      onUpdatePosition({ x: normX, y: normY });
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging || !canvasRef.current || !dragStartPoint) return;
    const rect = canvasRef.current.getBoundingClientRect();

    if (dragMode === 'all') {
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      const normX = Math.max(0.05, Math.min(0.95, clientX / rect.width));
      const normY = Math.max(0.05, Math.min(0.95, clientY / rect.height));
      onUpdatePosition({ x: normX, y: normY });
    } else {
      // Date only drag mode: compute pixel delta
      const deltaX = Math.round((e.clientX - dragStartPoint.clientX) * (600 / rect.width));
      const deltaY = Math.round((e.clientY - dragStartPoint.clientY) * (600 / rect.height));
      const newX = Math.max(-150, Math.min(150, initialDateOffset.x + deltaX));
      const newY = Math.max(-150, Math.min(150, initialDateOffset.y + deltaY));
      onUpdateDateOffset({ x: newX, y: newY });
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    setDragStartPoint(null);
  };

  if (!imageElement) {
    return null;
  }

  const naturalW = imageElement.naturalWidth || imageElement.width;
  const naturalH = imageElement.naturalHeight || imageElement.height;
  const hasCustomDateOffset = (settings.dateOffsetX || 0) !== 0 || (settings.dateOffsetY || 0) !== 0;

  return (
    <div className="flex flex-col w-full h-full">
      {/* Top toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <span className="font-medium text-slate-200">
            {naturalW} × {naturalH} px
          </span>
          <span>·</span>
          {/* Drag Mode Selector */}
          <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setDragMode('all')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer ${
                dragMode === 'all'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="전체 스탬프 위치 드래그"
            >
              <Move className="h-3 w-3 text-rose-400" />
              <span>전체 이동</span>
            </button>
            <button
              onClick={() => setDragMode('date')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer ${
                dragMode === 'date'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="날짜 위치만 따로 드래그하여 조절"
            >
              <Calendar className="h-3 w-3 text-amber-300" />
              <span>날짜만 이동</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {dragMode === 'date' && hasCustomDateOffset && (
            <button
              onClick={onResetDateOffset}
              className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="날짜 오프셋 초기화"
            >
              <RotateCcw className="h-3 w-3" />
              <span>날짜 초기화</span>
            </button>
          )}

          {settings.isCustomPosition && dragMode === 'all' && (
            <button
              onClick={onResetPosition}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
              title="원래 위치(우측 하단)로 초기화"
            >
              <RotateCcw className="h-3 w-3" />
              <span>위치 초기화</span>
            </button>
          )}

          <div className="flex items-center gap-1 bg-slate-800/80 rounded p-0.5">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.75, Number((z - 0.25).toFixed(2))))}
              className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
              title="축소"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="px-1 text-[11px] font-mono text-slate-300 w-10 text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(2, Number((z + 0.25).toFixed(2))))}
              className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
              title="확대"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
              title="100% 맞춤"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div
        ref={containerRef}
        className="relative flex-1 bg-slate-950 flex items-center justify-center p-4 sm:p-6 overflow-auto select-none"
      >
        <div
          className="relative inline-block transition-transform duration-100 ease-out shadow-2xl rounded-lg overflow-hidden border border-slate-800"
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'center center',
          }}
        >
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="block max-w-full max-h-[68vh] object-contain cursor-crosshair touch-none"
          />

          {isDragging && (
            <div className="absolute top-3 left-3 px-3 py-1.5 bg-black/85 backdrop-blur-md rounded-md text-xs text-white border border-white/20 pointer-events-none flex items-center gap-2 shadow-lg">
              {dragMode === 'date' ? (
                <>
                  <Calendar className="h-3.5 w-3.5 text-amber-400 animate-bounce" />
                  <span>날짜 위치 이동 중 ({settings.dateOffsetX || 0}px, {settings.dateOffsetY || 0}px)</span>
                </>
              ) : (
                <>
                  <Move className="h-3.5 w-3.5 text-rose-400 animate-spin" />
                  <span>스탬프 전체 이동 중...</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
