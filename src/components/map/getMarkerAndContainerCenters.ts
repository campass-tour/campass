// 工具函数：查找箭头（marker）和容器，并返回中心点坐标
export function getMarkerAndContainerCenters(markerId: string, container: HTMLElement | null) {
  const marker = document.getElementById(markerId);
  if (!marker || !container) return null;

  const markerRect = marker.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  const markerCenterX = markerRect.left + markerRect.width / 2;
  const markerCenterY = markerRect.top + markerRect.height / 2;
  const containerCenterX = containerRect.left + containerRect.width / 2;
  const containerCenterY = containerRect.top + containerRect.height / 2;

  return {
    markerCenterX,
    markerCenterY,
    containerCenterX,
    containerCenterY,
  };
}
