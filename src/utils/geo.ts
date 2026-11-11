/**
 * Geolocation & Reverse Geocoding Utility
 */

export interface LocationResult {
  address: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  source: 'gps' | 'exif' | 'fallback';
}

/**
 * Format raw address components from OpenStreetMap into a natural Korean administrative address
 * like "부산시, 남구, 대연동" (matching the user's sample image format)
 */
export function formatKoreanAddress(rawAddress: any): string {
  if (!rawAddress) return '위치 정보 없음';

  const province = rawAddress.province || rawAddress.state || '';
  const city = rawAddress.city || rawAddress.county || rawAddress.municipality || '';
  const borough = rawAddress.borough || rawAddress.district || rawAddress.suburb || '';
  const quarter = rawAddress.quarter || rawAddress.neighbourhood || rawAddress.village || rawAddress.town || '';
  const road = rawAddress.road || '';

  // Clean province names (e.g., 부산광역시 -> 부산시, 서울특별시 -> 서울특별시 or 서울시)
  let cleanProvince = province.replace(/광역시$/, '시').replace(/특별자치시$/, '시').replace(/특별시$/, '시');
  let cleanCity = city;

  // If city is already in province or vice-versa
  if (cleanCity === cleanProvince) {
    cleanCity = '';
  }

  const parts: string[] = [];
  if (cleanProvince) parts.push(cleanProvince);
  if (cleanCity && !cleanProvince.includes(cleanCity)) parts.push(cleanCity);
  if (borough) parts.push(borough);
  if (quarter) parts.push(quarter);
  else if (road) parts.push(road);

  if (parts.length === 0) {
    return rawAddress.display_name?.split(',').slice(0, 3).join(', ') || '위치 정보 확인됨';
  }

  return parts.slice(0, 3).join(', ');
}

/**
 * Reverse geocode latitude and longitude to human-readable address
 */
export async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=ko`,
      {
        signal: controller.signal,
        headers: {
          'User-Agent': 'TimestampStudioApp/1.0',
        },
      }
    );
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Geocoding HTTP ${response.status}`);
    }

    const data = await response.json();
    return formatKoreanAddress(data.address);
  } catch (error) {
    console.warn('Reverse geocoding error or timeout:', error);
    // Return approximate coordinate if geocoding fails
    return `위도 ${latitude.toFixed(4)}, 경도 ${longitude.toFixed(4)}`;
  }
}

/**
 * Get device's current location via browser Geolocation API
 */
export async function getCurrentDeviceLocation(): Promise<LocationResult> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('현재 브라우저에서 위치 정보(GPS)를 지원하지 않습니다.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        try {
          const address = await reverseGeocode(latitude, longitude);
          resolve({
            address,
            latitude,
            longitude,
            accuracy,
            source: 'gps',
          });
        } catch {
          resolve({
            address: `위도 ${latitude.toFixed(3)}, 경도 ${longitude.toFixed(3)}`,
            latitude,
            longitude,
            accuracy,
            source: 'gps',
          });
        }
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 10000,
      }
    );
  });
}

export const POPULAR_LOCATIONS = [
  '부산시, 남구, 대연동',
  '서울특별시, 강남구, 역삼동',
  '서울특별시, 마포구, 연남동',
  '경기도, 성남시, 분당구',
  '제주특별자치도, 제주시, 애월읍',
  '인천광역시, 연수구, 송도동',
  '대구광역시, 수성구, 범어동',
  '대전광역시, 유성구, 도룡동',
  '광주광역시, 동구, 금남로',
];
