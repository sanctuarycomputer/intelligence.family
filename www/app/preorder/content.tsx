// Every string on /preorder lives here so copy changes never touch layout.
// The use-case names, group headers, FAQ questions, and hero copy are a
// contract with the Prolific survey. tests/preorder-copy.test.ts enforces it.

export const HERO_MEDIA = {
  // Swap to 'landscape' with /preorder/hero.mp4 once the wide clip exists.
  orientation: 'portrait' as 'portrait' | 'landscape',
  src: '/opportunity/device-playtest.mp4',
  poster: '/opportunity/device-playtest-poster.jpg',
  label: 'The Flagship on a coffee table in a family living room',
};

export const HERO = {
  headline: 'Take better care of your family than ever before.',
  body: "The Flagship is the most capable AI assistant you can put in a home. It remembers your family's stories, paperwork, and health. It helps run the household. It answers the kids. And nothing it hears ever leaves the house.",
  pillars: [
    'Remembers your family',
    'Runs your household',
    'Nothing leaves the house',
  ] as const,
  offer:
    '$899 at launch. Hold one of 250 founder units with a $49 refundable deposit.',
};

export const HARNESS = {
  line: 'An assistant that knows your home.',
  body: "One local agent holds the household's memory. It runs the jobs a family never gets to: weekly check-ins, budgets, school, health. When you allow it, it reaches out to your calendar, email, web search, and maps, and it talks to the devices already on your network. Everything stays local by default. The internet comes to your data, not the other way around.",
  closer:
    "That's why it's the most capable assistant you can put in a home. It has context no cloud assistant is allowed to have.",
  image: '/preorder/context-window-home.webp',
  alt: 'A house in cross-section with the Flagship on the coffee table, connected to the TV, thermostat, camera, laptop, phone, and speaker in every room',
};

export type UseCase = {
  n: number;
  name: string;
  body: string;
  later?: boolean;
};
export type UseCaseGroup = { header: string; items: ReadonlyArray<UseCase> };

export const USE_CASE_GROUPS: ReadonlyArray<UseCaseGroup> = [
  {
    header: 'Remembers your family',
    items: [
      {
        n: 1,
        name: 'Family stories',
        body: 'Record grandparents while you still can, and find any story, recipe, or tradition later.',
      },
      {
        n: 2,
        name: 'The document vault',
        body: 'Birth certificates, wills, insurance, school forms. Never lost again.',
      },
      {
        n: 3,
        name: 'The family health record',
        body: 'Vaccines, allergies, medications, what runs in the family, for kids and aging parents alike.',
      },
      {
        n: 4,
        name: 'Photos and recordings',
        body: 'One home for everything scattered across phones and drives.',
      },
    ],
  },
  {
    header: 'Runs your household',
    items: [
      {
        n: 5,
        name: 'The shared family brain',
        body: "What the pediatrician said, when the permission slip is due, what's being saved for. Ask it instead of each other.",
      },
      {
        n: 6,
        name: 'Kid-safe AI',
        body: 'Homework help and endless questions, with rules you set, and nothing about your kids leaving the house.',
      },
      {
        n: 7,
        name: "Everyone's private assistant",
        body: 'Writing, research, planning, as good as the best cloud assistants, with no account and no one reading over your shoulder.',
      },
      {
        n: 8,
        name: 'The brain of the smart home',
        body: 'One assistant that knows the house and talks to the devices in it.',
        later: true,
      },
    ],
  },
];

export const USE_CASES_IMAGE = {
  src: '/preorder/family-vault.webp',
  alt: 'The Flagship surrounded by a storybook, cookbook, document box, photo pile, calendar, piggy bank, and health folder',
};

export const KITCHEN = {
  line: 'Some stories you only get to record once.',
  body: "It sits on the kitchen shelf. Invite it into the conversation and it can resurface the story your grandfather told last Thanksgiving, find the recording of your daughter's first words, and help your kids interview their grandparents. Everything it hears stays inside the house.",
  image: '/preorder/device-photo.jpg',
  alt: "A child's hand on the Flagship's screen on a kitchen counter",
};

export const PRIVACY = {
  line: 'Nothing leaves the house.',
  body: 'Prompts, inference, and reasoning stay on the box. Far-away family reach it through apps over a tunnel we cannot read. You can dim the lights without telling anyone.',
  image: '/preorder/walled-garden.webp',
  alt: 'A hedge-walled garden with the Flagship at its center, one gate ajar where a single thread reaches out to a distant datacenter and returns',
};

export const OBJECT = {
  specs: [
    'Runs open models locally. Nothing to sign in to.',
    'No subscription needed to use it.',
    'Gets smarter over the air as better open models ship.',
    "Sits on a shelf. Plugs into the wall. That's the setup.",
  ] as const,
  body: 'A premium, heirloom-grade object that carries the inference runtime and the household graph. Made to sit on the counter for a very long time.',
  cad: '/preorder/device-cad.jpg',
  cadAlt:
    'CAD render of the Flagship: curved shell, tilted display, and the compute module inside',
  photo: '/preorder/device-table.jpg',
  photoAlt: 'The Flagship on a coffee table in a family living room',
};

export const RESERVE = {
  title: 'The Flagship. $899 at launch.',
  sub: 'Hold a founder unit with a $49 refundable deposit.',
  ship: 'Founder units ship in 2027. United States only.',
  button: 'Reserve a founder unit',
  smallPrint:
    "No charge today. We'll email you a payment link when deposits open. Full refund any time before your unit ships.",
  waitlist: {
    count: 'All 250 founder units reserved',
    button: 'Join the waitlist',
    smallPrint: "We'll email you if a unit frees up.",
  },
  reserved: {
    title: "You're in line for the Flagship.",
    body: "When deposits open we'll email you a payment link for the $49 refundable deposit. Paying it confirms your unit and locks the $899 launch price. The $850 balance is due when your unit ships.",
  },
  waitlisted: {
    title: "You're on the waitlist.",
    body: "All 250 founder units are spoken for. If a unit frees up we'll email you first.",
  },
  prolific: {
    reserve: 'Reserve a founder unit',
    decline: "No thanks, I'm not interested",
    thanks: 'Thanks. Your completion code is',
    noCode: 'Return to Prolific to finish the study.',
  },
};

export const FAQ = [
  {
    q: 'When am I charged?',
    a: 'Not today. When deposits open we email you a payment link for the $49 deposit. The $850 balance is due when your unit ships.',
  },
  {
    q: 'Can I get my deposit back?',
    a: 'Yes. Full refund any time before your unit ships, no questions asked.',
  },
  {
    q: 'What does a founder unit get me?',
    a: 'One of the first 250 devices, the $899 launch price locked in, and a direct line to the team while we build it.',
  },
  {
    q: 'What does it need at home?',
    a: "A shelf, a power outlet, and Wi-Fi for the family's phones and laptops to reach it. It works with the internet off.",
  },
  {
    q: 'Where do you ship?',
    a: 'Founder units ship to the United States. Other countries come later.',
  },
  {
    q: 'When does it ship?',
    a: "Founder units ship in 2027. We'll send updates as we go, and you can leave the line at any time.",
  },
] as const;
