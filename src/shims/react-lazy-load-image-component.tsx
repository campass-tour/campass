import * as React from 'react';

export type LazyLoadImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  effect?: string;
};

export const LazyLoadImage = React.forwardRef<HTMLImageElement, LazyLoadImageProps>(
  ({ effect: _effect, loading, ...props }, ref) => {
    return <img ref={ref} loading={loading ?? 'lazy'} {...props} />;
  }
);

LazyLoadImage.displayName = 'LazyLoadImage';

