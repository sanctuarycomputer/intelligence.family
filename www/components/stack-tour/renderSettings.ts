'use client';

import { useSyncExternalStore } from 'react';

// Live render settings for the stack tour, shared by the r3f scene, the
// trunk material system, and the ?debug=true dial panel. Defaults are the
// shipped look; the panel patches this store and the scene applies changes
// live. Export the JSON blob from the panel to hand a tuned look back.

export interface RenderSettings {
  shading: {
    mode: 'toon' | 'lambert' | 'standard';
    // Cel bands, dark to light, 0..255. Length 2..5.
    rampSteps: number[];
    // Standard mode only.
    roughness: number;
    metalness: number;
  };
  lighting: {
    exposure: number;
    ambient: number;
    key: number;
    keyPosition: [number, number, number];
    rim: number;
    rimPosition: [number, number, number];
  };
  enclosure: {
    'enclosure-back': string;
    'enclosure-front': string;
    'enclosure-top': string;
    leaf: string;
  };
  sheets: {
    face: string;
    edge: string;
  };
  outline: {
    enabled: boolean;
    color: string;
    // World metres; the device is ~0.185 m wide.
    thickness: number;
  };
  grid: {
    enabled: boolean;
    color: string;
    opacity: number;
    size: number;
    divisions: number;
    y: number;
  };
}

export const DEFAULT_RENDER_SETTINGS: RenderSettings = {
  shading: {
    mode: 'toon',
    rampSteps: [135, 195, 255],
    roughness: 0.85,
    metalness: 0,
  },
  lighting: {
    exposure: 1.2,
    ambient: 1.05,
    key: 1.9,
    keyPosition: [1.5, 2.5, 2],
    rim: 0.5,
    rimPosition: [-2, 1, -1],
  },
  enclosure: {
    'enclosure-back': '#CAD4C6',
    'enclosure-front': '#B8C6B0',
    'enclosure-top': '#B8C6B0',
    leaf: '#5E7B29',
  },
  sheets: {
    face: '#EDF1EA',
    edge: '#596647',
  },
  outline: {
    enabled: true,
    color: '#596647',
    thickness: 0.0012,
  },
  grid: {
    enabled: false,
    color: '#CAD4C6',
    opacity: 0.5,
    size: 2,
    divisions: 40,
    y: -0.046,
  },
};

let current: RenderSettings = DEFAULT_RENDER_SETTINGS;
const listeners = new Set<() => void>();

export function getRenderSettings(): RenderSettings {
  return current;
}

export function patchRenderSettings<K extends keyof RenderSettings>(
  section: K,
  values: Partial<RenderSettings[K]>
): void {
  current = { ...current, [section]: { ...current[section], ...values } };
  listeners.forEach(l => l());
}

export function resetRenderSettings(): void {
  current = DEFAULT_RENDER_SETTINGS;
  listeners.forEach(l => l());
}

export function subscribeRenderSettings(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function useRenderSettings(): RenderSettings {
  return useSyncExternalStore(
    subscribeRenderSettings,
    getRenderSettings,
    getRenderSettings
  );
}

// Key over the slices that require a material rebuild (vs. cheap per-frame
// or per-render scene patches).
export function materialSliceKey(s: RenderSettings): string {
  return JSON.stringify([s.shading, s.enclosure, s.outline]);
}
