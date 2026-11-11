import { FontStyleId, PresetTheme, ShadowStyleId } from '../types/timestamp';

export interface FontOption {
  id: FontStyleId;
  name: string;
  badge: string;
  cssClass: string;
  description: string;
}

export const FONT_OPTIONS: FontOption[] = [
  {
    id: 'pretendard',
    name: '프리텐다드 (예시 사진 스타일)',
    badge: '추천',
    cssClass: 'font-pretendard',
    description: '예시 사진과 동일한 깔끔하고 세련된 한국형 산세리프',
  },
  {
    id: 'outfit',
    name: '모던 볼드 (Outfit)',
    badge: '트렌디',
    cssClass: 'font-outfit',
    description: '기하학적이고 트렌디한 인스타그램 피드 스타일',
  },
  {
    id: 'orbitron',
    name: '디지털 시계 (Orbitron)',
    badge: '전자시계',
    cssClass: 'font-orbitron',
    description: '공항 및 하이테크 디지털 워치 감성의 정밀 타이머',
  },
  {
    id: 'montserrat',
    name: '몬세라트 (Montserrat)',
    badge: '글로벌',
    cssClass: 'font-montserrat',
    description: '굵고 단단한 타이포그래피로 시인성이 뛰어남',
  },
  {
    id: 'serif-kr',
    name: '감성 명조 (Noto Serif)',
    badge: '감성에세이',
    cssClass: 'font-serif-kr',
    description: '책, 여행, 브이로그에 어울리는 따뜻한 명조체',
  },
  {
    id: 'black-han',
    name: '블랙한 산스 (임팩트)',
    badge: '오운완',
    cssClass: 'font-black-han',
    description: '운동 챌린지 및 인증샷용 굵고 강렬한 헤드라인',
  },
  {
    id: 'jetbrains',
    name: '레트로 쿼츠 (모노스페이스)',
    badge: '필름카메라',
    cssClass: 'font-jetbrains',
    description: '90년대 필름 카메라의 날짜 각인 쿼츠 스타일',
  },
];

export const SHADOW_OPTIONS: { id: ShadowStyleId; name: string; desc: string }[] = [
  { id: 'sample', name: '부드러운 그림자 (예시 스타일)', desc: '흰 배경에서도 또렷하게 보이는 자연스러운 그림자' },
  { id: 'strong', name: '진한 입체 그림자', desc: '복잡한 배경에서도 가독성을 극대화하는 깊은 그림자' },
  { id: 'outline', name: '블랙 아웃라인', desc: '글자 주변에 얇은 외곽선을 둘러 시인성 확보' },
  { id: 'glass', name: '글래스모피즘 박스', desc: '반투명 다크 배경 박스로 서류나 업무 보고에 최적화' },
  { id: 'none', name: '그림자 없음', desc: '플랫하고 심플한 단색 텍스트' },
];

export const PRESET_THEMES: PresetTheme[] = [
  {
    id: 'sample-original',
    name: '클래식 타임스탬프 (기본)',
    description: '날짜, 대형 시간, 레드 원형 마크와 위치가 표시되는 대표 스타일',
    settings: {
      fontId: 'pretendard',
      textColor: '#FFFFFF',
      iconType: 'pin-red',
      iconColor: '#FA3C3C',
      shadowStyle: 'sample',
      position: 'bottom-right',
      fontSizeScale: 1.0,
      showDate: true,
      showTime: true,
      showLocation: true,
      showMemo: false,
    },
  },
  {
    id: 'workout-today',
    name: '오운완 / 운동 챌린지',
    description: '강렬한 폰트와 눈에 띄는 타겟 아이콘의 운동 기록 스타일',
    settings: {
      fontId: 'black-han',
      textColor: '#FFFFFF',
      iconType: 'target-red',
      iconColor: '#F43F5E',
      shadowStyle: 'strong',
      position: 'bottom-left',
      fontSizeScale: 1.1,
      memoText: '오늘도 완료! 🏃🔥',
      showMemo: true,
    },
  },
  {
    id: 'digital-runner',
    name: '디지털 스포츠 타이머',
    description: '하이테크 네온 시안 디지털 시계 스타일',
    settings: {
      fontId: 'orbitron',
      textColor: '#38BDF8',
      iconType: 'clock',
      iconColor: '#38BDF8',
      shadowStyle: 'sample',
      position: 'bottom-right',
      fontSizeScale: 0.95,
      showDate: true,
      showTime: true,
      showLocation: true,
    },
  },
  {
    id: 'audit-field',
    name: '현장 감리 / 업무 보고',
    description: '반투명 박스로 서류 및 공사 현장에서도 가독성이 완벽한 스타일',
    settings: {
      fontId: 'pretendard',
      textColor: '#FFFFFF',
      iconType: 'building',
      iconColor: '#60A5FA',
      shadowStyle: 'glass',
      position: 'bottom-right',
      fontSizeScale: 0.95,
      memoText: '현장 확인 및 실사 완료',
      showMemo: true,
    },
  },
  {
    id: 'vintage-film',
    name: '90년대 필름 쿼츠',
    description: '황금빛 주황색 날짜 각인의 필름 카메라 레트로 감성',
    settings: {
      fontId: 'jetbrains',
      textColor: '#F59E0B',
      iconType: 'none',
      shadowStyle: 'sample',
      position: 'bottom-right',
      fontSizeScale: 0.9,
      showDate: true,
      showTime: true,
      showLocation: false,
    },
  },
  {
    id: 'aesthetic-diary',
    name: '감성 브이로그 일기',
    description: '차분한 명조체와 따뜻한 아이보리 톤의 카페/여행 기록',
    settings: {
      fontId: 'serif-kr',
      textColor: '#FEF3C7',
      iconType: 'sparkle',
      iconColor: '#FDE047',
      shadowStyle: 'sample',
      position: 'bottom-left',
      fontSizeScale: 1.0,
      showDate: true,
      showTime: true,
      showLocation: true,
    },
  },
];
