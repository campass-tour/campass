// src/lib/mapUtils.ts
// 通用地图操作工具函数
import { getMarkerAndContainerCenters } from '../components/map/getMarkerAndContainerCenters';

// 与 react-zoom-pan-pinch 的 setTransform 动画类型保持一致
export type TransformAnimationType =
  | 'linear'
  | 'easeOut'
  | 'easeInQuad'
  | 'easeOutQuad'
  | 'easeInOutQuad'
  | 'easeInCubic'
  | 'easeOutCubic'
  | 'easeInOutCubic'
  | 'easeInQuart'
  | 'easeOutQuart'
  | 'easeInOutQuart'
  | 'easeInQuint'
  | 'easeOutQuint'
  | 'easeInOutQuint';

/**
 * 居中指定 marker 到容器中心
 * @param markerId marker 元素的 id
 * @param container 容器 DOM 元素
 * @param positionX 当前 X 偏移
 * @param positionY 当前 Y 偏移
 * @param scale 当前缩放
 * @param setTransform TransformWrapper 的 setTransform 方法
 * @param animationTime 动画时长，默认 500ms
 * @returns 是否居中成功
 */
export function centerMarkerInContainer(
  markerId: string,
  container: HTMLElement | null,
  positionX: number,
  positionY: number,
  scale: number,
  setTransform: (
    x: number,
    y: number,
    scale: number,
    animationTime?: number,
    animationType?: TransformAnimationType
  ) => void,
  animationTime = 500
) {
  // 确保容器存在
  if (!container) {
    return false;
  }

  // 检查元素是否存在于DOM中
  const marker = document.getElementById(markerId);
  if (!marker) {
    // 尝试使用定时器查找元素，因为可能还在渲染过程中
    setTimeout(() => {
      const markerRetry = document.getElementById(markerId);
      if (markerRetry) {
        // 元素现在可用，但这次调用已经返回false，下一次调用应该成功
      }
    }, 50);

    return false;
  }

  const centers = getMarkerAndContainerCenters(markerId, container);
  if (!centers) {
    return false;
  }

  const { markerCenterX, markerCenterY, containerCenterX, containerCenterY } = centers;
  const deltaX = containerCenterX - markerCenterX;
  const deltaY = containerCenterY - markerCenterY;

  // 添加一个最小阈值，避免因精度问题造成不必要的移动
  if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) {
    // 如果距离足够近，认为已经居中
    return true;
  }

  setTransform(positionX + deltaX, positionY + deltaY, scale, animationTime, 'easeOut');
  return true;
}
