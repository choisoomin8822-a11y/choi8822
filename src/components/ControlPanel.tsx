import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Type,
  Palette,
  Sliders,
  Sparkles,
  RefreshCw,
  LocateFixed,
  Download,
  Camera,
  Upload,
  Check,
  Tag,
  AlignRight,
  AlignLeft,
  AlignCenter,
  Maximize,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import {
  TimestampSettings,
  FontStyleId,
  PositionPreset,
  ShadowStyleId,
  DateFormat,
  TimeFormat,
  IconType,
} from '../types/timestamp';
import { FONT_OPTIONS, SHADOW_OPTIONS, PRESET_THEMES } from '../constants/presets';
import { POPULAR_LOCATIONS } from '../utils/geo';

interface ControlPanelProps {
  settings: TimestampSettings;
  onUpdateSettings: (newSettings: Partial<TimestampSettings>) => void;
  onDetectLocation: () => Promise<void>;
  isDetectingLocation: boolean;
  onSyncCurrentTime: () => void;
  onSave: (format: 'jpeg' | 'png') => void;
  onUploadClick: () => void;
  onCameraClick: () => void;
  hasImage: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  settings,
  onUpdateSettings,
  onDetectLocation,
  isDetectingLocation,
  onSyncCurrentTime,
  onSave,
  onUploadClick,
  onCameraClick,
  hasImage,
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'presets'>('content');
  const [saveFormat, setSaveFormat] = useState<'jpeg' | 'png'>('jpeg');

  const COLOR_PALETTE = [
    { label: '화이트 (기본)', value: '#FFFFFF' },
    { label: '아이보리', value: '#FEF3C7' },
    { label: '레몬 옐로우', value: '#FDE047' },
    { label: '네온 시안', value: '#38BDF8' },
    { label: '소프트 로즈', value: '#FDA4AF' },
    { label: '앰버 오렌지', value: '#F59E0B' },
    { label: '에메랄드', value: '#34D399' },
    { label: '다크 차콜', value: '#0F172A' },
  ];

  const ICON_OPTIONS: { id: IconType; label: string; icon?: string; isRing?: boolean }[] = [
    { id: 'pin-red', label: '지정 마크 (기본)', isRing: true },
    { id: 'target-red', label: '타겟 과녁', icon: '🎯' },
    { id: 'clock', label: '시계', icon: '⏱️' },
    { id: 'check', label: '체크 인증', icon: '✅' },
    { id: 'camera', label: '카메라', icon: '📷' },
    { id: 'building', label: '빌딩/회사', icon: '🏢' },
    { id: 'sparkle', label: '반짝임', icon: '✨' },
    { id: 'none', label: '아이콘 없음', icon: '✕' },
  ];

  const POSITION_OPTIONS: { id: PositionPreset; label: string; icon: any }[] = [
    { id: 'bottom-right', label: '우측 하단 (예시)', icon: AlignRight },
    { id: 'bottom-left', label: '좌측 하단', icon: AlignLeft },
    { id: 'top-right', label: '우측 상단', icon: AlignRight },
    { id: 'top-left', label: '좌측 상단', icon: AlignLeft },
    { id: 'center', label: '중앙', icon: AlignCenter },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800 text-slate-100 overflow-hidden">
      {/* Photo Action Bar at the top */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            사진 소스 선택
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onUploadClick}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg border border-slate-700/80 transition cursor-pointer"
          >
            <Upload className="h-4 w-4 text-rose-400" />
            <span>사진 파일 첨부</span>
          </button>
          <button
            onClick={onCameraClick}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg border border-slate-700/80 transition cursor-pointer"
          >
            <Camera className="h-4 w-4 text-amber-400" />
            <span>카메라로 촬영</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/30 p-1">
        <button
          onClick={() => setActiveTab('content')}
          className={`flex-1 py-2 text-xs font-semibold rounded-md transition cursor-pointer ${
            activeTab === 'content'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          내용 수정
        </button>
        <button
          onClick={() => setActiveTab('style')}
          className={`flex-1 py-2 text-xs font-semibold rounded-md transition cursor-pointer ${
            activeTab === 'style'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          글자체 & 스타일
        </button>
        <button
          onClick={() => setActiveTab('presets')}
          className={`flex-1 py-2 text-xs font-semibold rounded-md transition cursor-pointer ${
            activeTab === 'presets'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          테마 프리셋
        </button>
      </div>

      {/* Tab Contents - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* TAB 1: CONTENT EDIT */}
        {activeTab === 'content' && (
          <div className="space-y-4">
            {/* 1. Date Edit */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-300">
                  <Calendar className="h-3.5 w-3.5 text-rose-400" />
                  <span>날짜 표시 (자동 감지)</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showDateToggle"
                    checked={settings.showDate}
                    onChange={(e) => onUpdateSettings({ showDate: e.target.checked })}
                    className="rounded bg-slate-800 border-slate-700 text-rose-500 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="showDateToggle" className="text-xs text-slate-400 cursor-pointer">
                    표시
                  </label>
                </div>
              </div>

              {settings.showDate && (
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={settings.dateText}
                    onChange={(e) => onUpdateSettings({ dateText: e.target.value })}
                    placeholder="2026-08-14"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span className="shrink-0">포맷:</span>
                    <button
                      onClick={() => {
                        const now = new Date();
                        const pad = (n: number) => String(n).padStart(2, '0');
                        onUpdateSettings({
                          dateText: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
                        });
                      }}
                      className="hover:text-rose-400 cursor-pointer"
                    >
                      YYYY-MM-DD
                    </button>
                    <span>·</span>
                    <button
                      onClick={() => {
                        const now = new Date();
                        const pad = (n: number) => String(n).padStart(2, '0');
                        onUpdateSettings({
                          dateText: `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())}`,
                        });
                      }}
                      className="hover:text-rose-400 cursor-pointer"
                    >
                      YYYY.MM.DD
                    </button>
                    <span>·</span>
                    <button
                      onClick={() => {
                        const now = new Date();
                        onUpdateSettings({
                          dateText: `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일`,
                        });
                      }}
                      className="hover:text-rose-400 cursor-pointer"
                    >
                      한국어
                    </button>
                  </div>

                  {/* Date Position Controls */}
                  <div className="pt-2 mt-2 border-t border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-300">날짜 배치 위치</span>
                      {((settings.datePlacement && settings.datePlacement !== 'top') ||
                        settings.dateOffsetX !== 0 ||
                        settings.dateOffsetY !== 0) && (
                        <button
                          onClick={() =>
                            onUpdateSettings({
                              datePlacement: 'top',
                              dateOffsetX: 0,
                              dateOffsetY: 0,
                            })
                          }
                          className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="h-2.5 w-2.5" />
                          <span>날짜 위치 초기화</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { id: 'top', label: '시간 위 (기본)' },
                        { id: 'bottom', label: '시간 아래' },
                        { id: 'below-location', label: '맨 아래 (위치 밑)' },
                      ].map((p) => (
                        <button
                          key={p.id}
                          onClick={() => onUpdateSettings({ datePlacement: p.id as any })}
                          className={`py-1.5 px-1 rounded-md text-[11px] font-medium border transition cursor-pointer text-center ${
                            (settings.datePlacement || 'top') === p.id
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>

                    {/* Fine-tuning offset sliders */}
                    <div className="space-y-2 pt-1 bg-slate-950/40 p-2 rounded-lg border border-slate-800/60">
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span>날짜 상하 위치 (Y축)</span>
                          <span className="font-mono text-[10px] text-amber-400">
                            {settings.dateOffsetY > 0
                              ? `+${settings.dateOffsetY}px`
                              : `${settings.dateOffsetY || 0}px`}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="-120"
                          max="120"
                          step="2"
                          value={settings.dateOffsetY || 0}
                          onChange={(e) =>
                            onUpdateSettings({ dateOffsetY: parseInt(e.target.value) })
                          }
                          className="w-full accent-rose-500 cursor-pointer h-1.5 bg-slate-800 rounded"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span>날짜 좌우 위치 (X축)</span>
                          <span className="font-mono text-[10px] text-amber-400">
                            {settings.dateOffsetX > 0
                              ? `+${settings.dateOffsetX}px`
                              : `${settings.dateOffsetX || 0}px`}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="-120"
                          max="120"
                          step="2"
                          value={settings.dateOffsetX || 0}
                          onChange={(e) =>
                            onUpdateSettings({ dateOffsetX: parseInt(e.target.value) })
                          }
                          className="w-full accent-rose-500 cursor-pointer h-1.5 bg-slate-800 rounded"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Time Edit */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-300">
                  <Clock className="h-3.5 w-3.5 text-amber-400" />
                  <span>시간 표시 (대표 폰트)</span>
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={onSyncCurrentTime}
                    className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 cursor-pointer"
                    title="현재 시간으로 새로고침"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>현재 시간</span>
                  </button>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      id="showTimeToggle"
                      checked={settings.showTime}
                      onChange={(e) => onUpdateSettings({ showTime: e.target.checked })}
                      className="rounded bg-slate-800 border-slate-700 text-rose-500 focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="showTimeToggle" className="text-xs text-slate-400 cursor-pointer">
                      표시
                    </label>
                  </div>
                </div>
              </div>

              {settings.showTime && (
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={settings.timeText}
                    onChange={(e) => onUpdateSettings({ timeText: e.target.value })}
                    placeholder="09:20:59"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm font-mono text-white focus:outline-none focus:border-rose-500"
                  />
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <button
                      onClick={() => {
                        const parts = settings.timeText.split(':');
                        if (parts.length >= 2) {
                          onUpdateSettings({ timeText: `${parts[0]}:${parts[1]}` });
                        }
                      }}
                      className="hover:text-amber-400 cursor-pointer"
                    >
                      초 생략 (HH:mm)
                    </button>
                    <span>·</span>
                    <button
                      onClick={() => {
                        const now = new Date();
                        const pad = (n: number) => String(n).padStart(2, '0');
                        onUpdateSettings({
                          timeText: `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
                        });
                      }}
                      className="hover:text-amber-400 cursor-pointer"
                    >
                      초 단위 포함 (HH:mm:ss)
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Location Edit */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-300">
                  <MapPin className="h-3.5 w-3.5 text-rose-500" />
                  <span>위치 및 주소 (자동 감지)</span>
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={onDetectLocation}
                    disabled={isDetectingLocation}
                    className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 disabled:opacity-50 cursor-pointer"
                  >
                    <LocateFixed className={`h-3 w-3 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                    <span>{isDetectingLocation ? '감지 중...' : 'GPS 감지'}</span>
                  </button>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      id="showLocToggle"
                      checked={settings.showLocation}
                      onChange={(e) => onUpdateSettings({ showLocation: e.target.checked })}
                      className="rounded bg-slate-800 border-slate-700 text-rose-500 focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="showLocToggle" className="text-xs text-slate-400 cursor-pointer">
                      표시
                    </label>
                  </div>
                </div>
              </div>

              {settings.showLocation && (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={settings.locationText}
                    onChange={(e) => onUpdateSettings({ locationText: e.target.value })}
                    placeholder="부산시, 남구, 대연동"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-rose-500"
                  />

                  {/* Popular quick presets */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400">빠른 주소 선택:</span>
                    <div className="flex flex-wrap gap-1">
                      {POPULAR_LOCATIONS.slice(0, 4).map((loc) => (
                        <button
                          key={loc}
                          onClick={() => onUpdateSettings({ locationText: loc })}
                          className={`text-[11px] px-2 py-0.5 rounded border transition cursor-pointer ${
                            settings.locationText === loc
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : 'bg-slate-800/80 text-slate-400 border-slate-700/60 hover:text-slate-200'
                          }`}
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Optional Custom Memo / Title */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-300">
                  <Tag className="h-3.5 w-3.5 text-indigo-400" />
                  <span>추가 메모 / 제목 (선택)</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    id="showMemoToggle"
                    checked={settings.showMemo}
                    onChange={(e) => onUpdateSettings({ showMemo: e.target.checked })}
                    className="rounded bg-slate-800 border-slate-700 text-rose-500 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="showMemoToggle" className="text-xs text-slate-400 cursor-pointer">
                    추가
                  </label>
                </div>
              </div>

              {settings.showMemo && (
                <input
                  type="text"
                  value={settings.memoText}
                  onChange={(e) => onUpdateSettings({ memoText: e.target.value })}
                  placeholder="예: 오운완 45분 완료, 업무 미팅, 공부 기록"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              )}
            </div>
          </div>
        )}

        {/* TAB 2: STYLE & FONTS */}
        {activeTab === 'style' && (
          <div className="space-y-4">
            {/* Font Family Selection */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <Type className="h-3.5 w-3.5 text-rose-400" />
                <span>글자체 (폰트 선택)</span>
              </label>

              <div className="space-y-1.5">
                {FONT_OPTIONS.map((f) => {
                  const isSelected = settings.fontId === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => onUpdateSettings({ fontId: f.id })}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition cursor-pointer ${
                        isSelected
                          ? 'bg-rose-500/15 border-rose-500/50 text-white'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-semibold ${f.cssClass}`}>{f.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded">
                            {f.badge}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 mt-0.5">{f.description}</span>
                      </div>
                      {isSelected && <Check className="h-4 w-4 text-rose-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Font Size Scale Slider */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <Sliders className="h-3.5 w-3.5 text-amber-400" />
                  <span>글자 크기 조절</span>
                </label>
                <span className="text-xs font-mono text-amber-400">
                  {Math.round(settings.fontSizeScale * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.6"
                step="0.05"
                value={settings.fontSizeScale}
                onChange={(e) => onUpdateSettings({ fontSizeScale: parseFloat(e.target.value) })}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>

            {/* Text Color Picker */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <Palette className="h-3.5 w-3.5 text-blue-400" />
                <span>글자 색상</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => onUpdateSettings({ textColor: c.value })}
                    className={`relative w-8 h-8 rounded-full border-2 transition cursor-pointer flex items-center justify-center ${
                      settings.textColor === c.value
                        ? 'border-rose-500 scale-110 shadow-lg'
                        : 'border-slate-700 hover:border-slate-500'
                    }`}
                    style={{ backgroundColor: c.value }}
                    title={c.label}
                  >
                    {settings.textColor === c.value && (
                      <Check
                        className={`h-4 w-4 ${
                          c.value === '#FFFFFF' || c.value === '#FEF3C7' || c.value === '#FDE047'
                            ? 'text-slate-900'
                            : 'text-white'
                        }`}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Shadow & Outline Style */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <label className="text-xs font-semibold text-slate-300">
                가독성 효과 (그림자 / 배경)
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {SHADOW_OPTIONS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => onUpdateSettings({ shadowStyle: s.id })}
                    className={`flex items-center justify-between p-2 rounded-lg border text-left text-xs transition cursor-pointer ${
                      settings.shadowStyle === s.id
                        ? 'bg-rose-500/15 border-rose-500/50 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-slate-200">{s.name}</div>
                      <div className="text-[10px] text-slate-400">{s.desc}</div>
                    </div>
                    {settings.shadowStyle === s.id && <Check className="h-4 w-4 text-rose-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Location Icon Type */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <label className="text-xs font-semibold text-slate-300">위치 아이콘</label>
              <div className="grid grid-cols-4 gap-1.5">
                {ICON_OPTIONS.map((ico) => (
                  <button
                    key={ico.id}
                    onClick={() => onUpdateSettings({ iconType: ico.id })}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs transition cursor-pointer ${
                      settings.iconType === ico.id
                        ? 'bg-rose-500/20 border-rose-500/60 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {ico.isRing ? (
                      <div className="flex items-center justify-center h-6 mb-0.5">
                        <img
                          src="/assets/location_marker.png"
                          alt="위치 마크"
                          className="h-5 w-auto object-contain drop-shadow"
                        />
                      </div>
                    ) : (
                      <span className="text-lg mb-0.5">{ico.icon}</span>
                    )}
                    <span className="text-[10px] truncate w-full text-center">{ico.label}</span>
                  </button>
                ))}
              </div>

              {/* Location Icon Size Slider */}
              {settings.iconType !== 'none' && (
                <div className="space-y-1.5 pt-2 mt-1 border-t border-slate-800/60">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="font-medium">위치 아이콘 크기 조절</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-amber-400 text-xs font-semibold">
                        {Math.round((settings.iconSizeScale || 1.0) * 100)}%
                      </span>
                      {(settings.iconSizeScale || 1.0) !== 1.0 && (
                        <button
                          onClick={() => onUpdateSettings({ iconSizeScale: 1.0 })}
                          className="text-[10px] text-rose-400 hover:text-rose-300 cursor-pointer flex items-center gap-0.5"
                        >
                          <RotateCcw className="h-2.5 w-2.5" />
                          <span>초기화</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.05"
                    value={settings.iconSizeScale || 1.0}
                    onChange={(e) =>
                      onUpdateSettings({ iconSizeScale: parseFloat(e.target.value) })
                    }
                    className="w-full accent-rose-500 cursor-pointer h-1.5 bg-slate-800 rounded"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>작게 (50%)</span>
                    <span>기본 (100%)</span>
                    <span>크게 (250%)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Placement Presets */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <label className="text-xs font-semibold text-slate-300">기본 배치 위치</label>
              <div className="grid grid-cols-3 gap-1.5">
                {POSITION_OPTIONS.map((pos) => {
                  const Icon = pos.icon;
                  const isSelected = !settings.isCustomPosition && settings.position === pos.id;
                  return (
                    <button
                      key={pos.id}
                      onClick={() =>
                        onUpdateSettings({
                          position: pos.id,
                          isCustomPosition: false,
                        })
                      }
                      className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs font-medium transition cursor-pointer ${
                        isSelected
                          ? 'bg-rose-500/20 border-rose-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{pos.label.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-400">
                💡 사진 위를 직접 마우스나 터치로 드래그하면 원하는 위치 어디든 미세 조정할 수 있습니다.
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: PRESETS */}
        {activeTab === 'presets' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">
              원하는 스타일을 클릭하면 폰트, 색상, 배치, 아이콘이 원클릭으로 세팅됩니다.
            </p>
            <div className="space-y-2">
              {PRESET_THEMES.map((preset) => {
                const isCurrent =
                  settings.fontId === preset.settings.fontId &&
                  settings.textColor === preset.settings.textColor &&
                  settings.shadowStyle === preset.settings.shadowStyle;

                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      onUpdateSettings({
                        ...preset.settings,
                        isCustomPosition: false,
                      });
                    }}
                    className={`w-full p-3 rounded-xl border text-left transition cursor-pointer ${
                      isCurrent
                        ? 'bg-gradient-to-r from-rose-500/15 to-amber-500/15 border-rose-500/60'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-white flex items-center gap-2">
                        {preset.name}
                        {preset.id === 'sample-original' && (
                          <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.2 rounded font-normal">
                            예시 사진
                          </span>
                        )}
                      </span>
                      {isCurrent && <Check className="h-4 w-4 text-rose-400" />}
                    </div>
                    <p className="text-xs text-slate-400">{preset.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Save & Export Action Box */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">저장 포맷 선택</span>
          <div className="flex items-center gap-1 bg-slate-900 rounded p-0.5 border border-slate-800">
            <button
              onClick={() => setSaveFormat('jpeg')}
              className={`px-2.5 py-1 text-xs font-semibold rounded cursor-pointer transition ${
                saveFormat === 'jpeg' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              JPG (권장)
            </button>
            <button
              onClick={() => setSaveFormat('png')}
              className={`px-2.5 py-1 text-xs font-semibold rounded cursor-pointer transition ${
                saveFormat === 'png' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              PNG
            </button>
          </div>
        </div>

        <button
          onClick={() => onSave(saveFormat)}
          disabled={!hasImage}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all shadow-lg cursor-pointer ${
            hasImage
              ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white hover:opacity-95 shadow-rose-500/25 active:scale-[0.98]'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          <Download className="h-4 w-4" />
          <span>고화질 타임스탬프 사진 저장하기</span>
        </button>
      </div>
    </div>
  );
};
