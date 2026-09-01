import { describe, expect, it } from 'vitest';
import { discreteKey, idleState, stateAt } from '@/components/demo/demoState';
import {
  BEAT,
  CHECKOUT,
  END,
  INTRO,
  EXCHANGES,
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
  });

  /* The drift outlasts the first question now. That is deliberate — the
     opening is slow on purpose and the conversation starts early on purpose —
     but the device must be nearly home by then rather than still crossing the
     screen while messages arrive, and it must be done before the second
     question. */
  it('is most of the way home before the first question, and done before the second', () => {
    expect(stateAt(EXCHANGES[0].start).cameraProgress).toBeGreaterThan(0.8);
    expect(stateAt(EXCHANGES[1].start).cameraProgress).toBe(1);
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
    expect(stateAt(END).attributed).toBe(
      THREAD.filter(e => e.kind === 'reply').length
    );
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
  /* Attribution is about to stop being an exchange-level fact and become a
     per-reply one, because the commerce exchange has two replies. These are
     the exact seconds it fires on today. They must survive that rewrite
     untouched: if this test needs editing to pass, the rewrite is wrong. */
  it('attributes each reply 0.3s after it lands', () => {
    const lag = BEAT.attribution - BEAT.reply;
    expect(lag).toBeCloseTo(0.3, 10);

    for (const [i, ex] of EXCHANGES.entries()) {
      const due = ex.start + BEAT.reply + lag;
      expect(stateAt(due - EPS).attributed, ex.id).toBe(i);
      expect(stateAt(due).attributed, ex.id).toBe(i + 1);
    }
  });

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

  /* The flip is a property of the exchange that does it, not of a card kind
     matched by name. The commerce card is about to be the last one up and it
     never flips, so an unconditional `cardSent = true` in the park branch
     would light a "sent" label on a basket. */
  it('only flips a card whose exchange says when', () => {
    for (const ex of EXCHANGES) {
      const settled = stateAt(ex.start + BEAT.label + EPS);
      if (ex.sentAt === undefined) {
        expect(settled.cardSent, ex.id).toBe(false);
        expect(stateAt(ex.start + ex.duration - EPS).cardSent, ex.id).toBe(
          false
        );
      } else {
        expect(stateAt(ex.start + ex.sentAt - EPS).cardSent, ex.id).toBe(false);
        expect(stateAt(ex.start + ex.sentAt).cardSent, ex.id).toBe(true);
      }
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

  it('renames the email label when it sends', () => {
    const teachers = EXCHANGES.find(e => e.id === 'teachers')!;
    const composing = stateAt(teachers.start + BEAT.label + EPS);
    expect(composing.labels[0].text).toBe('gmail · compose');
    expect(composing.cardSent).toBe(false);

    const sent = stateAt(teachers.start + BEAT.trailing + EPS);
    expect(sent.labels[0].text).toBe(SENT_LABEL);
    expect(sent.cardSent).toBe(true);
  });

  it('shows at most one label at a time, and only artifacts', () => {
    for (let t = 0; t <= END; t += 0.02) {
      const { labels } = stateAt(t);
      expect(labels.length, `t=${t.toFixed(2)}`).toBeLessThanOrEqual(1);
      for (const l of labels) expect(l.id.startsWith('artifact-')).toBe(true);
    }
  });

  /* The phone's rise is a boolean because the exit has to ease too. Replay
     drops it back to false, and CSS carries the phone away. */
  it('raises the phone from the very first frame', () => {
    // No delay: held back at all, it reads as waiting for the device to get
    // out of the way before daring to appear.
    expect(INTRO.phoneStart).toBe(0);
    expect(stateAt(0).phoneUp).toBe(true);
    expect(stateAt(END).phoneUp).toBe(true);
    // But not before play is pressed.
    expect(idleState().phoneUp).toBe(false);
  });

  it('starts the phone no later than the camera', () => {
    expect(INTRO.phoneStart).toBeLessThanOrEqual(INTRO.cameraStart);
    // And is settled well before the first question arrives.
    expect(INTRO.phoneStart + INTRO.phoneDur).toBeLessThan(EXCHANGES[0].start);
  });

  /* The scene fades the visitor's own orbit out against this, so a held camera
     angle and the opening drift never fight over the same frame. */
  it('reports camera progress from nothing to done, once', () => {
    expect(stateAt(0).cameraProgress).toBe(0);
    expect(stateAt(END).cameraProgress).toBe(1);
    expect(idleState().cameraProgress).toBe(0);

    let last = 0;
    for (let t = 0; t <= END; t += 0.02) {
      const next = stateAt(t).cameraProgress;
      expect(next).toBeGreaterThanOrEqual(last - 1e-9);
      last = next;
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

    // Arrived by the time the drift's window closes, and unmoving after.
    const settled = INTRO.cameraStart + INTRO.cameraDur;
    expect(stateAt(settled).camera).toEqual(b);
    expect(stateAt(settled + 1).camera).toEqual(b);

    // Most of the remaining travel is gone by the first question: within a
    // fifth of the total distance, so it reads as arriving rather than moving.
    const travel = Math.abs(b.dist - a.dist);
    expect(
      Math.abs(stateAt(EXCHANGES[0].start).camera.dist - b.dist)
    ).toBeLessThan(travel * 0.2);
  });
});

describe('idleState', () => {
  it('is a still frame: nothing of the demo has happened yet', () => {
    const idle = idleState();
    expect(idle.labels).toHaveLength(0);
    expect(idle.visibleMessages).toBe(0);
    expect(idle.phoneUp).toBe(false);
    expect(idle.card).toBe(null);
    expect(idle.thinking).toBe(false);
    expect(idle.showReplay).toBe(false);
  });

  it('is constant, so the render loop can cache it', () => {
    expect(idleState()).toEqual(idleState());
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
    // Budget raised from 40 to 55 for the commerce exchange: a sheet, a paid
    // flag and two tap ripples are legitimate new discrete states, and 46
    // measured across the run is still ~1.4 renders/second — comfortably
    // inside the "dozens, not ~1,500" intent this guard exists for (see
    // demoClock's header comment). If this ever needs raising again, that is
    // the signal to look for: discreteKey has picked up something continuous.
    expect(keys.size).toBeLessThan(55);
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
    // By id rather than by count: a bare count only ever pinned an accident
    // of how many exchanges existed when it was written. Naming a3 and
    // a4-paid pins what this test is actually about — a receipt for
    // something the box did reads differently from a citation of a record.
    const replies = THREAD.filter(e => e.kind === 'reply');
    const actionIds = replies
      .filter(r => r.attributionKind === 'action')
      .map(r => r.id);
    expect(actionIds).toEqual(['a3', 'a4-paid']);
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

describe('the commerce exchange', () => {
  const ex = () => EXCHANGES.find(e => e.id === 'booklist')!;
  const at = (offset: number) => ex().start + offset;

  it('is the last exchange, and the one the demo parks on', () => {
    expect(EXCHANGES[EXCHANGES.length - 1].id).toBe('booklist');
    expect(ex().keepCard).toBe(true);
    expect(EXCHANGES.find(e => e.id === 'teachers')!.keepCard).toBeUndefined();
  });

  it('parks on the basket, unflipped', () => {
    const parked = stateAt(END);
    expect(parked.card).toBe('basket');
    expect(parked.cardSent).toBe(false);
    expect(parked.cardY).toBe(1);
    expect(parked.sheetUp).toBe(false);
  });

  it('raises the sheet only between its cues', () => {
    expect(stateAt(at(CHECKOUT.sheetUp) - EPS).sheetUp).toBe(false);
    expect(stateAt(at(CHECKOUT.sheetUp)).sheetUp).toBe(true);
    expect(stateAt(at(CHECKOUT.sheetDown) - EPS).sheetUp).toBe(true);
    expect(stateAt(at(CHECKOUT.sheetDown)).sheetUp).toBe(false);
  });

  it('pays partway through, and stays paid while the sheet leaves', () => {
    expect(stateAt(at(CHECKOUT.paid) - EPS).sheetPaid).toBe(false);
    expect(stateAt(at(CHECKOUT.paid)).sheetPaid).toBe(true);
    // Still paid as it slides away: flipping back mid-exit reads as a refund.
    expect(stateAt(at(CHECKOUT.sheetDown) + EPS).sheetPaid).toBe(true);
  });

  /* The taps are the only thing standing in for a finger. Each is a brief
     window, and they never overlap: two ripples at once reads as a glitch. */
  it('ripples once on the link and once on the pay button', () => {
    expect(stateAt(at(CHECKOUT.linkTap) - EPS).tap).toBe(null);
    expect(stateAt(at(CHECKOUT.linkTap)).tap).toBe('checkout');
    expect(stateAt(at(CHECKOUT.linkTap) + CHECKOUT.tapDur).tap).toBe(null);
    expect(stateAt(at(CHECKOUT.payTap)).tap).toBe('pay');
    expect(stateAt(at(CHECKOUT.payTap) + CHECKOUT.tapDur).tap).toBe(null);
  });

  it('taps the link before the sheet arrives, and pays before it leaves', () => {
    expect(CHECKOUT.linkTap).toBeLessThan(CHECKOUT.sheetUp);
    expect(CHECKOUT.sheetUp + CHECKOUT.sheetDur).toBeLessThan(CHECKOUT.payTap);
    expect(CHECKOUT.payTap).toBeLessThan(CHECKOUT.paid);
    expect(CHECKOUT.paid).toBeLessThan(CHECKOUT.sheetDown);
    expect(CHECKOUT.sheetDown + CHECKOUT.sheetDownDur).toBeLessThan(
      ex().duration
    );
  });

  it('never raises the sheet during any other exchange', () => {
    for (let t = 0; t < ex().start; t += 0.02) {
      expect(stateAt(t).sheetUp, `t=${t.toFixed(2)}`).toBe(false);
      expect(stateAt(t).tap, `t=${t.toFixed(2)}`).toBe(null);
    }
  });

  it('runs 34 seconds', () => {
    expect(END).toBeCloseTo(34, 10);
  });

  it('sends a checkout link, then a receipt, in that order', () => {
    const own = THREAD.filter(e => e.exchange === 'booklist');
    expect(own.map(e => e.id)).toEqual([
      'q4',
      'a4',
      'a4-link',
      'a4-paid',
      'a4-tracking',
    ]);
    expect(own.map(e => e.kind)).toEqual([
      'out',
      'reply',
      'checkoutLink',
      'reply',
      'trackingLink',
    ]);
  });

  /* The link has to be on screen before a tap lands on it, and the receipt
     must not arrive until the sheet has gone. */
  it('sequences the bubbles around the sheet', () => {
    const due = (id: string) => {
      const entry = THREAD.find(e => e.id === id)!;
      return at(BEAT[entry.beat]);
    };
    expect(due('a4-link')).toBeLessThanOrEqual(at(CHECKOUT.linkTap));
    expect(due('a4-paid')).toBeGreaterThan(
      at(CHECKOUT.sheetDown + CHECKOUT.sheetDownDur)
    );
    expect(due('a4-tracking')).toBeGreaterThan(due('a4-paid'));
  });

  it('cites the supply list, then reports the payment as an action', () => {
    const first = THREAD.find(e => e.id === 'a4')!;
    const second = THREAD.find(e => e.id === 'a4-paid')!;
    expect(first.kind === 'reply' && first.attributionKind).toBe('source');
    expect(second.kind === 'reply' && second.attributionKind).toBe('action');
  });

  /* Both of this exchange's replies get their citation, which is the whole
     reason attribution stopped being an exchange-level count in Task 1. */
  it('attributes both of its replies', () => {
    expect(stateAt(END).attributed).toBe(
      THREAD.filter(e => e.kind === 'reply').length
    );
    expect(stateAt(END).attributed).toBe(5);
  });
});
