import { ANCHOR_POINT_1, ANCHOR_POINT_2 } from '../constants/mapConfig';

interface GpsPoint {
  lat: number;
  lon: number;
}

interface ImagePoint {
  xPercent: number;
  yPercent: number;
}

// 把 GPS 转换为统一的 x, y 坐标，其中 y 轴方向取反，与屏幕坐标系（向下为正）对齐
const gpsDiff = {
  x: ANCHOR_POINT_2.gps.lon - ANCHOR_POINT_1.gps.lon,
  y: -(ANCHOR_POINT_2.gps.lat - ANCHOR_POINT_1.gps.lat), 
};

const imageDiff = {
  x: ANCHOR_POINT_2.image.xPercent - ANCHOR_POINT_1.image.xPercent,
  y: ANCHOR_POINT_2.image.yPercent - ANCHOR_POINT_1.image.yPercent,
};

// 计算 GPS 坐标系和图片坐标系之间的缩放比例和旋转角度
const gpsDistance = Math.sqrt(gpsDiff.x ** 2 + gpsDiff.y ** 2);
const imageDistance = Math.sqrt(imageDiff.x ** 2 + imageDiff.y ** 2);

const scale = imageDistance / gpsDistance; // 缩放比例
// 使用修正后的 gpsDiff.y 进行角度计算
const angleRad = Math.atan2(imageDiff.y, imageDiff.x) - Math.atan2(gpsDiff.y, gpsDiff.x);

/**
 * 将任何 GPS 坐标转换为地图图片上的百分比坐标
 */
export function convertGpsToImageCoordinates(gpsPoint: GpsPoint | null): ImagePoint | null {
  if (!gpsPoint) {
    return null;
  }

  // 1. 计算输入点相对于锚点1的 GPS 偏移
  const targetGpsDiff = {
    x: gpsPoint.lon - ANCHOR_POINT_1.gps.lon,
    y: -(gpsPoint.lat - ANCHOR_POINT_1.gps.lat), 
  };

  // 2. 将这个 GPS 偏移应用旋转和缩放
  const rotatedX = targetGpsDiff.x * Math.cos(angleRad) - targetGpsDiff.y * Math.sin(angleRad);
  const rotatedY = targetGpsDiff.x * Math.sin(angleRad) + targetGpsDiff.y * Math.cos(angleRad);

  const imageOffsetX = rotatedX * scale;
  const imageOffsetY = rotatedY * scale;

  // 3. 将图片偏移量加到锚点1的图片坐标上，得到最终结果
  const finalXPercent = ANCHOR_POINT_1.image.xPercent + imageOffsetX;
  const finalYPercent = ANCHOR_POINT_1.image.yPercent + imageOffsetY;

  return {
    xPercent: finalXPercent,
    yPercent: finalYPercent,
  };
}