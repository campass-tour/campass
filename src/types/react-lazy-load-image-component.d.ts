declare module 'react-lazy-load-image-component' {
  import * as React from 'react';

  export interface LazyLoadImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    effect?: string;
    placeholderSrc?: string;
    visibleByDefault?: boolean;
    threshold?: number;
    wrapperClassName?: string;
    wrapperProps?: any;
    afterLoad?: () => void;
    beforeLoad?: () => void;
  }

  export class LazyLoadImage extends React.Component<LazyLoadImageProps> {}
  export default LazyLoadImage;
}
