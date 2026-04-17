
import React from 'react';

interface Props {
  visible: boolean;
  bearing: number; // 只需要这个参数！
  targetName?: string | null;
}


// 将角度转换为自然语言方位
function bearingToCardinal(bearing: number) {
  const sectors = [
    'North', 'Northeast', 'East', 'Southeast',
    'South', 'Southwest', 'West', 'Northwest'
  ];
  const b = ((bearing % 360) + 360) % 360;
  const index = Math.floor(((b + 22.5) % 360) / 45);
  return sectors[index];
}



export const EdgeDirectionIndicator: React.FC<Props> = ({
  visible,
  bearing,
  targetName
}) => {
  if (!visible) return null;

  // 判断是否为极小屏幕（如宽度小于400px）
  const isTinyScreen = typeof window !== 'undefined' && window.innerWidth < 400;
  const pointerRotation = bearing;
  const cardinal = bearingToCardinal(bearing);
  const targetLabel = targetName || 'Campus';

  return (
    <div className="absolute top-2 left-2 lg:top-6 lg:left-1/2 lg:-translate-x-1/2 z-50 pointer-events-none transition-all duration-300 ease-in-out">
      <div className="flex items-center gap-1.5 lg:gap-3 px-2 py-1.5 lg:px-4 lg:py-2 bg-white/85 backdrop-blur-md rounded-full shadow-[0_8px_32px_rgba(40,21,89,0.12)] border border-primary/10 min-h-8 lg:min-h-0">
        {/* 雷达 Icon */}
        <div className="relative w-7 h-7 lg:w-10 lg:h-10 shrink-0">
          <svg viewBox="0 0 64 64" className="w-full h-full">
            <circle cx="32" cy="32" r="28" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.3" />
            <circle cx="32" cy="32" r="3" fill="var(--color-primary)" />
            {/* 🌟 只有这里旋转，且只受 bearing 影响 */}
            <g style={{ transform: `rotate(${pointerRotation}deg)`, transformOrigin: '32px 32px' }}>
              <path d="M32 8 L40 38 L32 33 L24 38 Z" fill="var(--color-accent)" />
            </g>
          </svg>
        </div>
        {/* 极小屏幕只显示指南针，不显示其它内容 */}
        {!isTinyScreen && (
          <div className="flex flex-col justify-center">
            {/* 仅在 md 及以上显示目标名称 */}
            <span className="hidden md:block text-[10px] md:text-xs font-semibold tracking-wider text-(--color-text-secondary) uppercase">
              TARGET: {targetLabel}
            </span>
            {/* 方位 (手机端精简，电脑端详尽) */}
            <span className="text-sm md:text-base font-bold text-(--color-primary) whitespace-nowrap">
              {/* 手机端显示：Head {cardinal} */}
              <span className="sm:hidden">Head {cardinal}</span>
              {/* 电脑端/平板显示：Target is to your {cardinal} */}
              <span className="hidden sm:inline">Signal lost. Head {cardinal}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EdgeDirectionIndicator;
