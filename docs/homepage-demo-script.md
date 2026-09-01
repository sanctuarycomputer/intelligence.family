# Homepage demo script

The device and the phone on `intelligence.family` play a scripted 34-second demo.
A visitor presses play; the camera moves; four questions get asked and answered.
The point of the sequence is that the phone is not the product. Every answer is
visibly produced by the box, from the family's own records, and two of the four
exchanges have the box take an action out in the world rather than only
recalling one: it pays for the school shopping, and later it emails the
teachers.

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

| Label        | Second line                       | Anchored to                  |
| ------------ | --------------------------------- | ---------------------------- |
| Family Leaf  | microphone, lifts out and travels | `leaf`, floating             |
| Family Trunk | the body                          | `enclosure-front`            |
| On-board GPU | answers are computed here         | `orin`                       |
| Speaker      |                                   | the grille on the front face |
| Touchscreen  |                                   | `display`                    |

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

I'd take the first. It says what the next 34 seconds contain, and it puts the
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
  the top right. Eased, no bounce, starting almost immediately so it overlaps
  the Orin's travel.
- The phone slides up from the bottom edge from the very first frame and
  settles a beat and a half later, while the camera is still moving. The
  thread is empty: nav bar, leaf avatar, input field, nothing else.

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

The opening exchange, below, layers a sixth beat on top of this shared five: a
payment. Every other exchange is the box recalling something it already knew;
this one is the box spending real money, and that gets its own moment rather
than folding into "Answer."

---

## 0:02–0:12 — The school shop

**Phone, from the visitor.** Typed:

> Have we ordered everything for the kids' school?

**Device card.** A basket, laid out like a receipt: six items, an Instacart
header, the running total at the foot of the card.

**Phone, reply.**

> Not yet. I've put Ali's and Tom's lists into one basket. Here's a checkout
> link.

Then a tappable checkout link bubble, the way iMessage renders a rich link
preview: merchant, item count, total. The same basket the device card just
showed, because it is the same basket — not two lists that happen to agree.

**The payment.** A tap lands on the checkout link, and an Apple Pay sheet rises
from the bottom of the phone over the dimmed thread: the same items again, the
same total, a Pay button. A second tap lands on Pay; the button flips to a
checkmark. The sheet holds for a moment on the paid state, then slides back
down.

Only once the sheet is fully gone does the second reply land:

> That's paid. It arrives tomorrow before 6pm.
>
> `paid with Apple Pay`

A tracking-link bubble follows: `Track your order`, Instacart's order number
under it. The basket card on the device screen slides away shortly after.

Opening on money is deliberate. It is the loudest possible demonstration that
the box is not just talking: it can act on the family's behalf, with their own
payment method, and it shows its work at every step rather than asking for
blind trust.

---

## 0:12–0:18.5 — Family history

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

**Phone, reply.**

> Yes. Des has glaucoma in the left eye and he's on drops for it. It came up at
> his eye review with Mr Deasy.
>
> `from "GP summary, Des O'Hagan"`

This is the least shareable data a family owns, asked in the one place you
cannot look it up. Following the payment with it is the point: having just
watched the box spend real money competently, the visitor now watches it
handle the family's most private record with the same matter-of-fact
confidence.

---

## 0:18.5–0:25 — Grandparents

**Phone, from the visitor.** Typed:

> Ali is asking how Granny & Grandad met?

**Device card.** An audio record, with a waveform and a playhead that moves for
the duration of the beat:

```
RECORDING                     Máire O'Hagan
Crystal Ballroom · 12 Feb 2019 · 0:14
[waveform, playhead advancing]
```

**Phone, reply.**

> At the Crystal Ballroom in Dublin, in 1971. She turned him down twice before
> she danced with him on the third ask.
>
> `from "Máire at the Crystal Ballroom"`

Then the audio snippet bubble, `Máire, 0:14`.

No sound plays. The playhead moves on both the card and the bubble; that is
enough. Audio that starts on its own in an office is a reason to close the tab.

---

## 0:25–0:34 — The email

The last exchange, and the one the demo parks on. Like the school shop, this
shows the box doing rather than remembering.

**Phone, from the visitor.** Typed:

> Can you email the kids' teachers and ask when the next parent-teacher meeting
> is?

**Device card.** A Gmail compose window, filled in and then sent:

```
NEW MESSAGE                              Gmail
To    Ms Boland, Mr Kavanagh
Subj  Parent-teacher meeting

Hi both — when's the next parent-teacher
meeting for Ali and Tom? Thanks, Toni
```

The card lands filled in, holds long enough to be read, then the header line
becomes `Sent · 9:41`. The hold is the whole point: a visitor needs time to
notice the box knew which school, which two children, and which two teachers,
and wrote to them in the family's own voice.

**Phone, reply.**

> Sent to Ms Boland and Mr Kavanagh. I'll tell you when they write back.
>
> `sent from your Gmail`

Naming the teachers is doing more work than "Email sent" would. It is the proof
that the box joined three sources — the school, the children, the mail account —
without any of it leaving the kitchen.

Unlike every earlier exchange, this card does not slide away. It is the last
thing the box does, so it is the last thing left on screen.

---

## 0:33–0:34 — Rest

The scene holds. The device stays where it is, the sent email still on its
screen, the full thread readable on the phone. A `Replay` control fades in
where the play button was.

Nothing resets on its own. The thread the visitor just read is the artefact;
wiping it to return to the idle state would throw away the thing they came for.

---

## What the model actually gives us

`public/home/trunk.glb` has seven top-level nodes, which is most of the reason
the labelled state is cheap to build:

| Node                               | Use                                                                                 |
| ---------------------------------- | ----------------------------------------------------------------------------------- |
| `leaf`                             | the microphone. Its own mesh, so it can lift, turn and seat.                        |
| `enclosure-front`, `-back`, `-top` | the trunk                                                                           |
| `display`                          | the touchscreen                                                                     |
| `orin`                             | the Jetson. Currently hidden in `DeviceScene`; the labelled state turns it back on. |
| `ups`                              | battery backup. Also hidden, and not currently labelled.                            |

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
last card on screen. No camera move, no card slides, no typing bubbles, no
payment sheet. The demo is content, so it still has to be reachable, just not
animated.

**Labels are DOM, not canvas.** Draw them as HTML positioned from the projected
screen coordinates of each anchor, updated per frame. Canvas text at this size
either aliases or costs a second texture, and DOM labels stay selectable and
readable to a screen reader, which matters because these five lines are the only
place the page names the hardware.

**Thread scrolling.** The thread outgrows the phone frame partway through the
first exchange. Each new message scrolls the thread so the newest bubble sits
above the input bar.

**Thinking indicator placement.** It takes over the activity chip's row rather
than appearing somewhere new. The screen composition should not jump when the
box starts working; the chip line is already the place where the screen says
what it is doing.

**One timeline, one source of truth.** Camera, blur, screen state, card state,
payment sheet and phone state are all driven from a single stage clock, not
from independent CSS animations. Anything else drifts, and the drift is worst
on the beat that matters — the phone's typing bubble against the device's
thinking indicator, or a "paid" reply landing while the payment sheet is still
sliding away.

**Debug.** `?debug=true` gets a stage scrubber so any beat can be jumped to
directly. Waiting half a minute to check the email card is not a workflow.

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
4. **Six labels or five.** Whether `ups` gets a `Battery` label, per the model
   notes above.
5. **Does the Leaf come back?** It seats on hover and stays seated for the whole
   demo. An alternative: the voice note in the family-history exchange lights
   the Leaf up, tying the question on the phone to the microphone that would
   really have heard it. Costs nothing, and it is the only moment the two
   halves of the product touch.
6. **Teacher names.** Boland and Kavanagh are inventions. If the seed family in
   `fam-api/fixtures/seeds` already has teachers, use those.
7. **The email body.** Written as Toni would type it, deliberately short. It
   could equally be shown as three lines of a longer draft.
