import DeviceSceneMount from '@/components/device/DeviceSceneMount';
import OrbitSurface from '@/components/device/OrbitSurface';
import MessageThread from '@/components/MessageThread';
import SceneLabels from './SceneLabels';

/**
 * The whole demo, in one box.
 *
 * Everything inside positions itself absolutely, so the block fills whatever
 * the host gives it: a fixed full-viewport layer on the homepage, a grid cell
 * on a deck slide. The camera already fits the model to its canvas, so a
 * smaller box needs no new numbers.
 *
 * The play control deliberately stays outside. It belongs with the host's own
 * copy, under the wordmark on the homepage and under the subtitle on a slide,
 * rather than floating over the device.
 *
 * One per page. demoClock is a module store, so two of these would drive the
 * same clock and fight over it.
 */
export default function DeviceDemo({ className }: { className?: string }) {
  return (
    <div className={`demo-stage${className ? ` ${className}` : ''}`}>
      <DeviceSceneMount className="demo-scene" />
      <SceneLabels />
      <OrbitSurface />
      <MessageThread />
    </div>
  );
}
