import { describe, it, expect } from 'vitest';
import {
  BODY_NAMES,
  EXPLODE_VECTORS,
  STAGGER,
  explodeOffset,
  cameraPose,
  CAMERA_KEYFRAMES,
} from '@/components/trunk/explodeTimeline';

describe('explodeOffset', () => {
  it('is zero for every body at t=0 and below', () => {
    for (const body of BODY_NAMES) {
      expect(explodeOffset(body, 0)).toEqual([0, 0, 0]);
      expect(explodeOffset(body, -1)).toEqual([0, 0, 0]);
    }
  });

  it('equals the full vector for every body at t=1 and above', () => {
    for (const body of BODY_NAMES) {
      expect(explodeOffset(body, 1)).toEqual(EXPLODE_VECTORS[body]);
      expect(explodeOffset(body, 2)).toEqual(EXPLODE_VECTORS[body]);
    }
  });

  it('is strictly between zero and full at the window midpoint', () => {
    for (const body of BODY_NAMES) {
      const { start, end } = STAGGER[body];
      const mid = explodeOffset(body, (start + end) / 2);
      const full = EXPLODE_VECTORS[body];
      const midLen = Math.hypot(...mid);
      const fullLen = Math.hypot(...full);
      expect(midLen).toBeGreaterThan(0);
      expect(midLen).toBeLessThan(fullLen);
    }
  });

  it('is monotonically non-decreasing in magnitude across the window', () => {
    for (const body of BODY_NAMES) {
      let prev = -1;
      for (let t = 0; t <= 1.0001; t += 0.01) {
        const len = Math.hypot(...explodeOffset(body, t));
        expect(len).toBeGreaterThanOrEqual(prev - 1e-9);
        prev = len;
      }
    }
  });

  it('staggers in the approved order: top, leaf, front, display, orin, ups, back', () => {
    const order: (keyof typeof STAGGER)[] = [
      'enclosure-top', 'leaf', 'enclosure-front', 'display', 'orin', 'ups', 'enclosure-back',
    ];
    for (let i = 1; i < order.length; i++) {
      expect(STAGGER[order[i]].start).toBeGreaterThan(STAGGER[order[i - 1]].start);
    }
  });
});

describe('cameraPose', () => {
  it('returns the first keyframe at t<=0 and the last at t>=1', () => {
    expect(cameraPose(0)).toEqual(CAMERA_KEYFRAMES[0].pose);
    expect(cameraPose(-0.5)).toEqual(CAMERA_KEYFRAMES[0].pose);
    const last = CAMERA_KEYFRAMES[CAMERA_KEYFRAMES.length - 1];
    expect(cameraPose(1)).toEqual(last.pose);
    expect(cameraPose(1.5)).toEqual(last.pose);
  });

  it('hits every keyframe exactly at its t', () => {
    for (const kf of CAMERA_KEYFRAMES) {
      const pose = cameraPose(kf.t);
      for (let i = 0; i < 3; i++) {
        expect(pose.position[i]).toBeCloseTo(kf.pose.position[i], 10);
        expect(pose.target[i]).toBeCloseTo(kf.pose.target[i], 10);
      }
    }
  });

  it('interpolates between keyframes', () => {
    const [a, b] = CAMERA_KEYFRAMES;
    const mid = cameraPose((a.t + b.t) / 2);
    expect(mid.position[0]).not.toBe(a.pose.position[0]);
    expect(mid.position[0]).not.toBe(b.pose.position[0]);
  });
});
