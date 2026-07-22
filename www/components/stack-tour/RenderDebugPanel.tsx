'use client';

import { useState } from 'react';
import {
  DEFAULT_RENDER_SETTINGS,
  patchRenderSettings,
  resetRenderSettings,
  useRenderSettings,
  type RenderSettings,
} from './renderSettings';

// ?debug=true dial panel: every render setting live-editable, exportable as
// a JSON blob to hand back once a look is dialled in. Debug tooling only;
// never rendered without the query param.

const ROW: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  marginBottom: 6,
};
const LABEL: React.CSSProperties = {
  fontSize: 10,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
  color: '#313131',
};
const VALUE: React.CSSProperties = {
  fontSize: 10,
  color: '#596647',
  minWidth: 38,
  textAlign: 'right',
  fontVariantNumeric: 'tabular-nums',
};

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div style={ROW}>
      <span style={LABEL}>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ flex: 1, accentColor: '#5E7B29' }}
      />
      <span style={VALUE}>{value}</span>
    </div>
  );
}

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={ROW}>
      <span style={LABEL}>{label}</span>
      <span style={VALUE}>{value}</span>
      <input
        type="color"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ width: 28, height: 20, padding: 0, border: 'none' }}
      />
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          ...LABEL,
          color: '#5E7B29',
          borderBottom: '1px solid #CAD4C6',
          paddingBottom: 3,
          marginBottom: 8,
          fontWeight: 600,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function resizeRamp(steps: number[], count: number): number[] {
  const next = [...steps];
  while (next.length > count) next.shift();
  while (next.length < count) next.unshift(Math.max(0, (next[0] ?? 128) - 40));
  return next;
}

export default function RenderDebugPanel() {
  const s = useRenderSettings();
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(s, null, 2);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const vec = (
    section: 'keyPosition' | 'rimPosition',
    axis: 0 | 1 | 2,
    v: number
  ) => {
    const next = [
      ...s.lighting[section],
    ] as RenderSettings['lighting']['keyPosition'];
    next[axis] = v;
    patchRenderSettings('lighting', { [section]: next });
  };

  return (
    <div
      className="fixed left-4 top-4 bottom-4 z-50 w-72 overflow-y-auto rounded-lg border border-fi-green-300 bg-white/95 p-4 shadow-lg"
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      <div
        style={{ ...LABEL, fontSize: 12, fontWeight: 700, marginBottom: 10 }}
      >
        Render dials
      </div>

      <Section title="Shading">
        <div style={ROW}>
          <span style={LABEL}>mode</span>
          <select
            value={s.shading.mode}
            onChange={e =>
              patchRenderSettings('shading', {
                mode: e.target.value as RenderSettings['shading']['mode'],
              })
            }
            style={{ fontSize: 11, flex: 1 }}
          >
            <option value="toon">toon (cel)</option>
            <option value="lambert">lambert</option>
            <option value="standard">standard (PBR)</option>
          </select>
        </div>
        {s.shading.mode === 'standard' && (
          <>
            <Slider
              label="roughness"
              value={s.shading.roughness}
              min={0}
              max={1}
              step={0.05}
              onChange={v => patchRenderSettings('shading', { roughness: v })}
            />
            <Slider
              label="metalness"
              value={s.shading.metalness}
              min={0}
              max={1}
              step={0.05}
              onChange={v => patchRenderSettings('shading', { metalness: v })}
            />
          </>
        )}
        {s.shading.mode === 'toon' && (
          <>
            <div style={ROW}>
              <span style={LABEL}>cel bands</span>
              <select
                value={s.shading.rampSteps.length}
                onChange={e =>
                  patchRenderSettings('shading', {
                    rampSteps: resizeRamp(
                      s.shading.rampSteps,
                      Number(e.target.value)
                    ),
                  })
                }
                style={{ fontSize: 11 }}
              >
                {[2, 3, 4, 5].map(n => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            {s.shading.rampSteps.map((step, i) => (
              <Slider
                key={i}
                label={`band ${i + 1}`}
                value={step}
                min={0}
                max={255}
                step={1}
                onChange={v => {
                  const rampSteps = [...s.shading.rampSteps];
                  rampSteps[i] = v;
                  patchRenderSettings('shading', { rampSteps });
                }}
              />
            ))}
          </>
        )}
      </Section>

      <Section title="Lighting">
        <Slider
          label="exposure"
          value={s.lighting.exposure}
          min={0.4}
          max={2.2}
          step={0.05}
          onChange={v => patchRenderSettings('lighting', { exposure: v })}
        />
        <Slider
          label="ambient"
          value={s.lighting.ambient}
          min={0}
          max={3}
          step={0.05}
          onChange={v => patchRenderSettings('lighting', { ambient: v })}
        />
        <Slider
          label="key"
          value={s.lighting.key}
          min={0}
          max={4}
          step={0.05}
          onChange={v => patchRenderSettings('lighting', { key: v })}
        />
        {(['x', 'y', 'z'] as const).map((axis, i) => (
          <Slider
            key={`key-${axis}`}
            label={`key ${axis}`}
            value={s.lighting.keyPosition[i]}
            min={-5}
            max={5}
            step={0.1}
            onChange={v => vec('keyPosition', i as 0 | 1 | 2, v)}
          />
        ))}
        <Slider
          label="rim"
          value={s.lighting.rim}
          min={0}
          max={2}
          step={0.05}
          onChange={v => patchRenderSettings('lighting', { rim: v })}
        />
        {(['x', 'y', 'z'] as const).map((axis, i) => (
          <Slider
            key={`rim-${axis}`}
            label={`rim ${axis}`}
            value={s.lighting.rimPosition[i]}
            min={-5}
            max={5}
            step={0.1}
            onChange={v => vec('rimPosition', i as 0 | 1 | 2, v)}
          />
        ))}
      </Section>

      <Section title="Enclosure">
        <ColorRow
          label="back shell"
          value={s.enclosure['enclosure-back']}
          onChange={v =>
            patchRenderSettings('enclosure', { 'enclosure-back': v })
          }
        />
        <ColorRow
          label="front"
          value={s.enclosure['enclosure-front']}
          onChange={v =>
            patchRenderSettings('enclosure', { 'enclosure-front': v })
          }
        />
        <ColorRow
          label="top"
          value={s.enclosure['enclosure-top']}
          onChange={v =>
            patchRenderSettings('enclosure', { 'enclosure-top': v })
          }
        />
        <ColorRow
          label="leaf"
          value={s.enclosure.leaf}
          onChange={v => patchRenderSettings('enclosure', { leaf: v })}
        />
      </Section>

      <Section title="Outline">
        <div style={ROW}>
          <span style={LABEL}>enabled</span>
          <input
            type="checkbox"
            checked={s.outline.enabled}
            onChange={e =>
              patchRenderSettings('outline', { enabled: e.target.checked })
            }
          />
        </div>
        <ColorRow
          label="color"
          value={s.outline.color}
          onChange={v => patchRenderSettings('outline', { color: v })}
        />
        <Slider
          label="thickness"
          value={s.outline.thickness}
          min={0}
          max={0.004}
          step={0.0001}
          onChange={v => patchRenderSettings('outline', { thickness: v })}
        />
      </Section>

      <Section title="Sheets">
        <ColorRow
          label="face"
          value={s.sheets.face}
          onChange={v => patchRenderSettings('sheets', { face: v })}
        />
        <ColorRow
          label="edge"
          value={s.sheets.edge}
          onChange={v => patchRenderSettings('sheets', { edge: v })}
        />
      </Section>

      <Section title="Grid">
        <div style={ROW}>
          <span style={LABEL}>enabled</span>
          <input
            type="checkbox"
            checked={s.grid.enabled}
            onChange={e =>
              patchRenderSettings('grid', { enabled: e.target.checked })
            }
          />
        </div>
        <ColorRow
          label="color"
          value={s.grid.color}
          onChange={v => patchRenderSettings('grid', { color: v })}
        />
        <Slider
          label="opacity"
          value={s.grid.opacity}
          min={0}
          max={1}
          step={0.05}
          onChange={v => patchRenderSettings('grid', { opacity: v })}
        />
        <Slider
          label="size"
          value={s.grid.size}
          min={0.5}
          max={6}
          step={0.25}
          onChange={v => patchRenderSettings('grid', { size: v })}
        />
        <Slider
          label="divisions"
          value={s.grid.divisions}
          min={10}
          max={120}
          step={2}
          onChange={v => patchRenderSettings('grid', { divisions: v })}
        />
        <Slider
          label="height y"
          value={s.grid.y}
          min={-0.2}
          max={0.2}
          step={0.002}
          onChange={v => patchRenderSettings('grid', { y: v })}
        />
      </Section>

      <Section title="Export">
        <textarea
          readOnly
          value={json}
          rows={8}
          style={{
            width: '100%',
            fontSize: 9,
            fontFamily: 'monospace',
            border: '1px solid #CAD4C6',
            borderRadius: 4,
            padding: 6,
            background: '#FAFBF9',
          }}
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <button
            type="button"
            onClick={copy}
            style={{
              flex: 1,
              fontSize: 11,
              padding: '6px 0',
              background: '#5E7B29',
              color: '#FFFFFF',
              borderRadius: 4,
            }}
          >
            {copied ? 'Copied!' : 'Copy JSON'}
          </button>
          <button
            type="button"
            onClick={() => resetRenderSettings()}
            style={{
              flex: 1,
              fontSize: 11,
              padding: '6px 0',
              background: '#CAD4C6',
              color: '#313131',
              borderRadius: 4,
            }}
          >
            Reset
          </button>
        </div>
        {json === JSON.stringify(DEFAULT_RENDER_SETTINGS, null, 2) && (
          <div style={{ ...LABEL, marginTop: 6, opacity: 0.6 }}>
            (currently at shipped defaults)
          </div>
        )}
      </Section>
    </div>
  );
}
