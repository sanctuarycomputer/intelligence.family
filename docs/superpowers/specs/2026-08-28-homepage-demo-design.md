# Homepage demo — design

One scripted 25-second sequence on `intelligence.family`. A labelled drawing of
the hardware, a play control, then three questions asked and answered, with the
device visibly producing each answer. The narrative script is
`docs/homepage-demo-script.md`; this document is how it gets built.

## Decisions taken in brainstorming

1. **One label system.** The same DOM leader-line label names hardware parts in
   the idle state and artifacts on the device screen during the demo. One
   component, two phases.
2. **One card per exchange.** The device shows a single artifact, landing
   cleanly. A thinking indicator occupies the activity chip's row during the
   search. No rifling through files.
3. **Mobile keeps the device behind the phone.** Below 1024px the device renders
   dimmed behind the phone with no camera move. The artifact card is therefore
   decorative on small screens; accepted as the cost of one code path.
4. **The demo stops.** It parks at the end with the thread intact and a replay
   control. Nothing resets on its own.
5. **One rAF clock, pure state derivation.** Below.

## Architecture

### The clock is the only source of truth

`stateAt(t): DemoState` is a pure function. Camera, explode amount, card
position, thinking, which labels exist, how many messages are visible, whether
the typing bubble is up — all of it is derived from one number.

This is what keeps the load-bearing beat honest. The device starts thinking
400ms before the phone shows its typing bubble; that ordering is the argument
the demo makes, and two independent timers would eventually blur it. Read from
the same `t` in the same frame, it cannot drift.

It also means scrubbing is `seek(t)`, replay is `seek(0)`, and reduced motion is
`seek(END)`. None of those need their own code path.

### React renders at stage boundaries, not at 60fps

`DemoState` splits by consumer:

- **Continuous** (`camera`, `explode`, `cardY`, `t`) is read by the WebGL render
  loop each frame and never enters React.
- **Discrete** (`phase`, `thinking`, `card`, `cardState`, `labels`,
  `visibleMessages`, `typing`) is what React needs. The clock notifies
  subscribers only when a discrete value actually changes, which is roughly a
  dozen renders across the whole run instead of ~1,500.

Label screen positions are the awkward case: they change every frame but live in
the DOM. They are written directly to element `transform` via refs from a
dedicated rAF loop, never through React state.

### Module stores, not context

The existing `deviceControls.ts` pattern — a mutable module object read per
frame — already works and is what the debug panel writes to. Two more follow it:

| Store | Written by | Read by |
|---|---|---|
| `demoClock.ts` | play/replay/hover, its own rAF | `DeviceScene` per frame, React on stage change |
| `sceneProjection.ts` | `DeviceScene` per frame | `SceneLabels` per frame |

`sceneProjection` holds each label anchor's projected screen position and
whether it faces the camera. `SceneLabels` reads it in its own rAF and writes
transforms. One frame of lag is possible and invisible: labels are only on
screen while the camera is stationary.

## Files

```
components/demo/
  timeline.ts         cue data: keyframes, exchange offsets, END
  demoState.ts        stateAt(t) -> DemoState, pure. Unit tested.
  demoClock.ts        rAF clock, play/replay/seek/hover, subscriptions
  sceneProjection.ts  anchor id -> projected screen point
  SceneLabels.tsx     DOM labels + SVG leader lines
  DemoControls.tsx    play / replay affordance
components/thread/
  threadScript.ts     the messages as data
  bubbles.tsx         presentational bubble components
components/device/
  DeviceScene.tsx     + explode, camera from clock, anchor projection
  screenCards.ts      the three artifact cards, drawn to canvas
  screenTexture.ts    + card compositing, thinking in the chip row
  deviceControls.ts   unchanged (still the debug panel's surface)
components/MessageThread.tsx   staged rendering, autoscroll, typing bubble
```

`MessageThread.tsx` is 347 lines of hand-written JSX with no state. Splitting the
messages into data and the bubbles into components is required to stage them at
all, and leaves the file readable afterwards.

## Timeline

Absolute seconds. `END = 24.6`.

| t | Event |
|---|---|
| 0.00 | Orin slides into the trunk (0.6s), leaf seats if not already |
| 0.10 | Hero labels fade out (0.2s) |
| 0.60 | Camera moves to resting position (1.4s) |
| 1.30 | Phone slides up (0.7s) |
| 2.60 | Exchange 1 begins |
| 9.10 | Exchange 2 begins |
| 15.60 | Exchange 3 begins |
| 23.10 | Last reply settled |
| 23.60 | Replay control fades in |
| 24.60 | END |

Each exchange runs the same offsets from its start `E`:

| Offset | Event |
|---|---|
| +0.00 | Question bubble appears |
| +0.30 | Transcript or receipt line |
| +0.55 | Device thinking on |
| +0.95 | Phone typing bubble on |
| +2.00 | Thinking off, card slides up (0.45s) |
| +2.45 | Artifact label snaps on |
| +2.75 | Typing bubble becomes the reply |
| +3.05 | Attribution line |
| +3.40 | Trailing element (audio snippet, or the email's sent state) |
| +6.20 | Card slides down — exchanges 1 and 2 only |

Exchanges 1 and 2 run 6.5s. Exchange 3 runs 7.5s: the compose card holds an extra
second so a viewer can read who it is addressed to before it sends.

Exchange 3's card never slides down. The demo parks with it still on screen,
which is what the chosen ending requires — the last thing the device did stays
visible next to the thread that resulted from it.

## Labels

```ts
type LabelSpec = {
  id: string;
  text: string;
  sub?: string;
  anchor: PartAnchor | ScreenAnchor;
};
type PartAnchor = { kind: 'part'; node: string; offset?: [number, number, number] };
type ScreenAnchor = { kind: 'screen'; u: number; v: number };
```

`PartAnchor` targets a node in the GLB. `ScreenAnchor` targets a point in the
device screen's own UV space, which `DeviceScene` already computes as part of the
aperture mapping, so an artifact label can point at a spot on the card.

Idle labels: Family Leaf (`leaf`), Family Trunk (`enclosure-front`), On-board GPU
(`orin`), Speaker (`enclosure-front`, offset to the grille), Touchscreen
(`display`).

Artifact labels: `gp-summary.pdf`, `maire-1971.m4a`, `gmail · compose` becoming
`gmail · sent`. Each names the same source the phone's attribution line cites, so
the two halves of the screen corroborate each other.

## Screen cards

`screenCards.ts` draws three card kinds into the same canvas as the lock screen,
translated by `cardY` (0 offscreen, 1 settled):

- `record` — a document: heading, name, three lines of findings, a dated review.
- `audio` — a waveform with a playhead that advances with `t`, name and date.
- `email` — a compose window: recipients, subject, body. Its header switches from
  `New message` to `Sent · 9:41` when `cardState` flips.

The thinking indicator moves from the bottom-left corner into the activity chip's
row, so the screen composition does not jump when the device starts working.

## Error handling

The GLB, the screen assets and WebGL itself can all fail. Every one of them
degrades to the same place: `DeviceSceneMount` renders nothing, and the page is
the text column plus the phone. The demo controls only mount once the scene
reports ready, so there is never a play button that does nothing.

`prefers-reduced-motion` holds the idle state still and, on play, seeks straight
to `END`. The content is reachable; the motion is not imposed.

## Testing

`stateAt` is the whole risk surface and it is pure, so it is directly testable:

- Boundary times for every cue: one frame before and after each transition.
- Monotonicity: `visibleMessages` never decreases as `t` increases.
- The ordering guarantee: for every exchange, `thinking` turns on strictly before
  `typing` does.
- `stateAt(END)` equals the state reduced-motion jumps to.
- Clamping outside `[0, END]`.

`threadScript.ts` gets a test that every reply carries an attribution and every
exchange has exactly one outbound question, which is what stops the copy and the
timeline drifting apart.

## Debug

`?debug=true` gains a stage scrubber: a range over `[0, END]` that calls
`seek()`, plus buttons to jump to each exchange. The existing device panel
continues to write `deviceControls` for camera and material tuning; while the
demo is playing the clock owns the camera and the panel's camera sliders are
disabled rather than silently ignored.
