import { describe, expect, it } from 'vitest';
import { discreteKey, idleState, stateAt } from '@/components/demo/demoState';
import {
  BEAT,
  END,
  INTRO,
  EXCHANGES,
  HERO_LABELS,
  REPLAY_AT,
  SENT_LABEL,
} from '@/components/demo/timeline';
import { THREAD } from '@/components/thread/threadScript';

/** A hair either side of a cue, to pin the exact frame it fires on. */
const EPS = 0.01;

describe('stateAt', () => {
  it('clamps outside the run', () => {
    expect(stateAt(-5)).toEqual(stateAt(0));
    expect(stateAt(END + 100)).toEqual(stateAt(END));
  });

  /* The device drifts back once, without reversing anywhere along the way. A
     camera that creeps forward mid-move is what reads as a jerk. */
  it('drifts the camera back in one direction only', () => {
    let last = stateAt(0).camera.dist;
    for (let t = 0; t <= INTRO.cameraStart + INTRO.cameraDur; t += 0.02) {
      const next = stateAt(t).camera.dist;
      expect(next).toBeGreaterThanOrEqual(last - 1e-9);
      last = next;
    }
    expect(stateAt(0).camera.dist).toBeLessThan(stateAt(END).camera.dist);
  });

  it('takes its time getting out of the way', () => {
    // Unhurried by construction: if this drops back under two seconds the
    // opening has been made snappy again by accident.
    expect(INTRO.cameraDur).toBeGreaterThan(2);
    // And it is done before the first question arrives.
    expect(INTRO.cameraStart + INTRO.cameraDur).toBeLessThanOrEqual(
      EXCHANGES[0].start
    );
  });

  it('reveals the thread monotonically', () => {
    let last = 0;
    for (let t = 0; t <= END; t += 0.05) {
      const n = stateAt(t).visibleMessages;
      expect(n).toBeGreaterThanOrEqual(last);
      last = n;
    }
  });

  it('shows the whole thread by the end and nothing at the start', () => {
    expect(stateAt(0).visibleMessages).toBe(0);
    expect(stateAt(END).visibleMessages).toBe(THREAD.length);
    expect(stateAt(END).attributed).toBe(EXCHANGES.length);
  });

  it('never reveals an entry before its exchange starts', () => {
    for (const ex of EXCHANGES) {
      const before = stateAt(ex.start - EPS).visibleMessages;
      const owned = THREAD.filter(e => e.exchange === ex.id);
      const upTo = THREAD.length - owned.length;
      // Entries from later exchanges have not appeared either.
      expect(before).toBeLessThanOrEqual(upTo);
    }
  });

  /* The ordering the whole demo exists to make: the box is visibly working
     before the phone admits anything is happening. */
  it('starts the device thinking strictly before the phone types', () => {
    for (const ex of EXCHANGES) {
      expect(stateAt(ex.start + BEAT.think + EPS).thinking).toBe(true);
      expect(stateAt(ex.start + BEAT.think + EPS).typing).toBe(false);
      expect(stateAt(ex.start + BEAT.typing + EPS).typing).toBe(true);
    }
    expect(BEAT.think).toBeLessThan(BEAT.typing);
  });

  it('stops thinking exactly when the card starts rising', () => {
    for (const ex of EXCHANGES) {
      expect(stateAt(ex.start + BEAT.cardUp - EPS).thinking).toBe(true);
      expect(stateAt(ex.start + BEAT.cardUp).thinking).toBe(false);
      expect(stateAt(ex.start + BEAT.cardUp + EPS).cardY).toBeGreaterThan(0);
    }
  });

  it('drops the typing bubble exactly when the reply lands', () => {
    for (const ex of EXCHANGES) {
      expect(stateAt(ex.start + BEAT.reply - EPS).typing).toBe(true);
      expect(stateAt(ex.start + BEAT.reply).typing).toBe(false);
    }
  });

  /* An attribution under a bubble that has not arrived would render as a
     floating citation. The order is fixed by BEAT, so pin it. */
  it('never attributes a reply before the reply is on screen', () => {
    for (let t = 0; t <= END; t += 0.02) {
      const s = stateAt(t);
      const repliesShown = THREAD.slice(0, s.visibleMessages).filter(
        e => e.kind === 'reply'
      ).length;
      expect(s.attributed).toBeLessThanOrEqual(repliesShown);
    }
  });

  it('never shows a typing bubble and a settled reply at once', () => {
    for (let t = 0; t <= END; t += 0.02) {
      const s = stateAt(t);
      if (!s.typing) continue;
      // While typing, the reply for the current exchange must not be visible.
      const current = EXCHANGES.find(
        ex => t >= ex.start && t < ex.start + ex.duration
      );
      expect(current).toBeDefined();
      const replyIndex = THREAD.findIndex(
        e => e.exchange === current!.id && e.beat === 'reply'
      );
      expect(s.visibleMessages).toBeLessThanOrEqual(replyIndex);
    }
  });

  it('keeps the last card up and lets the others fall', () => {
    for (const ex of EXCHANGES) {
      const settled = stateAt(ex.start + BEAT.label + EPS);
      expect(settled.cardY).toBeGreaterThan(0.5);
      expect(settled.card).toBe(ex.card);

      const atEnd = stateAt(ex.start + ex.duration - EPS);
      if (ex.keepCard) {
        expect(atEnd.cardY).toBeGreaterThan(0.9);
      } else {
        expect(atEnd.cardY).toBeLessThan(0.1);
      }
    }
  });

  it('cardY never leaves 0..1', () => {
    for (let t = 0; t <= END; t += 0.02) {
      const { cardY } = stateAt(t);
      expect(cardY).toBeGreaterThanOrEqual(0);
      expect(cardY).toBeLessThanOrEqual(1);
    }
  });

  it('parks on the sent email', () => {
    const parked = stateAt(END);
    expect(parked.card).toBe('email');
    expect(parked.cardSent).toBe(true);
    expect(parked.cardY).toBe(1);
    expect(parked.labels.map(l => l.text)).toContain(SENT_LABEL);
    expect(parked.thinking).toBe(false);
    expect(parked.typing).toBe(false);
  });

  it('renames the email label when it sends', () => {
    const teachers = EXCHANGES.find(e => e.id === 'teachers')!;
    const composing = stateAt(teachers.start + BEAT.label + EPS);
    expect(composing.labels[0].text).toBe('gmail · compose');
    expect(composing.cardSent).toBe(false);

    const sent = stateAt(teachers.start + BEAT.trailing + EPS);
    expect(sent.labels[0].text).toBe(SENT_LABEL);
    expect(sent.cardSent).toBe(true);
  });

  it('shows at most one artifact label at a time', () => {
    // Once the hero labels have gone, only the current artifact is named.
    // Derived from INTRO rather than hardcoded, so retiming the fade does not
    // quietly turn this into an assertion about nothing.
    const after = INTRO.labelsOutStart + INTRO.labelsOutDur;
    for (let t = after; t <= END; t += 0.02) {
      expect(stateAt(t).labels.length, `t=${t.toFixed(2)}`).toBeLessThanOrEqual(
        1
      );
    }
  });

  /* The hero labels fade rather than vanish, which means they outlive the press
     of play by a moment. The group then returns to full opacity, because the
     artifact labels share the overlay and must not inherit that fade. */
  /* The phone's rise is a boolean because the exit has to ease too. Replay
     drops it back to false, and CSS carries the phone away. */
  it('raises the phone once, and only after the camera has started moving', () => {
    expect(stateAt(0).phoneUp).toBe(false);
    expect(stateAt(INTRO.phoneStart - EPS).phoneUp).toBe(false);
    expect(stateAt(INTRO.phoneStart).phoneUp).toBe(true);
    expect(stateAt(END).phoneUp).toBe(true);
    expect(idleState(99).phoneUp).toBe(false);
    // Up before the first question, so it is never mid-rise when one arrives.
    expect(INTRO.phoneStart + INTRO.phoneDur).toBeLessThan(EXCHANGES[0].start);
  });

  it('fades the hero labels out, then hands the overlay back', () => {
    const start = stateAt(0);
    expect(start.labelOpacity).toBe(1);
    expect(start.labels.map(l => l.id)).toEqual(HERO_LABELS.map(l => l.id));

    const mid = stateAt(INTRO.labelsOutStart + INTRO.labelsOutDur / 2);
    expect(mid.labelOpacity).toBeGreaterThan(0);
    expect(mid.labelOpacity).toBeLessThan(1);
    expect(mid.labels).toHaveLength(HERO_LABELS.length);

    const after = stateAt(INTRO.labelsOutStart + INTRO.labelsOutDur + EPS);
    expect(after.labels).toHaveLength(0);
    expect(after.labelOpacity).toBe(1);
  });

  it('never leaves an artifact label invisible', () => {
    for (let t = 0; t <= END; t += 0.02) {
      const s = stateAt(t);
      const artifact = s.labels.some(l => l.id.startsWith('artifact-'));
      if (artifact) expect(s.labelOpacity).toBe(1);
    }
  });

  it('brings the replay control in near the end and not before', () => {
    expect(stateAt(REPLAY_AT - EPS).showReplay).toBe(false);
    expect(stateAt(REPLAY_AT).showReplay).toBe(true);
    expect(stateAt(END).showReplay).toBe(true);
  });

  it('moves the camera from hero to resting once, and holds', () => {
    const a = stateAt(0).camera;
    const b = stateAt(END).camera;
    expect(a.dist).not.toBe(b.dist);
    // Settled well before the first question, and unchanged thereafter.
    expect(stateAt(EXCHANGES[0].start).camera).toEqual(b);
  });
});

describe('idleState', () => {
  it('staggers the labels in and ends with all of them', () => {
    expect(idleState(0).labels).toHaveLength(1);
    expect(idleState(99).labels).toHaveLength(HERO_LABELS.length);
  });

  it('is a still frame: nothing of the demo has happened yet', () => {
    const idle = idleState(99);
    expect(idle.visibleMessages).toBe(0);
    expect(idle.phoneUp).toBe(false);
    expect(idle.card).toBe(null);
    expect(idle.thinking).toBe(false);
    expect(idle.showReplay).toBe(false);
  });

  it('drops the labels on compact viewports', () => {
    expect(idleState(99, true).labels).toHaveLength(0);
  });
});

describe('discreteKey', () => {
  it('ignores continuous motion', () => {
    const a = stateAt(EXCHANGES[0].start + BEAT.cardUp + 0.1);
    const b = stateAt(EXCHANGES[0].start + BEAT.cardUp + 0.2);
    expect(a.cardY).not.toBe(b.cardY);
    expect(discreteKey(a)).toBe(discreteKey(b));
  });

  it('changes when a message arrives', () => {
    const ex = EXCHANGES[0];
    expect(discreteKey(stateAt(ex.start - EPS))).not.toBe(
      discreteKey(stateAt(ex.start + EPS))
    );
  });

  /* The budget the design is spending: React should render a couple of dozen
     times across the whole run, not once a frame. */
  it('changes rarely enough to render through React', () => {
    const keys = new Set<string>();
    for (let t = 0; t <= END; t += 1 / 60) keys.add(discreteKey(stateAt(t)));
    expect(keys.size).toBeLessThan(40);
  });
});

describe('threadScript', () => {
  it('gives every reply an attribution', () => {
    for (const e of THREAD) {
      if (e.kind === 'reply') expect(e.attribution.length).toBeGreaterThan(0);
    }
  });

  /* A citation and a receipt read differently: from "GP summary" is a quote of
     a record, "Sent from your Gmail" is a note about something the box did. */
  it('marks the action reply as an action, not a source', () => {
    const replies = THREAD.filter(e => e.kind === 'reply');
    expect(replies.filter(r => r.attributionKind === 'action')).toHaveLength(1);
  });

  it('gives every exchange exactly one question and one reply', () => {
    for (const ex of EXCHANGES) {
      const owned = THREAD.filter(e => e.exchange === ex.id);
      expect(owned.filter(e => e.beat === 'question')).toHaveLength(1);
      expect(owned.filter(e => e.beat === 'reply')).toHaveLength(1);
    }
  });

  it('names only exchanges that exist', () => {
    const ids = new Set(EXCHANGES.map(e => e.id));
    for (const e of THREAD) expect(ids.has(e.exchange)).toBe(true);
  });

  it('has unique ids', () => {
    expect(new Set(THREAD.map(e => e.id)).size).toBe(THREAD.length);
  });
});
