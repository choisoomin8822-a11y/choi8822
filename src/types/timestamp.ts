export type FontStyleId = 
  | 'pretendard'   // 예시 사진 스타일 (기본)
  | 'outfit'       // 모던 볼드
  | 'orbitron'     // 전자시계 / 디지털
  | 'montserrat'   // 트렌디 산세리프
  | 'serif-kr'     // 감성 명조
  | 'black-han'    // 볼드 임팩트
  | 'jetbrains';   // 레트로 모노

export type PositionPreset = 
  | 'bottom-right' // 예시 사진 위치 (우측 하단)
  | 'bottom-left'  // 좌측 하단
  | 'top-right'    // 우측 상단
  | 'top-left'     // 좌측 상단
  | 'center';      // 중앙

export type ShadowStyleId = 
  | 'sample'  // 예시 사진 소프트 그림자 (권장)
  | 'strong'  // 강한 섀도우
  | 'outline' // 얇은 외곽선
  | 'glass'   // 글래스 배경 박스
  | 'none';   // 그림자 없음

export type DateFormat = 
  | 'YYYY-MM-DD'     // 2026-08-14
  | 'YYYY.MM.DD'     // 2026.08.14
  | 'YYYY년 M월 D일' // 2026년 8월 14일
  | 'MM/DD/YYYY';    // 08/14/2026

export type TimeFormat = 
  | 'HH:mm:ss'  // 09:20:59 (24시간 초단위)
  | 'HH:mm'     // 09:20
  | 'A hh:mm:ss'// 오전 09:20:59
  | 'hh:mm:ss A'; // 09:20:59 AM

export type IconType = 
  | 'pin-red'     // 📍 예시 사진 스타일 (레드 핀)
  | 'target-red'  // 🎯 레드 과녁/타겟
  | 'pin'         // 📍 일반 핀
  | 'clock'       // ⏱️ 시계
  | 'camera'      // 📷 카메라
  | 'building'    // 🏢 빌딩/회사
  | 'sparkle'     // ✨ 스파클
  | 'check'       // ✅ 인증완료
  | 'none';       // 아이콘 없음

export interface TimestampSettings {
  dateText: string;
  timeText: string;
  locationText: string;
  memoText: string;
  showMemo: boolean;
  
  fontId: FontStyleId;
  fontSizeScale: number; // 0.7 ~ 1.6 (default 1.0)
  textColor: string;     // default #FFFFFF
  shadowStyle: ShadowStyleId;
  
  iconType: IconType;
  iconColor: string;     // default #EF4444 (Red-500 for map pin)
  iconSizeScale: number; // 0.4 ~ 2.5 (default 1.0)
  
  position: PositionPreset;
  customOffset: { x: number; y: number }; // normalized 0~1 or offset
  isCustomPosition: boolean;

  datePlacement: 'top' | 'bottom' | 'below-location';
  dateOffsetX: number; // -200 ~ 200
  dateOffsetY: number; // -200 ~ 200

  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  showDate: boolean;
  showTime: boolean;
  showLocation: boolean;
}

export interface PresetTheme {
  id: string;
  name: string;
  description: string;
  settings: Partial<TimestampSettings>;
}
