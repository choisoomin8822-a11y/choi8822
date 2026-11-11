import React from 'react';
import { Camera, Download, Sparkles, Image as ImageIcon } from 'lucide-react';

interface HeaderProps {
  onOpenCamera: () => void;
  onUploadClick: () => void;
  onSaveClick: () => void;
  hasImage: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCamera,
  onUploadClick,
  onSaveClick,
  hasImage,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-rose-500 to-amber-500 text-white shadow-md shadow-rose-500/20">
            <Camera className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
            타임스탬프 스튜디오
          </span>
        </div>

        {/* Zone 2: Navigation Links / Fast Switches */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={onUploadClick}
            className="flex items-center gap-2 hover:text-white transition-colors whitespace-nowrap cursor-pointer"
          >
            <ImageIcon className="h-4 w-4 text-slate-400" />
            <span>사진 불러오기</span>
          </button>
          <button
            onClick={onOpenCamera}
            className="flex items-center gap-2 hover:text-white transition-colors whitespace-nowrap cursor-pointer"
          >
            <Camera className="h-4 w-4 text-slate-400" />
            <span>카메라 촬영</span>
          </button>
          <span className="text-xs text-slate-500">·</span>
          <span className="text-xs text-slate-400">자동 날짜 & 위치 감지 지원</span>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onSaveClick}
            disabled={!hasImage}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all whitespace-nowrap shrink-0 shadow-sm ${
              hasImage
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white hover:opacity-95 shadow-rose-500/25 active:scale-[0.98] cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Download className="h-4 w-4" />
            <span>사진 저장하기</span>
          </button>
        </div>
      </div>
    </header>
  );
};
