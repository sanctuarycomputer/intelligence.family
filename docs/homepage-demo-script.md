# Homepage demo script

The device and the phone on `intelligence.family` play a scripted 32-second demo.
A visitor presses play; the camera moves; three questions get asked and answered.
The point of the sequence is that the phone is not the product. Every answer is
visibly produced by the box, from the family's own records, and the third one
has the box take an action out in the world.

This is the script. Timings are targets, not gospel.

---

## Idle — the labelled hero

The first frame is not a paused demo. It is a labelled drawing of the hardware,
and it does the job the About column cannot: it shows that the thing is a
computer, with its own silicon, its own ears and its own voice.

The device sits centre frame, larger than its resting position. No phone. The
screen is awake and ambient — `The O'Hagans / Family Book`, the activity chip,
leaves drifting — so it is alive before anyone touches it.

Two parts are separated out:

- **The Leaf** floats above the trunk, lifted clear of its seat by roughly its
  own height, turning slowly.
- **The Orin** is visible, drawn back and down out of the body.

Five labels come in staggered, about 120ms apart, each on a thin leader line:

| Label | Second line | Anchored to |
|---|---|---|
| Family Leaf | microphone, lifts out and travels | `leaf`, floating |
| Family Trunk | the body | `enclosure-front` |
| On-board GPU | answers are computed here | `orin` |
| Speaker | | the grille on the front face |
| Touchscreen | | `display` |

`On-board GPU` is the one that has to land. It is the whole company in three
words, and it is the only label pointing at a part most people have never seen
inside a home device.

### Hover, then play

On hover, or on tap, or after five seconds of nothing:

- The Leaf dips down and seats itself on the trunk.
- The device shifts a few degrees, as if settling under the weight.
- The labels fade out, leader lines first.

The play control sits below the device from the very first frame and brightens
as the labels go. It is never gated behind a hover — a visitor on a phone, or
one who never moves the pointer, still has an obvious way in. The hover is a
reward, not a gate.

Play control copy, in order of preference:

1. `See it answer`
2. `Play the demo`
3. `Watch a family use it`

I'd take the first. It says what the next 32 seconds contain, and it puts the
device rather than the visitor in the active role.

The page copy on the left stays where it is throughout. Nothing about the demo
disturbs reading the About column.

---

## 0:00–0:03.2 — The reveal

On press, the device closes itself up and gets out of the way:

- The Orin slides back into the trunk over 600ms and hides once it is inside.
  The Leaf is already seated from the hover, or seats now if the visitor went
  straight for the button.
- The camera pulls back and pans so the device settles into its resting spot at
  the top right. 1.6s, eased, no bounce, starting at 0:00.6 so it overlaps the
  Orin's travel.
- At 0:01.5, while the camera is still moving, the phone slides up from the
  bottom edge and settles. The thread is empty: nav bar, leaf avatar, input
  field, nothing else.

The overlaps matter. Run these three in sequence and it reads as three
animations; overlap them and the device appears to assemble itself and step
back in one movement.

---

## The repeating beat

Every exchange runs the same five steps. Only the contents change.

1. **Ask.** The question appears on the phone and the thread scrolls up to keep
   it in view.
2. **Think.** The device screen swaps its activity chip for a thinking
   indicator, about 400ms after the question lands. The phone shows the iMessage
   typing bubble 400ms after that. The box starts working before the phone
   admits anything is happening, which is the correct order and worth the delay.
3. **Show.** A card slides up from the bottom of the device screen and settles
   over the lower two thirds, title block still visible above it. The thinking
   indicator stops as the card arrives.
4. **Answer.** The typing bubble becomes the reply, attribution line included.
5. **Hold.** Long enough to read the reply, then the card slides back down and
   the next question is sent.

---

## 0:02.5–0:10.5 — Family history

**Phone, from the visitor.** A voice note, 0:06, with Apple's transcription
underneath:

> "At the doctor. Do we have family history of glaucoma?"

**Device card.** A GP record, laid out like a document rather than a chat
bubble:

```
GP SUMMARY                    Des O'Hagan
Primary open-angle glaucoma, left eye
Latanoprost 0.005%, nightly
Reviewed by Mr Deasy · 14 Mar 2024
```

**Phone, reply.** Unchanged from what is on the page today:

> Yes. Des has glaucoma in the left eye and he's on drops for it. It came up at
> his eye review with Mr Deasy.
>
> `from "GP summary, Des O'Hagan"`

Opening here is deliberate. It is the least shareable data a family owns, asked
in the one place you cannot look it up.

---

## 0:10.5–0:19 — Grandparents

**Phone, from the visitor.** Typed:

> Ali is asking how Granny & Grandad met?

**Device card.** An audio record, with a waveform and a playhead that moves for
the duration of the beat:

```
RECORDING                     Máire O'Hagan
Crystal Ballroom · 12 Feb 2019 · 0:14
[waveform, playhead advancing]
```

**Phone, reply.** Unchanged:

> At the Crystal Ballroom in Dublin, in 1971. She turned him down twice before
> she danced with him on the third ask.
>
> `from "Máire at the Crystal Ballroom"`

Then the audio snippet bubble, `Máire, 0:14`.

No sound plays. The playhead moves on both the card and the bubble; that is
enough. Audio that starts on its own in an office is a reason to close the tab.

---

## 0:19–0:30 — The email

This replaces the calendar question. The first two exchanges show the box
remembering. This one shows it doing.

**Phone, from the visitor.** Typed:

> Can you email the kids' teachers and ask when the next parent-teacher meeting
> is?

Receipt line underneath, as now: `Delivered to the box in your kitchen`.

**Device card.** A Gmail compose window, filled in and then sent:

```
NEW MESSAGE                              Gmail
To    Ms Boland, Mr Kavanagh
Subj  Parent-teacher meeting

Hi both — when's the next parent-teacher
meeting for Ali and Tom? Thanks, Toni
```

The card lands filled in, holds for about 1.2s so it can be read, then the
send button state changes and the header line becomes `Sent · 9:41`. The hold
is the whole point: a visitor needs time to notice the box knew which school,
which two children, and which two teachers, and wrote to them in the family's
own voice.

**Phone, reply.**

> Sent to Ms Boland and Mr Kavanagh. I'll tell you when they write back.
>
> `sent from your Gmail`

Naming the teachers is doing more work than "Email sent" would. It is the proof
that the box joined three sources — the school, the children, the mail account —
without any of it leaving the kitchen.

---

## 0:30–0:32 — Rest

The scene holds. The device stays where it is, the last card still on its
screen, the full thread readable on the phone. A `Replay` control fades in
where the play button was.

Nothing resets on its own. The thread the visitor just read is the artefact;
wiping it to return to the idle state would throw away the thing they came for.

---

## What the model actually gives us

`public/home/trunk.glb` has seven top-level nodes, which is most of the reason
the labelled state is cheap to build:

| Node | Use |
|---|---|
| `leaf` | the microphone. Its own mesh, so it can lift, turn and seat. |
| `enclosure-front`, `-back`, `-top` | the trunk |
| `display` | the touchscreen |
| `orin` | the Jetson. Currently hidden in `DeviceScene`; the labelled state turns it back on. |
| `ups` | battery backup. Also hidden, and not currently labelled. |

Two consequences:

**There is no speaker mesh.** The speaker is the perforated grille on the front
face, part of `enclosure-front`. Its label has to point at a spot on that face
rather than at a part that can move, so the speaker is the one item in the
drawing that cannot separate out. Fine for a label, worth knowing before anyone
plans an animation for it.

**`ups` is sitting there unused.** A sixth label — `Battery` / `keeps answering
in a power cut` — is a few lines of work and says something no cloud assistant
can. Your call whether six labels is one too many.

---

## Rules the build has to honour

**Reduced motion.** `prefers-reduced-motion` holds the labelled state still —
no turning Leaf, no staggered label entry, everything present at once. Press
play and the finished state appears: device in its resting spot, full thread,
last card on screen. No camera move, no card slides, no typing bubbles. The
demo is content, so it still has to be reachable, just not animated.

**Labels are DOM, not canvas.** Draw them as HTML positioned from the projected
screen coordinates of each anchor, updated per frame. Canvas text at this size
either aliases or costs a second texture, and DOM labels stay selectable and
readable to a screen reader, which matters because these five lines are the only
place the page names the hardware.

**Thread scrolling.** The thread outgrows the phone frame at exchange two. Each
new message scrolls the thread so the newest bubble sits above the input bar.

**Thinking indicator placement.** It takes over the activity chip's row rather
than appearing somewhere new. The screen composition should not jump when the
box starts working; the chip line is already the place where the screen says
what it is doing.

**One timeline, one source of truth.** Camera, blur, screen state, card state
and phone state are all driven from a single stage clock, not from independent
CSS animations. Anything else drifts, and the drift is worst on the beat that
matters — the phone's typing bubble against the device's thinking indicator.

**Debug.** `?debug=true` gets a stage scrubber so any beat can be jumped to
directly. Waiting 19 seconds to check the email card is not a workflow.

---

## Open questions

1. **Autoplay.** My recommendation is that it always waits for the press. It
   keeps the first frame composed, and it does not spend a visitor's battery on
   an animation they did not ask for. Say if you'd rather it started on scroll.
2. **Loop.** Currently: stops, offers replay. The alternative is looping back to
   idle after a long pause.
3. **Mobile.** Below about 900px the device and the phone cannot share the
   viewport. Options are to drop the device and run the thread alone, or to run
   the demo with the device behind the phone and no camera move. The labelled
   hero survives either way, and on a narrow screen it is arguably the better
   half of the whole thing.
6. **Six labels or five.** Whether `ups` gets a `Battery` label, per the model
   notes above.
7. **Does the Leaf come back?** It seats on hover and stays seated for the whole
   demo. An alternative: the voice note in exchange one lights the Leaf up,
   tying the question on the phone to the microphone that would really have
   heard it. Costs nothing, and it is the only moment the two halves of the
   product touch.
4. **Teacher names.** Boland and Kavanagh are inventions. If the seed family in
   `fam-api/fixtures/seeds` already has teachers, use those.
5. **The email body.** Written as Toni would type it, deliberately short. It
   could equally be shown as three lines of a longer draft.
