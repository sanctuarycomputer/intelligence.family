import LeafIcon from '@/components/LeafIcon';
import DebugCopyEditorMount from '@/components/DebugCopyEditorMount';
import DeviceDebugControlsMount from '@/components/DeviceDebugControlsMount';
import DeviceDemo from '@/components/demo/DeviceDemo';
import DemoControls from '@/components/demo/DemoControls';
import DemoDismiss from '@/components/demo/DemoDismiss';

/**
 * The front door. Deliberately sparse: no images, no navigation, no client JS
 * to speak of. The research lives at /research, and everything else about the
 * company is told by asking.
 *
 * Spacing lives on wrapper divs, never on the p/h4 themselves: globals.css
 * zeroes their margins outside any cascade layer, which beats Tailwind's
 * layered mt-* utilities.
 */
export default function Home() {
  return (
    <>
      {/* The whole demo as a full-viewport layer. The device is positioned by
          the camera, not by CSS, so the intro can move it without touching
          layout. The labels are DOM over the top of it, because they name the
          hardware and that should be selectable and legible to a screen
          reader. */}
      <DeviceDemo className="demo-stage-page" />
      <DemoDismiss />

      <main className="relative z-10 min-h-screen px-6 py-24 md:px-20 md:py-32">
        <div className="flex flex-col gap-16 lg:flex-row lg:items-center lg:gap-24">
          <div className="masthead max-w-[620px] shrink-0">
            <h1 style={{ fontSize: 'clamp(38px, 6vw, 62px)' }}>
              Family<span className="tracking-[-0.1em]"> </span>
              <span className="relative inline-block">
                Intelligence
                <LeafIcon
                  className="absolute"
                  style={{
                    width: '0.35em',
                    height: '0.4em',
                    top: '-0.05em',
                    right: '-0.35em',
                  }}
                />
              </span>
            </h1>

            <div className="mt-5">
              <DemoControls />
            </div>

            <div>
              <div className="mt-12">
                <h4>About</h4>
              </div>

              <div className="mt-4">
                <p>
                  The GPU is coming home. Compute has made this trip before: 8%
                  of American households owned a computer in 1984, and 89% did
                  by 2016. The datacenter is making the same move.
                </p>

                <p>
                  Family Intelligence, Inc. builds privacy-preserving AI
                  hardware devices for the home, office and beyond. Inference
                  never leaves the device. Novel networking protocols and
                  zero-knowledge encryption patterns give private cloud-level
                  convenience. A local MCP server and on-device agent offer
                  general intelligence to every IoT device on the network.
                </p>

                <p>
                  We&rsquo;re starting with families because we have the only
                  culturally viable architecture for storing family context.
                  LLMs can reduce friction in the rhythm of family life, but
                  only if families feel safe using them. Your family&rsquo;s
                  health history, your finances, your will, your kids&rsquo;
                  school calendar, your grandmother&rsquo;s voice. All precious
                  data you&rsquo;d never upload to cloud AI. Exactly what an
                  agentic home assistant needs to be helpful.
                </p>

                <p>
                  Our first devices go to a small private group of families in
                  San Francisco and New York. They are not for sale and we are
                  not taking orders. If you can help us hone our vision, write
                  and tell us how.
                </p>
              </div>

              <div className="mt-12">
                <h4>Contact</h4>
              </div>

              <div className="mt-4">
                <p>
                  San Francisco &amp; New York City
                  <br />
                  Email:{' '}
                  <a
                    href="mailto:invest@intelligence.family"
                    className="underline hover:no-underline text-fi-green-500"
                  >
                    invest@intelligence.family
                  </a>
                </p>
              </div>

              <div className="mt-12">
                <h4>Research</h4>
              </div>

              <div className="mt-4">
                <p>
                  Our research on local AI in the home, published in partnership
                  with the Mozilla Foundation, is{' '}
                  <a
                    href="/research"
                    className="underline hover:no-underline text-fi-green-500"
                  >
                    here
                  </a>
                  .
                </p>
              </div>

              <div className="mt-24">
                <p className="text-sm text-fi-black-900/70">
                  By{' '}
                  <a
                    href="https://usb.club"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:no-underline"
                  >
                    USB Club
                  </a>{' '}
                  and{' '}
                  <a
                    href="https://garden3d.net"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:no-underline"
                  >
                    garden3d
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <DebugCopyEditorMount scope="main" pageName="" />
      <DeviceDebugControlsMount />
    </>
  );
}
