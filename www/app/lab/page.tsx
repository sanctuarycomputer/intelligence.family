import LeafIcon from '@/components/LeafIcon';
import SubscribeForm from '@/components/SubscribeForm';
import DebugCopyEditorMount from '@/components/DebugCopyEditorMount';
import Fpo from './Fpo';
import './lab.css';

/**
 * The lab front door, as a wireframe. Structure and copy are the draft; the
 * grey boxes and dashed rules are not the design.
 *
 * Every piece of copy is its own p, h1-h4 or li so the ?debug=true editor can
 * reach it. Spacing lives in lab.css, which is unlayered and so is not
 * beaten by the margin resets in globals.css.
 */

// One paragraph each, with blank lines between thoughts, so the ?debug=true
// editor treats the whole block as a single editable field.
const CLAIM = [
  'Multiple agents will read & write from a collective archive, and few are talking about how powerful that shared social context will be.',
  'We expect it to be captured and mined the way workplace platforms captured corporate context. Memory is the moat.',
  'We study how groups of people who trust each other can build that context and keep it: on hardware they own, in an archive no company can read.',
].join('\n\n');

const SHARED_POWER = [
  'Coordinating humans is a noble pursuit.',
  'What a group knows together is worth more than what any one member knows alone. Whoever holds that shared context holds the group’s power.',
  'We believe municipalities, community groups, workplaces, organizers, activists and many more all deserve to gather that power together, and to keep it.',
  'We’re starting with the family because it’s the highest-trust group most people belong to.',
].join('\n\n');

const BELIEFS = [
  {
    title: 'Augment, don’t replace.',
    body: 'The big labs aren’t incentivized to do anything other than replace. They don’t want to augment people, they want to replace them. We want AI that makes a group of people more capable together.',
  },
  {
    title: 'Own your AI.',
    body: 'Own the hardware, own the values, own the incentives. An AI you rent answers to whoever you rent it from.',
  },
  {
    title: 'Dumb agents, smart archives.',
    body: 'The archive outlives the model & the agent. Both get swapped out every year. A group’s shared context is the thing it can’t lose, so that’s where the intelligence should live.',
  },
];

const GROUPS = [
  'Families',
  'Municipalities',
  'Community groups',
  'Workplaces',
  'Organizers',
  'Activists',
];

const PROPERTIES = [
  {
    name: 'Portable',
    body: 'A group should be able to pull its whole archive and move it elsewhere, whenever it likes.',
  },
  {
    name: 'Pluggable',
    body: 'Any agent or model should be able to read & write to it. Swap them out and the context stays.',
  },
  {
    name: 'Secure',
    body: 'The group should decide who holds the keys, and be able to take them back.',
  },
  {
    name: 'End-to-end encrypted',
    body: 'No third party server (including our own) should be able to read it.',
  },
];

const AREAS = [
  {
    name: 'Shared social context',
    question: 'What does a group know that no one member does?',
    body: 'The shared context of a family, a studio or a tenants’ association is worth more than any one person’s siloed memories. We study how it gets written, read and kept.',
  },
  {
    name: 'Private archives',
    question: 'Can a shared memory live on a server that can’t read it?',
    body: 'Zero-knowledge, replicated and ejectable. A group with the right keys should be able to pull the whole archive, decrypt it locally and move it elsewhere.',
  },
  {
    name: 'Local compute',
    question: 'How small can a useful model be on hardware you own?',
    body: 'We benchmark small models on home-ready chipsets and publish the harness. Ownership (not access) is what we think equity in AI looks like.',
  },
  {
    name: 'Objects for the home',
    question: 'What form does a family trust for a hundred years?',
    body: 'Timeless, observable, trustworthy. New objects have to meet people halfway, so we start from things that already sit in the home.',
  },
];

const PROJECTS = [
  {
    name: 'Family Intelligence',
    area: 'Objects for the home · Local compute',
    status: 'Prototype',
    body: 'A privacy-preserving AI device for the home. Inference never leaves it. First prototype run with friends & family around Thanksgiving.',
    fpo: 'Device on a kitchen counter',
  },
  {
    name: 'Milieu',
    area: 'Shared social context',
    status: 'In progress',
    body: 'A framework for systems of shared context.',
    fpo: 'Milieu diagram: agents reading & writing one context',
  },
  {
    name: 'The archive protocol',
    area: 'Private archives',
    status: 'Proposed',
    body: 'An open protocol for a shared memory that no third party server (including our own) can read. We’re proposing to publish the specification, a reference implementation and the threat model.',
    fpo: 'Hub sees ciphertext, clients hold keys',
  },
];

const EXPERIMENTS = [
  {
    name: 'Chipset benchmarks',
    status: 'Published',
    body: 'A test harness for speaker diarisation on three home-ready chipsets.',
    href: 'https://github.com/sanctuarycomputer/intelligence.family',
  },
  {
    name: 'The Leaf',
    status: 'Form study',
    body: 'An homage to the family tree, with a removable mic.',
    href: '/research',
  },
  {
    name: 'The Radio',
    status: 'Form study',
    body: 'A tactile, nostalgic way to browse your family’s heritage.',
    href: '/research',
  },
  {
    name: 'The Family Book',
    status: 'Form study',
    body: 'A modern update to the scrapbook.',
    href: '/research',
  },
];

const WRITING = [
  {
    kind: 'Essay',
    title: 'Oh, to Be Known By My Computer!',
    href: 'https://garden3d.substack.com/p/oh-to-be-known-by-my-computer',
  },
  {
    kind: 'Essay',
    title: 'Off Brain',
    href: 'https://garden3d.substack.com/p/off-brain',
  },
  {
    kind: 'Essay',
    title: 'Where the flower grows',
    href: 'https://garden3d.substack.com/p/where-the-flower-grows',
  },
  {
    kind: 'Lab note',
    title: 'Speculative Research on Local LLMs',
    href: '/research',
  },
];

const NOW = [
  {
    when: 'Thanksgiving 2026',
    what: 'First prototype run with friends & family.',
  },
  {
    when: 'January 2026',
    what: 'Published our research on local LLMs in the home, in partnership with the Mozilla Foundation.',
  },
];

const PEOPLE = [
  { name: 'Hugh Francis', line: 'Co-founder' },
  { name: 'Yatú Pelaez-Espinosa', line: 'Co-founder' },
  { name: 'Norm O’Hagan', line: 'Co-founder' },
];

const SUPPORTERS = ['Incubated by Sanctuary Computer & garden3d'];

export default function LabPage() {
  return (
    <>
      <main className="lab">
        <p className="lab-wip">Wireframe · draft copy</p>

        <header className="lab-masthead">
          <h1>
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
          <p className="lab-lede">
            A research lab for shared context and local AI, starting with the
            family.
          </p>
        </header>

        <section className="lab-section">
          <p className="lab-eyebrow">01 · The claim</p>
          <div className="lab-claim">
            <h2>AI is moving from an individual model to a shared context.</h2>
            <div className="lab-prose">
              <p className="lab-multiline">{CLAIM}</p>
            </div>
          </div>

          {BELIEFS.map(belief => (
            <div key={belief.title} className="lab-claim lab-bar">
              <h2>{belief.title}</h2>
              <div className="lab-prose">
                <p>{belief.body}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="lab-section">
          <p className="lab-eyebrow">02 · Shared power</p>
          <div className="lab-claim">
            <h2>Context is where groups gather power together.</h2>
            <div className="lab-prose">
              <p className="lab-multiline">{SHARED_POWER}</p>
            </div>
          </div>

          <ul className="lab-supporters">
            {GROUPS.map(name => (
              <li key={name}>{name}</li>
            ))}
          </ul>

          <h4 className="lab-subhead">A shared context should be</h4>
          <div className="lab-grid lab-grid-4">
            {PROPERTIES.map(property => (
              <div key={property.name} className="lab-card">
                <h3>{property.name}</h3>
                <p>{property.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="lab-section">
          <p className="lab-eyebrow">03 · Research areas</p>
          <div className="lab-grid lab-grid-4">
            {AREAS.map(area => (
              <div key={area.name} className="lab-card">
                <p className="lab-tag">{area.name}</p>
                <h3>{area.question}</h3>
                <p>{area.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="lab-section">
          <p className="lab-eyebrow">04 · Projects</p>
          <div className="lab-grid lab-grid-3">
            {PROJECTS.map(project => (
              <div key={project.name} className="lab-card">
                <Fpo label={project.fpo} ratio="4 / 3" />
                <p className="lab-status">{project.status}</p>
                <h3>{project.name}</h3>
                <p>{project.body}</p>
                <p className="lab-tag">{project.area}</p>
              </div>
            ))}
          </div>

          <h4 className="lab-subhead">Experiments</h4>
          <div className="lab-list">
            {EXPERIMENTS.map(item => (
              <div key={item.name} className="lab-row">
                <p className="lab-list-meta">{item.status}</p>
                <p className="lab-list-title">
                  <a href={item.href}>{item.name}</a>
                </p>
                <p className="lab-list-body">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="lab-section">
          <p className="lab-eyebrow">05 · Writing</p>
          <div className="lab-list">
            {WRITING.map(item => (
              <div key={item.title} className="lab-row">
                <p className="lab-list-meta">{item.kind}</p>
                <p className="lab-list-title">
                  <a href={item.href}>{item.title}</a>
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="lab-section">
          <p className="lab-eyebrow">06 · Now</p>
          <div className="lab-list">
            {NOW.map(item => (
              <div key={item.when} className="lab-row">
                <p className="lab-list-meta">{item.when}</p>
                <p className="lab-list-title">{item.what}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="lab-section">
          <p className="lab-eyebrow">07 · People</p>
          <div className="lab-grid lab-grid-3">
            {PEOPLE.map(person => (
              <div key={person.name} className="lab-card">
                <Fpo label={`Portrait: ${person.name}`} ratio="1 / 1" />
                <h3>{person.name}</h3>
                <p>{person.line}</p>
              </div>
            ))}
          </div>
          <ul className="lab-supporters">
            {SUPPORTERS.map(name => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </section>

        <section className="lab-section">
          <p className="lab-eyebrow">08 · Get involved</p>
          <div className="lab-claim">
            <h2>If you can help us hone our vision, write and tell us how.</h2>
            <div className="lab-prose">
              <p>
                Email{' '}
                <a href="mailto:partner@intelligence.family">
                  partner@intelligence.family
                </a>
                , or subscribe for the lab&rsquo;s findings as we publish them.
              </p>
              <div className="lab-subscribe">
                <SubscribeForm />
              </div>
            </div>
          </div>
        </section>
      </main>

      <DebugCopyEditorMount scope="main" pageName="lab" />
    </>
  );
}
