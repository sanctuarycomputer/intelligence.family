// Pure data and math for the /fundraising/stack annotated layer tour. No
// three.js imports so it stays trivially unit-testable.
//
// NOTE: this file is covered by the em-dash lint in tests/stack-copy.test.ts.
// Keep comments and copy free of em dashes.
import {
  smoothstep,
  EXPLODE_VECTORS,
  type Vec3,
} from '../trunk/explodeTimeline';

export { smoothstep };

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export interface TourBeat {
  id: string;
  label: string;
  title: string;
  paragraphs: string[];
}

// Copy is the approved Descent-script voice, verbatim (Hardware beat cut;
// layers renumbered 01..10). If layout needs trims, cut whole sentences.
export const TOUR_BEATS: TourBeat[] = [
  {
    id: 'runtime',
    label: 'LAYER 01',
    title: 'Application Runtime',
    paragraphs: [
      'Products are apps on a governed runtime: scrapbook, radio, archive browser. The runtime exposes a query and subscription API over the knowledge layer and enforces capability boundaries per app.',
      'Apps read derived data. They get no access to raw audio, key material, or the network.',
    ],
  },
  {
    id: 'harness',
    label: 'LAYER 02',
    title: 'Agentic Harness (Pii)',
    paragraphs: [
      'Pii orchestrates all on-device inference. Work decomposes into atomic tasks with declared contracts; each task runs against a fresh context; state lives in the plan, not the model. This is what makes small local models predictable.',
      'The model sits behind a single adapter interface: llama.cpp, ONNX Runtime, TensorRT-class runtimes. Weights ship as versioned fleet artifacts. Nothing above this layer changes when they do. No inference leaves the device.',
    ],
  },
  {
    id: 'ingestion',
    label: 'LAYER 03',
    title: 'Ingestion & Encrypted Data Sink',
    paragraphs: [
      'Capture writes through an encrypt-on-write, append-only sink. Plaintext never reaches disk, including across crashes. The sink accepts sealed chunks, acknowledges durability, and does nothing else.',
      'Transform stages run as scheduled background jobs: diarization, transcription, entity and relation extraction. Sealed input, sealed output, at every stage. Every extracted fact carries provenance back to its source chunk.',
    ],
  },
  {
    id: 'knowledge',
    label: 'LAYER 04',
    title: 'Knowledge & Blob Storage',
    paragraphs: [
      'Three stores behind one storage service. A property graph with an application-defined ontology (Person, Event, Location; RELATES_TO, HAPPENED_AT, ATTENDED). A content-addressed blob store for raw and derived media, immutable by construction. Vector and full-text indexes for retrieval.',
      'The storage service is the only path to disk. It enforces encryption at rest and emits an ordered change log, which is the input to replication.',
    ],
  },
  {
    id: 'crypto',
    label: 'LAYER 05',
    title: 'Cryptographic Core & Key Management',
    paragraphs: [
      'One key hierarchy: hardware-rooted device identity, storage keys for encryption at rest, a family keyset for group E2EE across enrolled devices, per-object content keys. Enrollment is a physical ceremony between devices. Revocation rotates the family keyset and expels the device identity.',
      'No vendor escrow exists. Recovery is a quorum of surviving devices or a printed recovery code. Lost keys are unrecoverable by design.',
    ],
  },
  {
    id: 'os',
    label: 'LAYER 06',
    title: 'OS & Platform Services',
    paragraphs: [
      'Read-only embedded Linux with a verified boot chain and dm-verity system partitions. Every service is sandboxed; parsers that handle untrusted media run in the tightest cells. A resource governor arbitrates the NPU between interactive inference and background pipelines.',
      'The disconnect switch cuts microphone power in hardware. Software can observe its state. Software cannot override it.',
    ],
  },
  {
    id: 'tee',
    label: 'LAYER 07',
    title: 'TEE & Hardware Root of Trust',
    paragraphs: [
      'Boot chain: immutable ROM, secure boot, measured boot, remote attestation. Root keys are generated inside the TEE and never leave it; the rich OS handles ciphertext and key handles only. Biometric material, voiceprints and speaker embeddings, can be sealed here as well.',
      'Attestation is the proof layer. The device demonstrates cryptographically what code it booted, to the fleet, to its peer devices, and to its owner.',
    ],
  },
  {
    id: 'gossip',
    label: 'LAYER 08',
    title: 'Replication & P2P Gossip',
    paragraphs: [
      'Every device holds a full replica. The change log replicates via CRDTs: add-wins sets for graph edges, register semantics for scalar properties, content-addressed immutable blobs. Any subset of devices that can exchange packets converges. No coordinator.',
      'Transport is anti-entropy gossip: mDNS discovery on the LAN, rendezvous over a private mesh, version-vector exchange, delta sync. It works when the VPN is up and the network behind it is not. Semantic conflicts, such as two extractions of the same person, surface as proposed, revertible merges.',
    ],
  },
  {
    id: 'mirror',
    label: 'LAYER 09',
    title: 'Opaque Mirror (Zero-Knowledge Sync Server)',
    paragraphs: [
      'Store-and-forward sync for devices that never overlap in time, plus off-site durability. The Mirror holds sealed log entries and padded blobs against opaque handles. It stores no keys, no device identities, no cleartext family state. Its complete queryable knowledge: ciphertext of certain sizes at certain times.',
      "The design follows Signal's server model: sealed-sender-style envelopes, anonymous credentials for membership proofs, attested enclaves where the server must compute. The residual leak is traffic metadata, and the threat model says so.",
    ],
  },
  {
    id: 'fota',
    label: 'LAYER 10',
    title: 'FOTA & Fleet Management',
    paragraphs: [
      'Signed A/B image updates with automatic rollback. OS images and model weights ship as separate artifact channels; after one device receives an artifact, it propagates device-to-device over the gossip transport. Fleet enrollment is gated on hardware attestation.',
      "Telemetry is health only: boot status, storage, thermals, update state. The control plane can replace a device's software. It cannot read a device's data.",
    ],
  },
];

export const BEAT_COUNT = TOUR_BEATS.length;

// Ten one-viewport sections: computeProgress spans (height - viewport), so
// section i sits vertically centred at t = i / 9.
export function beatCenter(i: number): number {
  return i / (BEAT_COUNT - 1);
}

export function beatWindow(i: number): { start: number; end: number } {
  const start = i === 0 ? 0 : (beatCenter(i - 1) + beatCenter(i)) / 2;
  const end =
    i === BEAT_COUNT - 1 ? 1 : (beatCenter(i) + beatCenter(i + 1)) / 2;
  return { start, end };
}

export function beatIndexAt(t: number): number {
  const c = clamp01(t);
  for (let i = 0; i < BEAT_COUNT; i++) {
    if (c < beatWindow(i).end) return i;
  }
  return BEAT_COUNT - 1;
}

// ---------- Motion tracks ----------
// Beat centres for reference: 01 at 0, 02 at 0.111, 03 at 0.222, 04 at
// 0.333, 05 at 0.444, 06 at 0.556, 07 at 0.667, 08 at 0.778, 09 at 0.889,
// 10 at 1.

// Top, leaf, front, and display travel along their EXPLODE_VECTORS by this
// factor: the trunk opens on the way into beat 02 and closes again on the
// way into beat 08.
export function openFactor(t: number): number {
  return smoothstep(0.06, 0.105, t) * (1 - smoothstep(0.7, 0.75, t));
}

export const SHEET_COUNT = 4;
export const SHEET_X = 0.082;
export const SHEET_Z = 0.0575;
// Slots above the orin (top of module at y 0.0245), highest first: the
// stack grows downward, toward silicon.
export const SHEET_SLOT_Y = [0.096, 0.076, 0.056, 0.038];
export const SLAB_Y = 0.03;

// A dim step once a sheet's own beat has passed.
const SHEET_DIM = 0.45;
// Consolidation completes just before beat 06's centre (0.556), so the
// slab is whole while its copy is up.
const CONSOLIDATE_START = 0.49;
const CONSOLIDATE_END = 0.545;
// The slab dissipates early in beat 07's window.
const DISSIPATE_START = 0.6;
const DISSIPATE_END = 0.645;

export function sheetState(
  sheet: number,
  t: number
): { y: number; opacity: number } {
  const beat = sheet + 1; // sheet 0 belongs to LAYER 02 (index 1)
  const c = beatCenter(beat);
  // Materialize: fade in with a small settle from above the slot.
  const appear = smoothstep(c - 0.06, c - 0.015, t);
  const settle = SHEET_SLOT_Y[sheet] + 0.03 * (1 - appear);
  // Dim once the next beat's centre arrives.
  const dim = smoothstep(beatCenter(beat) + 0.02, beatCenter(beat + 1), t);
  // Consolidate: glide to the slab position and hand off to the slab mesh.
  const consolidate = smoothstep(CONSOLIDATE_START, CONSOLIDATE_END, t);
  const y = settle + (SLAB_Y - settle) * consolidate;
  const opacity = appear * (1 - dim * (1 - SHEET_DIM)) * (1 - consolidate);
  return { y, opacity: clamp01(opacity) };
}

export function slabOpacity(t: number): number {
  return (
    smoothstep(CONSOLIDATE_START + 0.03, CONSOLIDATE_END, t) *
    (1 - smoothstep(DISSIPATE_START, DISSIPATE_END, t))
  );
}

// Hairline callouts: draw in just before the beat centre, fade out toward
// the window edges.
export function calloutPhase(
  beat: number,
  t: number
): { opacity: number; draw: number } {
  const c = beatCenter(beat);
  const rise = beat === 0 ? 1 : smoothstep(c - 0.05, c - 0.02, t);
  const fall =
    beat === BEAT_COUNT - 1 ? 1 : 1 - smoothstep(c + 0.02, c + 0.05, t);
  const opacity = clamp01(Math.min(rise, fall));
  const draw = beat === 0 ? 1 : smoothstep(c - 0.055, c - 0.005, t);
  return { opacity, draw: clamp01(Math.min(draw, fall > 0 ? 1 : 0)) };
}

// Static line-art opacities, one per fabric beat.
function beatArt(beat: number, t: number): number {
  const c = beatCenter(beat);
  const rise = smoothstep(c - 0.05, c - 0.02, t);
  const fall =
    beat === BEAT_COUNT - 1 ? 1 : 1 - smoothstep(c + 0.02, c + 0.05, t);
  return clamp01(Math.min(rise, fall));
}

export function silhouetteOpacity(t: number): number {
  return beatArt(7, t);
}
export function mirrorArtOpacity(t: number): number {
  return beatArt(8, t);
}
export function fotaArtOpacity(t: number): number {
  return beatArt(9, t);
}

// ---------- Camera ----------

export interface TourPose {
  position: Vec3;
  target: Vec3;
}

// Time-keyed keyframes at beat centres (native model coordinates; device
// centre is roughly [0.09, 0.02, 0.085]). Eased with smoothstep between
// neighbours; the aspect dolly in the canvas keeps narrow screens framed.
const CAMERA_KEYFRAMES: { t: number; pose: TourPose }[] = [
  // 01 hero: assembled, front three-quarter, screen prominent.
  { t: 0, pose: { position: [0.34, 0.16, 0.46], target: [0.09, 0.02, 0.085] } },
  // 02 over the opened cavity: orin + the first sheet.
  {
    t: 1 / 9,
    pose: { position: [0.12, 0.2, 0.34], target: [0.082, 0.06, 0.058] },
  },
  // 03 orbit right, slightly closer.
  {
    t: 2 / 9,
    pose: { position: [0.21, 0.14, 0.24], target: [0.082, 0.065, 0.058] },
  },
  // 04 orbit to the left side.
  {
    t: 3 / 9,
    pose: { position: [-0.03, 0.13, 0.22], target: [0.082, 0.06, 0.058] },
  },
  // 05 lower and closer: the lowest sheet, just off the silicon.
  {
    t: 4 / 9,
    pose: { position: [0.13, 0.12, 0.26], target: [0.082, 0.05, 0.058] },
  },
  // 06 high three-quarter: slab on the orin, floated panels at frame edge.
  {
    t: 5 / 9,
    pose: { position: [0.3, 0.2, 0.34], target: [0.09, 0.04, 0.09] },
  },
  // 07 the dive: orin fills the card.
  {
    t: 6 / 9,
    pose: { position: [0.11, 0.05, 0.14], target: [0.082, 0.0075, 0.0575] },
  },
  // 08 reassembled; target shifted +x so the trunk sits left-of-card.
  {
    t: 7 / 9,
    pose: { position: [0.4, 0.14, 0.52], target: [0.14, 0.02, 0.085] },
  },
  // 09 small and low: target above the device pushes it down-frame.
  {
    t: 8 / 9,
    pose: { position: [0.42, 0.2, 0.62], target: [0.09, 0.1, 0.085] },
  },
  // 10 settled hero.
  { t: 1, pose: { position: [0.36, 0.16, 0.48], target: [0.09, 0.02, 0.085] } },
];

function lerpVec(a: Vec3, b: Vec3, p: number): Vec3 {
  return [
    a[0] + (b[0] - a[0]) * p,
    a[1] + (b[1] - a[1]) * p,
    a[2] + (b[2] - a[2]) * p,
  ];
}

export function tourCameraPose(t: number): TourPose {
  const c = clamp01(t);
  if (c >= 1) return CAMERA_KEYFRAMES[CAMERA_KEYFRAMES.length - 1].pose;
  let i = 0;
  while (c >= CAMERA_KEYFRAMES[i + 1].t) i++;
  const a = CAMERA_KEYFRAMES[i];
  const b = CAMERA_KEYFRAMES[i + 1];
  const p = smoothstep(a.t, b.t, c);
  return {
    position: lerpVec(a.pose.position, b.pose.position, p),
    target: lerpVec(a.pose.target, b.pose.target, p),
  };
}

// ---------- Anchors and callouts ----------

export type AnchorId =
  | 'display'
  | 'orin'
  | 'front'
  | 'trunk'
  | 'slab'
  | 'sheet0'
  | 'sheet1'
  | 'sheet2'
  | 'sheet3';

// Measured body centres (see the optimize script's world-baked geometry).
const DISPLAY_CENTER: Vec3 = [0.086, 0.0075, 0.1158];
const FRONT_CENTER: Vec3 = [0.0895, 0.0079, 0.1205];
const ORIN_CENTER: Vec3 = [0.0821, 0.0075, 0.0575];
const TRUNK_CENTER: Vec3 = [0.09, 0.01, 0.085];

export function anchorWorld(id: AnchorId, t: number): Vec3 {
  const open = openFactor(t);
  switch (id) {
    case 'display': {
      const v = EXPLODE_VECTORS.display;
      return [
        DISPLAY_CENTER[0] + v[0] * open,
        DISPLAY_CENTER[1] + v[1] * open,
        DISPLAY_CENTER[2] + v[2] * open,
      ];
    }
    case 'front': {
      const v = EXPLODE_VECTORS['enclosure-front'];
      return [
        FRONT_CENTER[0] + v[0] * open,
        FRONT_CENTER[1] + v[1] * open,
        FRONT_CENTER[2] + v[2] * open,
      ];
    }
    case 'orin':
      return ORIN_CENTER;
    case 'trunk':
      return TRUNK_CENTER;
    case 'slab':
      return [SHEET_X, SLAB_Y, SHEET_Z];
    default: {
      const sheet = Number(id.slice(5));
      return [SHEET_X, sheetState(sheet, t).y, SHEET_Z];
    }
  }
}

export interface AnchorScreenPoint {
  x: number;
  y: number;
  visible: boolean;
}
export type AnchorScreenMap = Partial<Record<AnchorId, AnchorScreenPoint>>;

export interface TourCallout {
  beat: number;
  anchor: AnchorId;
  label: string;
  // Label offset from the projected anchor, in card px.
  dx: number;
  dy: number;
}

export const TOUR_CALLOUTS: TourCallout[] = [
  {
    beat: 0,
    anchor: 'display',
    label: 'VOICE · TACTILE · SCREEN',
    dx: -170,
    dy: -90,
  },
  {
    beat: 1,
    anchor: 'sheet0',
    label: 'PII · LOCAL INFERENCE ONLY',
    dx: 150,
    dy: -70,
  },
  {
    beat: 2,
    anchor: 'sheet1',
    label: 'CAPTURE → SEALED CHUNKS',
    dx: -190,
    dy: -80,
  },
  {
    beat: 3,
    anchor: 'sheet2',
    label: 'GRAPH · BLOBS · INDEXES',
    dx: 150,
    dy: -70,
  },
  {
    beat: 4,
    anchor: 'sheet3',
    label: 'KEYS ARE MINTED HERE. THEY NEVER LEAVE.',
    dx: -60,
    dy: -120,
  },
  {
    beat: 5,
    anchor: 'slab',
    label: 'ONE GOVERNED IMAGE · VERIFIED BOOT',
    dx: -110,
    dy: -80,
  },
  {
    beat: 5,
    anchor: 'front',
    label: 'DISCONNECT SWITCH · HARDWARE TRUTH',
    dx: 150,
    dy: -60,
  },
  { beat: 6, anchor: 'orin', label: 'ROOT OF TRUST', dx: -150, dy: -110 },
  {
    beat: 7,
    anchor: 'trunk',
    label: 'VERSION VECTORS · NO COORDINATOR',
    dx: -30,
    dy: 130,
  },
  {
    beat: 9,
    anchor: 'trunk',
    label: 'SIGNED A/B IMAGES · MODEL WEIGHTS',
    dx: -160,
    dy: -120,
  },
];
