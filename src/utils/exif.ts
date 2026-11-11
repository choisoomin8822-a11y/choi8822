import exifr from 'exifr';
import { reverseGeocode } from './geo';

export interface PhotoMetadata {
  dateStr?: string;       // YYYY-MM-DD
  timeStr?: string;       // HH:mm:ss
  rawDateTime?: Date;
  locationStr?: string;
  hasExifDate: boolean;
  hasExifGps: boolean;
  latitude?: number;
  longitude?: number;
}

/**
 * Format a Date object into YYYY-MM-DD and HH:mm:ss
 */
export function formatDateTime(d: Date): { date: string; time: string } {
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());

  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}:${seconds}`,
  };
}

/**
 * Extract EXIF metadata (Date, Time, GPS) from an uploaded image File or Blob
 */
export async function extractPhotoMetadata(file: File | Blob): Promise<PhotoMetadata> {
  const result: PhotoMetadata = {
    hasExifDate: false,
    hasExifGps: false,
  };

  try {
    // Parse EXIF tags using exifr
    const exif = await exifr.parse(file, [
      'DateTimeOriginal',
      'CreateDate',
      'ModifyDate',
      'latitude',
      'longitude',
      'GPSLatitude',
      'GPSLongitude',
    ]);

    if (exif) {
      const dateObj = exif.DateTimeOriginal || exif.CreateDate || exif.ModifyDate;
      if (dateObj instanceof Date && !isNaN(dateObj.getTime())) {
        const { date, time } = formatDateTime(dateObj);
        result.dateStr = date;
        result.timeStr = time;
        result.rawDateTime = dateObj;
        result.hasExifDate = true;
      }

      if (typeof exif.latitude === 'number' && typeof exif.longitude === 'number') {
        result.latitude = exif.latitude;
        result.longitude = exif.longitude;
        result.hasExifGps = true;

        try {
          const address = await reverseGeocode(exif.latitude, exif.longitude);
          result.locationStr = address;
        } catch {
          result.locationStr = `위도 ${exif.latitude.toFixed(3)}, 경도 ${exif.longitude.toFixed(3)}`;
        }
      }
    }
  } catch (error) {
    console.warn('Could not extract EXIF data from image:', error);
  }

  return result;
}
