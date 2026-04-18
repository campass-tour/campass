'use client';

import { useEffect } from 'react';

export default function ModelViewerScriptLoader() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // If already registered, nothing to do
    if (customElements.get('model-viewer')) {
      (window as any).__MODEL_VIEWER_LOADER_DONE = true;
      return;
    }

    // Prevent multiple injections
    if ((window as any).__MODEL_VIEWER_LOADER_DONE) return;
    (window as any).__MODEL_VIEWER_LOADER_DONE = true;

    // If a script that references model-viewer already exists, attach handlers
    const existing = Array.from(document.querySelectorAll('script[src]'))
      .map((s) => s as HTMLScriptElement)
      .find((s) => s.src && s.src.includes('model-viewer'));

    if (existing) {
      if ((existing as any).__MODEL_VIEWER_LOADED || existing.getAttribute('data-loaded') || (existing as any).readyState === 'complete') {
        (window as any).__MODEL_VIEWER_LOADER_DONE = true;
        return;
      }

      existing.addEventListener('load', () => {
        (existing as any).__MODEL_VIEWER_LOADED = true;
        (window as any).__MODEL_VIEWER_LOADER_DONE = true;
      }, { once: true });

      existing.addEventListener('error', () => {
        (window as any).__MODEL_VIEWER_LOADER_DONE = true;
      }, { once: true });

      return;
    }

    // No existing script found — inject the CDN module matching v4.2.0
    const script = document.createElement('script');
    script.type = 'module';
    script.async = true;
    // Use a specific version to avoid accidental multiple-version loads.
    script.src = 'https://unpkg.com/@google/model-viewer@4.2.0/dist/model-viewer.min.js?module';

    script.addEventListener('load', () => {
      (script as any).__MODEL_VIEWER_LOADED = true;
      (window as any).__MODEL_VIEWER_LOADER_DONE = true;
      // eslint-disable-next-line no-console
      console.log('✅ model-viewer CDN loaded');
    }, { once: true });

    script.addEventListener('error', () => {
      (window as any).__MODEL_VIEWER_LOADER_DONE = true;
      // eslint-disable-next-line no-console
      console.warn('❌ Failed to load model-viewer CDN');
    }, { once: true });

    document.head.appendChild(script);
  }, []);

  return null;
}