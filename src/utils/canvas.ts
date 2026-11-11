import { TimestampSettings } from '../types/timestamp';

export interface RenderOptions {
  image: HTMLImageElement;
  settings: TimestampSettings;
  previewWidth?: number; // if rendering for a preview canvas
  previewHeight?: number;
}

/**
 * Maps fontId to canvas CSS font family string
 */
export function getCanvasFontFamily(fontId: string): string {
  switch (fontId) {
    case 'pretendard':
      return "'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif";
    case 'outfit':
      return "'Outfit', sans-serif";
    case 'orbitron':
      return "'Orbitron', monospace";
    case 'montserrat':
      return "'Montserrat', sans-serif";
    case 'serif-kr':
      return "'Noto Serif KR', serif";
    case 'black-han':
      return "'Black Han Sans', sans-serif";
    case 'jetbrains':
      return "'JetBrains Mono', monospace";
    default:
      return "'Pretendard', -apple-system, sans-serif";
  }
}

let cachedMarkerImage: HTMLImageElement | null = null;
let markerLoadedCallbacks: Array<() => void> = [];

export function getCustomMarkerImage(onLoad?: () => void): HTMLImageElement {
  if (!cachedMarkerImage && typeof window !== 'undefined') {
    cachedMarkerImage = new Image();
    cachedMarkerImage.crossOrigin = 'anonymous';
    cachedMarkerImage.src = '/assets/location_marker.png';
    cachedMarkerImage.onload = () => {
      markerLoadedCallbacks.forEach((cb) => cb());
    };
  }
  if (onLoad && cachedMarkerImage && !cachedMarkerImage.complete) {
    markerLoadedCallbacks.push(onLoad);
  }
  return cachedMarkerImage!;
}

// Pre-initialize marker image
if (typeof window !== 'undefined') {
  getCustomMarkerImage();
}

/**
 * Draws the red pin icon or target icon onto canvas
 */
function drawPinIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  type: string
) {
  ctx.save();
  ctx.translate(x, y);

  if (type === 'pin-red' || type === 'pin') {
    // Exact user-provided location marker (129x155 PNG with rounded head, inner cutout, chin & pedestal)
    const aspect = 129 / 155;
    const h = size;
    const w = h * aspect;

    ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
    ctx.shadowBlur = Math.round(size * 0.22);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = Math.round(size * 0.04);

    const markerImg = getCustomMarkerImage();
    if (markerImg && markerImg.complete && markerImg.naturalWidth > 0) {
      // Draw exact PNG asset centered at (0, 0)
      ctx.drawImage(markerImg, -w / 2, -h / 2, w, h);
    } else {
      // Crisp geometric fallback matching the exact user asset geometry
      const r = h * 0.32;
      const innerR = r * 0.46;
      ctx.beginPath();
      ctx.arc(0, -h * 0.12, r, 0, Math.PI * 2, false);
      ctx.arc(0, -h * 0.12, innerR, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fillStyle = color || '#FA434D';
      ctx.fill();

      // bottom tapered chin
      ctx.beginPath();
      ctx.moveTo(-r * 0.72, -h * 0.02);
      ctx.quadraticCurveTo(0, h * 0.30, 0, h * 0.33);
      ctx.quadraticCurveTo(0, h * 0.30, r * 0.72, -h * 0.02);
      ctx.closePath();
      ctx.fillStyle = color || '#FA434D';
      ctx.fill();

      // bottom pedestal bar
      ctx.beginPath();
      ctx.roundRect(-w * 0.34, h * 0.40, w * 0.68, h * 0.08, h * 0.04);
      ctx.fillStyle = color || '#FA434D';
      ctx.fill();
    }
  } else if (type === 'target-red') {
    // Bullseye target
    const r = size * 0.45;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
    ctx.shadowBlur = Math.round(size * 0.24);
    ctx.beginPath();
    ctx.fillStyle = color || '#FA3C3C';
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = '#FFFFFF';
    ctx.arc(0, 0, r * 0.65, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = color || '#FA3C3C';
    ctx.arc(0, 0, r * 0.32, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'clock') {
    // Clock icon
    const r = size * 0.45;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = size * 0.12;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -r * 0.6);
    ctx.moveTo(0, 0);
    ctx.lineTo(r * 0.5, 0);
    ctx.stroke();
  } else if (type === 'check') {
    // Check circle
    const r = size * 0.45;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = size * 0.12;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.moveTo(-r * 0.5, 0);
    ctx.lineTo(-r * 0.1, r * 0.4);
    ctx.lineTo(r * 0.5, -r * 0.3);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Render the image with full stamp overlay on a given HTMLCanvasElement
 */
export function renderTimestampOnCanvas(
  canvas: HTMLCanvasElement,
  options: RenderOptions
): void {
  const { image, settings, previewWidth, previewHeight } = options;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const targetWidth = previewWidth || image.naturalWidth || image.width;
  const targetHeight = previewHeight || image.naturalHeight || image.height;

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  // 1. Draw source photo
  ctx.drawImage(image, 0, 0, targetWidth, targetHeight);

  // 2. Calculate baseline typographic sizing based on canvas dimensions
  // Benchmark: Sample photo is ~1500-2500px, time font is roughly 6.8% of height
  const baseDim = Math.min(targetWidth, targetHeight);
  const scale = settings.fontSizeScale;
  
  const timeFontSize = Math.round(baseDim * 0.088 * scale);
  const dateFontSize = Math.round(timeFontSize * 0.46);
  const locFontSize = Math.round(timeFontSize * 0.40);
  const memoFontSize = Math.round(timeFontSize * 0.38);

  const fontFamily = getCanvasFontFamily(settings.fontId);

  // Set weights
  const dateFont = `600 ${dateFontSize}px ${fontFamily}`;
  const timeFont = `700 ${timeFontSize}px ${fontFamily}`;
  const locFont = `500 ${locFontSize}px ${fontFamily}`;
  const memoFont = `500 ${memoFontSize}px ${fontFamily}`;

  // Measure text blocks
  ctx.font = dateFont;
  const dateMetrics = ctx.measureText(settings.dateText);
  ctx.font = timeFont;
  const timeMetrics = ctx.measureText(settings.timeText);
  ctx.font = locFont;
  const locMetrics = ctx.measureText(settings.locationText);

  const iconScale = settings.iconSizeScale || 1.0;
  const iconSize = Math.round(locFontSize * 1.14 * iconScale);
  const iconW = Math.round(iconSize * (129 / 155));
  const iconGap = Math.round(locFontSize * 0.24 * Math.min(1.2, iconScale));
  const iconSpacing = settings.iconType !== 'none' ? iconW + iconGap : 0;
  const locTotalWidth = locMetrics.width + iconSpacing;

  let memoTotalWidth = 0;
  if (settings.showMemo && settings.memoText) {
    ctx.font = memoFont;
    memoTotalWidth = ctx.measureText(settings.memoText).width;
  }

  // Calculate block dimensions
  const lineGap = Math.round(timeFontSize * 0.16);
  const linesHeight = 
    (settings.showDate ? dateFontSize + lineGap : 0) +
    (settings.showTime ? timeFontSize + lineGap : 0) +
    (settings.showLocation ? locFontSize + lineGap : 0) +
    (settings.showMemo && settings.memoText ? memoFontSize + lineGap : 0);

  const maxLineWidth = Math.max(
    settings.showDate ? dateMetrics.width : 0,
    settings.showTime ? timeMetrics.width : 0,
    settings.showLocation ? locTotalWidth : 0,
    memoTotalWidth
  );

  // Determine anchor coordinates
  const paddingX = Math.round(targetWidth * 0.045);
  const paddingY = Math.round(targetHeight * 0.045);

  let anchorX = 0;
  let anchorY = 0;
  let align: 'left' | 'right' | 'center' = 'right';

  if (settings.isCustomPosition) {
    anchorX = settings.customOffset.x * targetWidth;
    anchorY = settings.customOffset.y * targetHeight;
    align = 'right';
  } else {
    switch (settings.position) {
      case 'bottom-right':
        anchorX = targetWidth - paddingX;
        anchorY = targetHeight - paddingY;
        align = 'right';
        break;
      case 'bottom-left':
        anchorX = paddingX;
        anchorY = targetHeight - paddingY;
        align = 'left';
        break;
      case 'top-right':
        anchorX = targetWidth - paddingX;
        anchorY = paddingY + linesHeight;
        align = 'right';
        break;
      case 'top-left':
        anchorX = paddingX;
        anchorY = paddingY + linesHeight;
        align = 'left';
        break;
      case 'center':
        anchorX = targetWidth / 2;
        anchorY = (targetHeight + linesHeight) / 2;
        align = 'center';
        break;
    }
  }

  // Optional Glass Backdrop box
  if (settings.shadowStyle === 'glass') {
    ctx.save();
    const boxPadding = Math.round(baseDim * 0.024);
    let boxX = anchorX;
    if (align === 'right') boxX = anchorX - maxLineWidth - boxPadding;
    else if (align === 'center') boxX = anchorX - (maxLineWidth / 2) - boxPadding;
    else boxX = anchorX - boxPadding;

    const boxY = anchorY - linesHeight - boxPadding;
    const boxW = maxLineWidth + boxPadding * 2;
    const boxH = linesHeight + boxPadding * 2;
    const radius = Math.round(baseDim * 0.015);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, radius);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }

  // Helper to draw text with chosen shadow style
  const drawTextWithShadow = (
    text: string,
    x: number,
    y: number,
    font: string,
    color: string
  ) => {
    ctx.save();
    ctx.font = font;
    ctx.textAlign = align;
    ctx.textBaseline = 'alphabetic';

    if (settings.shadowStyle === 'sample') {
      // Replicate the soft shadow in the sample photo
      ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
      ctx.shadowBlur = Math.round(timeFontSize * 0.22);
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = Math.round(timeFontSize * 0.04);
    } else if (settings.shadowStyle === 'strong') {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      ctx.shadowBlur = Math.round(timeFontSize * 0.3);
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = Math.round(timeFontSize * 0.08);
    } else if (settings.shadowStyle === 'outline') {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.lineWidth = Math.max(2, Math.round(timeFontSize * 0.06));
      ctx.lineJoin = 'round';
      ctx.strokeText(text, x, y);
    }

    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.restore();
  };

  // Stack calculation from bottom up or top down
  // Sample image order:
  // 1) Date: 2026-08-14
  // 2) Time: 09:20:59 (prominent)
  // 3) Location: 📍 부산시, 남구, 대연동
  // 4) Memo (optional)
  let currentY = anchorY;

  const itemsToDraw: Array<{
    type: 'memo' | 'loc' | 'time' | 'date';
    height: number;
  }> = [];

  const placement = settings.datePlacement || 'top';

  if (settings.showMemo && settings.memoText) {
    itemsToDraw.push({ type: 'memo', height: memoFontSize });
  }

  if (placement === 'below-location') {
    if (settings.showDate && settings.dateText) {
      itemsToDraw.push({ type: 'date', height: dateFontSize });
    }
    if (settings.showLocation && settings.locationText) {
      itemsToDraw.push({ type: 'loc', height: locFontSize });
    }
    if (settings.showTime && settings.timeText) {
      itemsToDraw.push({ type: 'time', height: timeFontSize });
    }
  } else if (placement === 'bottom') {
    if (settings.showLocation && settings.locationText) {
      itemsToDraw.push({ type: 'loc', height: locFontSize });
    }
    if (settings.showDate && settings.dateText) {
      itemsToDraw.push({ type: 'date', height: dateFontSize });
    }
    if (settings.showTime && settings.timeText) {
      itemsToDraw.push({ type: 'time', height: timeFontSize });
    }
  } else {
    // 'top' (default: above time)
    if (settings.showLocation && settings.locationText) {
      itemsToDraw.push({ type: 'loc', height: locFontSize });
    }
    if (settings.showTime && settings.timeText) {
      itemsToDraw.push({ type: 'time', height: timeFontSize });
    }
    if (settings.showDate && settings.dateText) {
      itemsToDraw.push({ type: 'date', height: dateFontSize });
    }
  }

  // Draw in order from bottom upwards
  for (let i = 0; i < itemsToDraw.length; i++) {
    const item = itemsToDraw[i];

    if (item.type === 'memo') {
      drawTextWithShadow(
        settings.memoText,
        anchorX,
        currentY,
        memoFont,
        '#E2E8F0'
      );
      currentY -= memoFontSize + lineGap;
    } else if (item.type === 'loc') {
      // Draw location line with icon
      const locText = settings.locationText;
      let textX = anchorX;
      let iconX = anchorX;

      if (align === 'right') {
        // Text is right aligned; icon sits to the left of the text
        drawTextWithShadow(locText, anchorX, currentY, locFont, settings.textColor);
        if (settings.iconType !== 'none') {
          iconX = anchorX - locMetrics.width - (iconW / 2) - iconGap;
          const iconY = currentY - (locFontSize * 0.38);
          drawPinIcon(ctx, iconX, iconY, iconSize, settings.iconColor, settings.iconType);
        }
      } else if (align === 'left') {
        if (settings.iconType !== 'none') {
          iconX = anchorX + (iconW / 2);
          const iconY = currentY - (locFontSize * 0.38);
          drawPinIcon(ctx, iconX, iconY, iconSize, settings.iconColor, settings.iconType);
          textX = anchorX + iconSpacing;
        }
        drawTextWithShadow(locText, textX, currentY, locFont, settings.textColor);
      } else {
        // center
        const totalW = locMetrics.width + iconSpacing;
        const startX = anchorX - (totalW / 2);
        if (settings.iconType !== 'none') {
          iconX = startX + (iconW / 2);
          const iconY = currentY - (locFontSize * 0.38);
          drawPinIcon(ctx, iconX, iconY, iconSize, settings.iconColor, settings.iconType);
        }
        ctx.save();
        ctx.font = locFont;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        if (settings.shadowStyle === 'sample') {
          ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
          ctx.shadowBlur = Math.round(timeFontSize * 0.22);
          ctx.shadowOffsetY = Math.round(timeFontSize * 0.04);
        }
        ctx.fillStyle = settings.textColor;
        ctx.fillText(locText, startX + iconSpacing, currentY);
        ctx.restore();
      }

      currentY -= locFontSize + lineGap;
    } else if (item.type === 'time') {
      drawTextWithShadow(
        settings.timeText,
        anchorX,
        currentY,
        timeFont,
        settings.textColor
      );
      currentY -= timeFontSize + lineGap;
    } else if (item.type === 'date') {
      const dateUserOffsetX = (settings.dateOffsetX || 0) * (targetWidth / 1000);
      const dateUserOffsetY = (settings.dateOffsetY || 0) * (targetHeight / 1000);
      drawTextWithShadow(
        settings.dateText,
        anchorX + dateUserOffsetX,
        currentY + dateUserOffsetY,
        dateFont,
        settings.textColor
      );
      currentY -= dateFontSize + lineGap;
    }
  }
}

/**
 * Download canvas content as high-quality JPEG or PNG
 */
export function downloadCanvas(canvas: HTMLCanvasElement, filename: string, format: 'jpeg' | 'png' = 'jpeg') {
  const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
  const quality = 0.95;
  const dataUrl = canvas.toDataURL(mimeType, quality);
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
