'use client';

import { useEffect } from 'react';

export default function ModelViewerScriptLoader() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (customElements.get('model-viewer')) return;
    void import('@google/model-viewer');
  }, []);

  return null;
}
