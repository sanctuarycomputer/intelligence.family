// Pure data and math for the /fundraising/stack annotated layer tour. No
// three.js imports so it stays trivially unit-testable.
//
// NOTE: this file is covered by the em-dash lint in tests/stack-copy.test.ts.
// Keep comments and copy free of em dashes.
import { smoothstep } from '../trunk/explodeTimeline';

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
