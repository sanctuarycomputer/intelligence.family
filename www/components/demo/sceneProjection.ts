/**
 * Where each label's anchor currently sits on screen.
 *
 * The labels are DOM, not canvas: they need to be selectable and readable to a
 * screen reader, because these lines are the only place the page names the
 * hardware. But what they point at is geometry, so DeviceScene projects each
 * anchor to viewport pixels once a frame and drops the result here.
 *
 * SceneLabels reads it in its own loop and writes transforms. A frame of lag is
 * possible and invisible: labels are only up while the camera is stationary.
 */

export type AnchorPoint = {
  /** Viewport pixels, relative to the scene canvas. */
  x: number;
  y: number;
  /** False when the anchor is behind the camera or off screen. */
  onScreen: boolean;
};

const points = new Map<string, AnchorPoint>();

export function setAnchor(id: string, point: AnchorPoint) {
  points.set(id, point);
}

export function getAnchor(id: string): AnchorPoint | undefined {
  return points.get(id);
}

/** Anchors are keyed by label id, so a removed label leaves no stale point. */
export function clearAnchors() {
  points.clear();
}
