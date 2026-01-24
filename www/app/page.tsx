import SectionHeader from "@/components/SectionHeader";
import PullQuote from "@/components/PullQuote";
import LeafIcon from "@/components/LeafIcon";
import MediaRow from "@/components/MediaRow";
import QuoteBox from "@/components/QuoteBox";
import AudioPlayer from "@/components/AudioPlayer";
import CodeSnippet from "@/components/CodeSnippet";
import SubscribeForm from "@/components/SubscribeForm";
import Navigation, { MobileNavigation } from "@/components/Navigation";
import { AnimatedElement } from "@/components/PageAnimations";

const RESEARCH_LINKS = [
  {
    part: "Part One",
    title: "Oh! To be known by my computer: Social archetypes of LLMs",
    url: "https://garden3d.substack.com/p/oh-to-be-known-by-my-computer",
  },
  {
    part: "Part Two",
    title: "Off-Brain",
    url: "https://garden3d.substack.com/p/off-brain",
  },
  {
    part: "Part Three",
    title: "Where the Flower Grows",
    url: "https://garden3d.substack.com/p/where-the-flower-grows",
  },
];

const SYSTEM_PROMPT_CODE = `system_prompt = """
You are a Data Extraction Engine, not a creative writer.
Your job is to extract family history data with forensic accuracy.

### GROUNDING RULES
1. **Extract ALL People**: You MUST extract EVERY person mentioned in the transcript, even if they're minor characters or only mentioned once. This includes:
   - All named individuals (e.g., "John Doe", "Jane Doe", "Leilani")
   - People referred to by first name only (e.g., "Jane", "Mia", "Paul")
   - People referred to by relationship (e.g., "Mum", "Dad") - create entries for them
   - DO NOT create separate entries for speakers - instead, identify which person each speaker likely is (see Speaker Identification below)
2. **Speaker Identification**: Analyze ALL context clues throughout the transcript to identify which person each speaker likely is:
   - **Collect Multiple Clues**: A speaker may be referred to by different names/relationships in the same conversation:
     * Direct address: "wouldn't it, Mia?" followed by SPEAKER_01 responding suggests SPEAKER_01 is Mia
     * Relationship references: "Mum can tell you" suggests SPEAKER_01 is the mother
     * First-person references: "Jane and I drove home" suggests SPEAKER_01 might be Jane
   - **Name Consolidation**: If multiple clues point to different names for the same speaker, consider they might be the SAME person:
     * Example: If SPEAKER_01 is addressed as "Mia" AND referred to as "Mum" AND says "Jane and I", these could all be the same person (Mia/Jane is the mother)
     * Create ONE person entry with the most complete name (e.g., "Jane" if full name, or "Mia" if that's what's used most)
     * Use the STRONGEST evidence (direct address is stronger than relationship reference)
   - **Confidence Levels**:
     * CERTAIN: Explicit statement like "I am John" or multiple strong clues all pointing to same person
     * PROBABLE: Strong clues like direct address followed by response, OR multiple weaker clues converging on same person
     * POSSIBLE: Single weak clue or conflicting clues
     * UNKNOWN: No identification clues found
   - **Evidence**: Quote ALL relevant text snippets that support the identification, especially if multiple clues point to the same person
2. **Quote Your Sources**: For every memory location, you must provide the EXACT substring from the text that proves it.
3. **No Normalization**: If the text says "Brothers Leagues Club", do not change it to "Bar" or "Coffee Shop". Keep the specific name.
4. **Context is Key**: If a location is vague (e.g., "recovery"), use the specific venue mentioned in context (e.g., "Race Club" or "Leagues Club").
5. **Dates**: If the speakers debate a date (e.g., "84? No 85"), use the final agreed date.

### DATABASE LAYOUT RULES
1. When working with IDs (either from the transcript as UUIDs, or locally generated temporary IDs), triple check that you reference the ID EXACTLY throughout the JSON and don't drop characters.
2. An Event node HAPPENED_AT one or more Location nodes.
3. An Event node is ATTENDED by a Person node, but a Location node is never ATTENDED by a Person node.
4. An Event node should always have a "year" property, and be __UNKNOWN__ if not stated.
5. An Event, Person and Location node should always have a "name" property, and be __UNKNOWN__ if not stated.
6. Two Person nodes are always connected by a RELATES_TO edge, and the edge always has a "type" property, describing the relationship, or __UNKNOWN__ if not stated.
7. A Person should never RELATED_TO a Location node, and a Location node should never be RELATED_TO a Person node.

### REQUIRED JSON SCHEMA
{
  "nodes": [
    {
      "id": "1"
      "label": "Person" | "Event" | "Location",
      "properties": { "name": "Bill" }
    }
    {
      "id": "3",
      "label": "Event",
      "properties": { "year": "1984", "name": "Jan & Ian's Wedding" }
    },
    {
      "id": "4",
      "label": "Location",
      "properties": { "name": "Brother's League Club" }
    },
    {
      "id": "5",
      "label": "Person",
      "properties": { "name": "Paul Francis" }
    }
  ],
  "edges": [
    {
      "label": "RELATES_TO",
      "source_id": "1",
      "target_id": "2",
      "properties": { "relationship": "WIFE" }
    },
    {
      "label": "HAPPENED_AT",
      "source_id": "3",
      "target_id": "4",
    },
    {
      "label": "ATTENDED",
      "source_id": "5",
      "target_id": "3"
    },
    {
      "label": "RELATES_TO",
      "source_id": "5",
      "target_id": "2",
      "properties": { "relationship": "FRIEND" }
    }
  ]
}

### ONE-SHOT EXAMPLE
Transcript: **123**: In 1984, no, in 1985, we got married at the bowls club, right Mia? **456**: Yeah, that's right.

Example output:
{
  "nodes": [
    {
      "id": "123",
      "label": "Person",
      "properties": { "name": "__UNKNOWN__" }
    },
    {
      "id": "456",
      "label": "Person",
      "properties": { "name": "Mia" }
    },
    {
      "label": "Event",
      "properties": { "year": "1985", "name": "Wedding" }
    },
    {
      "id": "_1"
      "label": "Location",
      "properties": { "name": "bowls club" }
    }
  ],
  "edges": [
    {
      "label": "RELATES_TO",
      "source_id": "123",
      "target_id": "456",
      "properties": { "relationship": "SPOUSE" }
    },
    {
      "label": "HAPPENED_AT",
      "source_id": "3",
      "target_id": "_1",
    }
  ]
}

### CRITICAL REMINDER
- Extract EVERY person mentioned, no matter how briefly or how minor they seem
- If someone is mentioned by first name only, use that name (e.g., "Jane" not "Jane Unknown")
- If full names are given, use them (e.g., "John Doe", "Jane Doe")
- DO NOT create separate "Speaker 00" or "Speaker 01" entries - identify which real person each speaker is
- **MULTIPLE CLUES ANALYSIS**: When identifying speakers, look for ALL clues throughout the transcript:
  * If SPEAKER_01 is addressed as "Mia" AND referred to as "Mum" AND says "Jane and I", these likely refer to the SAME person
  * Consolidate: Create ONE person entry (use the most complete name, e.g., "Jane" if that's the full name)
  * The fact that multiple different names/relationships point to the same speaker STRENGTHENS the identification
- For speaker_identifications: Use person_id from the people list, or null if unknown
- Scan the ENTIRE transcript systematically - don't miss anyone
- If a person appears multiple times with different names (e.g., "Jane" and "Jane Doe"), create ONE entry with the most complete name
- **Evidence field**: Include ALL relevant quotes when multiple clues converge, e.g., "Addressed as 'Mia' + referred to as 'Mum' + says 'Jane and I' - all point to same person"
"""`;

export default function Home() {
  return (
    <div className="min-h-screen relative">

      {/* Fixed Work with Us Button */}
      <AnimatedElement delay={300} className="absolute top-5 right-5 md:top-10 md:right-10 z-50">
        <a
          href="#work-with-us"
          className="block p-4 rounded bg-fi-green-200 hover:bg-fi-green-300 transition-colors"
        >
          <h4>Work with Us</h4>
        </a>
      </AnimatedElement>

      {/* Main Content */}
      <main className="container-content">
        {/* Hero Section */}
        <header className="pt-40 md:pt-48 pb-16 md:pb-24 xl:pb-32">
          <div className="grid-layout">
            <div className="col-span-12 flex flex-col items-center text-center">
              {/* H1 Title with Leaf */}
              <AnimatedElement delay={0} className="relative inline-block">
                <h1 className="relative inline-block">
                  Family<span className="tracking-[-0.1em]"> </span>Intelligence
                  <LeafIcon 
                    className="absolute leaf-animate" 
                    style={{ 
                      width: '0.35em', 
                      height: '0.4em', 
                      top: '-0.05em', 
                      right: '-0.4em' 
                    }} 
                  />
                </h1>
              </AnimatedElement>
              
              {/* H2 Subtitle */}
              <AnimatedElement delay={100}>
                <h2 className="mt-2 text-balance">
                  Speculative Research in Local LLMs.
                </h2>
              </AnimatedElement>
              
              {/* Byline */}
              <AnimatedElement delay={200} className="byline mt-8">
                Bringing memories back home,
                <br />
                by{" "}
                <a href="https://usb.club" className="underline hover:no-underline">
                  USB Club
                </a>{" "}
                and{" "}
                <a href="https://garden3d.net" className="underline hover:no-underline">
                  garden3d
                </a>
                .
              </AnimatedElement>
            </div>
          </div>
        </header>

        {/* Mobile Navigation - fixed position, shows/hides on scroll */}
        <div className="md:hidden">
          <MobileNavigation />
        </div>
      </main>

      {/* ===== PAGE CONTENT WITH SIDEBAR ===== */}
      <div className="page-content-wrapper">
        {/* Fixed sidebar navigation (z-10) - positioned absolutely within wrapper, sticky inside */}
        <AnimatedElement delay={400} as="nav" className="sidebar-nav-fixed">
          <div className="sticky top-8">
            <Navigation />
          </div>
        </AnimatedElement>

        {/* ===== SECTION: Text content (z-0) ===== */}
        <div className="content-section relative z-0">
        {/* Tree SVG - positioned to sit on the sidebar nav divider line, aligned left */}
        <AnimatedElement
          delay={500}
          className="hidden md:block absolute left-0 z-0 pointer-events-none"
          style={{
            top: 0,
            transform: 'translateY(calc(-100% + 13px))',
          }}
        >
          <img
            src="/research/tree-svg.svg"
            alt=""
          />
        </AnimatedElement>

        <AnimatedElement delay={500} className="main-content">
          {/* Section I: The Moment - 4 column width */}
          <div className="container-content">
            <div className="grid-layout">
              <div className="col-span-12 md:col-span-4 md:col-start-5">
                <section id="the-moment" className="mb-2">
                  <SectionHeader label="I" title="The Moment" />

                  <div className="mt-8 space-y-6">
                    <p className="large">
                      We hesitate whispering our secrets to the cloud, guilty trading privacy for convenience.
                    </p>

                    <p className="large">
                      But we do, because there is joy and beauty in being known and understood by the computer.
                    </p>

                    <p className="large">
                      With careful architecture, we can feel safe speaking openly around an LLM, safe in the verifiable proof that our data&apos;s accessible to us alone.
                    </p>

                    <p className="large">
                      When we engineer for intimacy, we can bring families together, easily storing and safeguarding our memories for future generations to come.
                    </p>
                  </div>

                  {/* Pull Quote */}
                  <div className="mt-6">
                    <PullQuote>
                      <p className="large">
                        AI could help preserve the next
                        <br />
                        millennium of family heritage,
                      </p>
                      <p className="large mt-4">
                        ...but we hesitate to share our
                        <br />
                        cherished memories with the cloud.
                      </p>
                    </PullQuote>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </AnimatedElement>
      </div>

      {/* ===== SECTION: Wide media (z-20, above sidebar) ===== */}
      <div className="content-section relative z-20">
        <div className="main-content">
            <div className="mt-8 mb-16">
              <MediaRow
                items={[
                  { type: "image", src: "/research/moment-1.png", alt: "Family device in kitchen" },
                  { type: "video", src: "/research/v3colorgrade.mp4" },
                  { type: "image", src: "/research/moment-3.png", alt: "Family device on shelf" },
                ]}
                caption="These objects existed inside multi-generational family environments over the holidays."
                height={400}
              />
            </div>
          </div>
      </div>

      {/* ===== SECTION: Text content (z-0) ===== */}
      <div className="content-section relative z-0">
        <div className="main-content">
          {/* Section II: The Idea - 6 column layout */}
          <div className="grid-layout">
            <div className="hidden md:block md:col-span-3" />
            <div className="col-span-12 md:col-span-6">
              <section id="the-idea" className="mb-10">
                <SectionHeader label="II" title="The Idea" />

                <div className="mt-8 space-y-6">
                  <p>
                    Private at-home intelligence is now in reach. While most of the industry is chasing always-online AI, we&apos;ve been exploring the alternative.
                  </p>

                  <div className="mt-8">
                    <QuoteBox
                      quote="In just a few cycles, our handheld devices will house small, local LLMs [...] routing more complex or topical queries through to to the bigger, more expensive cloud-based models. But this architecture will do little to improve upon our privacy under the gaze of Big Tech."
                      source="Research: Where the Flower Grows"
                      actionLabel="View our Previous Post"
                      href="https://garden3d.net"
                    />
                  </div>

                  <p>
                    In Part One of this research, we dove into the case for private AI to explore what will be needed for an air gapped future. When weighing the use cases, families stuck out as both an early adopter and multi-generational beneficiary of local LLMs. Helpful today, crucial tomorrow.
                  </p>

                  <p>
                    Archiving your family history is a cumbersome process, currently left to the one individual in the family with enough time and conviction to put a book together. LLMs are great at recording unstructured data into a maintainable archive, lowering the barrier to entry for anyone in the family to contribute to the family tree.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* ===== SECTION: Wide media (z-20) ===== */}
      <div className="content-section relative z-20">
        <div className="main-content">
          <div className="mb-12">
            <MediaRow
              items={[
                { type: "image", src: "/research/row-book-1.png", alt: "Family book 1" },
                { type: "image", src: "/research/row-book-2.png", alt: "Family book 2" },
                { type: "image", src: "/research/row-book-3.png", alt: "Family book 3" },
              ]}
              caption="The form of the book has endured for centuries. It's timeless in the home and shaped for private reading or collective use."
              height={400}
            />
          </div>
        </div>
      </div>

      {/* ===== SECTION: Text content (z-0) ===== */}
      <div className="content-section relative z-0">
        <div className="main-content">
          {/* Book Philosophy Text */}
          <div className="grid-layout mb-8">
            <div className="hidden md:block md:col-span-3" />
            <div className="col-span-12 md:col-span-6">
              <div className="space-y-6">
                <p>
                  Family memories belong in the home. With recent AI advancements, this is the first time you&apos;re able to build a treasure trove of memories in such a frictionless way for your family. Our heritage and family history is extremely intimate data that many don&apos;t want to give to big tech. However there&apos;s more utility and longevity of this family information if its archived and browsable digitally.
                </p>
                <p>
                  Previous generations stored family memories physically. Our generation is waking up to the fact that we&apos;re losing these memories unless we put systems in place to preserve them.
                </p>
                <p>
                  These memories also need to be embodied, as objects of heritage. They cannot solely live in a phone or a black box home server. We believe in three tenets that these objects must uphold if they wish to be accepted as a new method of archiving. A family intelligence object must be Timeless in its ability to withstand generations, Observable to have an ease of control, and Trustworthy from first glance to the 100th entry into the family tree.
                </p>
              </div>
            </div>
          </div>

          {/* Media Element - 8 Column - Character Traits */}
          <div className="grid-layout mb-12">
            <div className="col-span-12 md:col-span-8 md:col-start-3 flex flex-col items-center">
              <div className="w-full rounded-[20px] overflow-hidden">
                <img
                  src="/research/fi-character-traits.png"
                  alt="Character traits diagram"
                  className="w-full h-auto"
                />
              </div>
              <p className="caption mt-4 text-center">
                Form follows function. Tenets follow values. The bolded tenets are the ones that felt in harmony.
              </p>
            </div>
          </div>

          {/* Media Element - 6 Column - Family Categories */}
          <div className="grid-layout mb-4">
            <div className="col-span-12 md:col-span-6 md:col-start-4 flex flex-col items-center">
              <p className="mb-8">
                <strong>Families come in all shapes and sizes.</strong> They&apos;re messy, heartwarming, dysfunctional, inspirational, chosen, bestowed upon us. We considered these many forms of a family to understand how we can design an heirloom that resonates with any family member.
              </p>

              <div className="w-full rounded-[20px] overflow-hidden mt-6">
                <img
                  src="/research/fi-family-categories.png"
                  alt="Family categories"
                  className="w-full h-auto"
                />
              </div>
              <p className="caption mt-4 mb-16">
                Families don&apos;t take a single form, they are a spectrum of structures.
              </p>
              <div className="mb-12"></div>
              <p>
                <strong>Objects inherently hold memories.</strong> Families already embed memories into static objects today, and pass them down their lineage to extend their heritage. A couple types of objects stood out in our research for both private and familial heirlooms.
              </p>
            </div>
          </div>

          {/* Objects as Memory Holders - Image */}
          <div className="grid-layout mb-8">
            <div className="col-span-12 md:col-span-6 md:col-start-4">
              <img
                src="/research/fi-object-research.png"
                alt="Objects as memory holders research"
                className="w-full h-auto"
              />
            </div>
          </div>

          {/* Objects as Memory Holders - Intro Text */}
          <div className="grid-layout mb-12">
            <div className="col-span-12 md:col-span-6 md:col-start-4">
              <p className="text-center text-fi-black-900/70 mb-8">
                Objects emerge as long-term memory holders across personal, domestic, and technological forms.
              </p>
              <div className="mb-10"></div>
              <p>
                Taking cues from how families archive memories today, we concepted and play-tested different forms that speak to the three tenets of trustworthy, observable, and timeless. They&apos;re all around a medium size, able to be quickly thrown in a backpack on the way to Grandma&apos;s house, and they all aim to resemble something that already sits in the home today. New objects must meet people halfway to overcome the barrier of entry to change behavior.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== SECTION: Wide media - Research Sketches + Product Grids (z-20) ===== */}
      <div className="content-section relative z-20">
        <div className="main-content">
            {/* Media Element - Full Width No Padding - Research Sketches */}
            <div className="w-screen -ml-[calc(50vw-50%)] mb-24 bg-fi-green-100">
              <div className="w-full">
                <img
                  src="/research/fi-research-sketches.png"
                  alt="Research sketches"
                  className="w-full h-auto"
                />
              </div>
              <p className="caption mt-4 text-center px-6">
                From observation to form, we mapped how everyday objects become memory vessels.
              </p>
            </div>

            {/* The Leaf - 12 Column Grid Layout */}
            <div className="grid-layout mb-24">
              <div className="col-span-12 md:col-span-6 md:col-start-4">
                <div className="mb-6">
                  <h4>The Leaf</h4>
                  <p className="mt-2">
                    An homage to the family tree, the Family Leaf mimics an alarm clock as a tabletop item and features a removable mic. Stand up the leaf to begin a session or use it as a remote to browse past recordings.
                  </p>
                </div>
              </div>
              <div className="col-span-12">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-12 md:col-span-3 flex flex-col gap-4">
                    <div className="rounded-[20px] overflow-hidden">
                      <img src="/research/leaf-1.png" alt="The Leaf - removable mic being placed" className="w-full h-auto" />
                    </div>
                    <div className="rounded-[20px] overflow-hidden">
                      <img src="/research/leaf-2.png" alt="The Leaf - tabletop view" className="w-full h-auto" />
                    </div>
                  </div>
                  <div className="col-span-12 md:col-span-5 flex">
                    <div className="rounded-[20px] overflow-hidden w-full">
                      <img src="/research/leaf-3.png" alt="The Leaf - full device view" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="col-span-12 md:col-span-4 flex flex-col gap-4">
                    <div className="rounded-[20px] overflow-hidden">
                      <img src="/research/leaf-4.png" alt="The Leaf - on wooden table" className="w-full h-auto" />
                    </div>
                    <div className="rounded-[20px] overflow-hidden">
                      <img src="/research/leaf-5.png" alt="The Leaf - detail view" className="w-full h-auto" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* The Radio - 12 Column Grid Layout */}
            <div className="grid-layout mb-24">
              <div className="col-span-12 md:col-span-6 md:col-start-4">
                <div className="mb-6">
                  <h4>The Radio</h4>
                  <p className="mt-2">
                    The most sentimental of the bunch, the Family Radio is a contextually accurate and historically nostalgic way to browse your family&apos;s heritage. It&apos;s tactile interfaces keep memories grounded in the home.
                  </p>
                </div>
              </div>
              <div className="col-span-12">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-12 md:col-span-4 flex flex-col gap-4">
                    <div className="rounded-[20px] overflow-hidden">
                      <img src="/research/radio-1.png" alt="The Radio - screen detail" className="w-full h-auto" />
                    </div>
                    <div className="rounded-[20px] overflow-hidden">
                      <img src="/research/radio-2.png" alt="The Radio - turning dial" className="w-full h-auto" />
                    </div>
                  </div>
                  <div className="col-span-12 md:col-span-4 flex flex-col gap-4">
                    <div className="rounded-[20px] overflow-hidden">
                      <img src="/research/radio-3.png" alt="The Radio - full device" className="w-full h-auto" />
                    </div>
                    <div className="rounded-[20px] overflow-hidden">
                      <img src="/research/radio-4.png" alt="The Radio - kitchen view" className="w-full h-auto" />
                    </div>
                  </div>
                  <div className="col-span-12 md:col-span-4 flex flex-col gap-4">
                    <div className="rounded-[20px] overflow-hidden">
                      <img src="/research/radio-5.png" alt="The Radio - timeline view" className="w-full h-auto" />
                    </div>
                    <div className="rounded-[20px] overflow-hidden">
                      <img src="/research/radio-6.png" alt="The Radio - kitchen photo" className="w-full h-auto" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* The Family Book - 12 Column Grid Layout */}
            <div className="grid-layout mb-24">
              <div className="col-span-12 md:col-span-6 md:col-start-4">
                <div className="mb-6">
                  <h4>The Family Book</h4>
                  <p className="mt-2">
                    A modern update to the scrapbook, which stand the test of time for keeping family memories safe. The Family Book provides an intuitive interface for reading and writing your family&apos;s history.
                  </p>
                </div>
              </div>
              <div className="col-span-12">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-12 md:col-span-5 rounded-[20px] overflow-hidden">
                    <img src="/research/book-1.png" alt="The Family Book - closed on table" className="w-full h-full object-cover" />
                  </div>
                  <div className="col-span-12 md:col-span-7 rounded-[20px] overflow-hidden">
                    <img src="/research/book-3.png" alt="The Family Book - open view" className="w-full h-full object-cover" />
                  </div>
                  <div className="col-span-12 md:col-span-5 rounded-[20px] overflow-hidden">
                    <img src="/research/book-2.png" alt="The Family Book - standing display" className="w-full h-auto" />
                  </div>
                  <div className="col-span-12 md:col-span-4 rounded-[20px] overflow-hidden">
                    <img src="/research/book-4.png" alt="The Family Book - crafting process" className="w-full h-auto" />
                  </div>
                  <div className="col-span-12 md:col-span-3 rounded-[20px] overflow-hidden">
                    <img src="/research/book-5.png" alt="The Family Book - in use" className="w-full h-auto" />
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>

      {/* ===== SECTION: Text content (z-0) ===== */}
      <div className="content-section relative z-0">
        <div className="main-content">
          {/* Family Book Philosophy Text */}
          <div className="grid-layout mb-16">
            <div className="hidden md:block md:col-span-3" />
            <div className="col-span-12 md:col-span-6">
              <p>
                Imagine growing up and being able to spend full days diving into your family tree – your lineage, what your aunt studied in school, where that distant cousin is now, what&apos;s your grandma&apos;s favorite recipe. Building a system for family intelligence provides easy avenues to this information for all ages. We explored early wireframes that would aide family members looking to learn more.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== SECTION: Wide media - Wireframes (z-20) ===== */}
      <div className="content-section relative z-20">
        <div className="main-content">
          <div className="mb-24">
            <MediaRow
              items={[
                { type: "image", src: "/research/wireframes-left.png", alt: "Wireframes left" },
                { type: "image", src: "/research/kiddos.gif", alt: "Kiddos animation" },
                { type: "image", src: "/research/wireframes-right.png", alt: "Wireframes right" },
              ]}
              height={400}
            />
          </div>
        </div>
      </div>

      {/* ===== SECTION: Text content - The System (z-0) ===== */}
      <div className="content-section relative z-0">
        <div className="main-content">
          {/* Section III: The System - 6 column layout */}
          <div className="grid-layout">
            <div className="hidden md:block md:col-span-3" />
            <div className="col-span-12 md:col-span-6">
              <section id="the-system" className="mb-2">
                <SectionHeader label="III" title="The System" />

                <div className="mt-8 space-y-6">
                  <p>
                    Encouraged by the results of our initial local LLM tests, we filled out the system architecture and ran benchmarks on a wider set of home-ready computers.
                  </p>

                  <p>
                    The main engineering challenge for building a local LLM system comes down to managing user expectations around performance. While larger cloud-based systems can scale up to enormous amounts of computing power, consumer hardware will need to utilize longer-running AI processes for heavy-duty data processing. These tasks will run on-device in the background and surface results to the user interface when ready.
                  </p>

                  <h4 className="mt-8">High-level Architecture</h4>
                  <p>
                    We focused on the main user flow of recording and processing a family conversation for architecting and benchmarking. Audio is one of the many modalities that this object of heritage will support. Let&apos;s take a look at our ETL Pipeline, a common pattern to Extract, Transform, and Load data.
                  </p>
                </div>
              </section>
            </div>
          </div>

          {/* HLSD Diagram - 8 Column */}
          <div className="grid-layout mb-8 mt-8">
            <div className="col-span-12 md:col-span-8 md:col-start-3 flex flex-col items-center">
              <div className="w-full overflow-hidden">
                <img
                  src="/research/HLSD.svg"
                  alt="High-Level System Diagram showing Family Intelligence Runtime architecture"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>

          {/* HLSD Explanation Paragraphs */}
          <div className="grid-layout mb-6">
            <div className="hidden md:block md:col-span-3" />
            <div className="col-span-12 md:col-span-6">
              <div className="space-y-6">
                <p>
                  This pipeline will serve in real-time to record and store memories as audio, understand them, and load them into an ontological (or categorized) representation. That data will underpin a social graph of nodes such as people, places, and events, and their edges such as relationships and actions.
                </p>

                <h4 className="mt-2">Step One: Extract and Chunk Audio</h4>
                <p>
                  With a high degree of resilience, the device will first record chunks of audio directly to storage (e.g. an on-board microSD card) and encrypt it at rest to lower the likelihood of faults like memory overflow, data corruption, or inconsistency in later steps. This is our first step towards an idempotent and reliably consistent processing architecture.
                </p>

                <p>
                  Lastly, to ensure family members feel safe and in control, we&apos;ll utilize a physical disconnect switch that allows for pausing of recording during the conversation – perfect for Grandma&apos;s dicey side stories.
                </p>
              </div>
            </div>
          </div>

          {/* Extract Diagram */}
          <div className="grid-layout mb-12">
            <div className="col-span-12 md:col-span-6 md:col-start-4 flex flex-col items-center">
              <div className="w-full overflow-hidden">
                <img
                  src="/research/diagram-extract.svg"
                  alt="Detect and process all unprocessed Transcript Chunks"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>

          {/* Step Two */}
          <div className="grid-layout mb-6">
            <div className="hidden md:block md:col-span-3" />
            <div className="col-span-12 md:col-span-6">
              <div className="space-y-6">
                <h4>Step Two: Transform Audio to Recognize Speakers</h4>
                <p>
                  As chunks are stored safely on disk, the system will pick them up and separate out audio and transcriptions for different speakers. These are often referred to as &quot;Speaker Turns&quot;. A couple Python libraries and offline models backed by <a href="https://github.com/pyannote/pyannote-audio" className="underline hover:no-underline">pyannote-audio</a> and <a href="https://github.com/SYSTRAN/faster-whisper" className="underline hover:no-underline">faster-whisper</a> are helpful here.
                </p>

                <p>
                  We store the voices as &quot;voiceprints&quot; so when future recording sessions feature the same speakers they can be logically connected in the social graph. Further, raw transcripts will be stored in the database to be interpreted in the next step.
                </p>
              </div>
            </div>
          </div>

          {/* Transform Diagram - 8 Column */}
          <div className="grid-layout mb-12">
            <div className="col-span-12 md:col-span-6 md:col-start-4 flex flex-col items-center">
              <div className="w-full overflow-hidden">
                <img
                  src="/research/diagram-transform.svg"
                  alt="Transform Speaker Diarisation diagram showing audio chunk to speaker turns to transcript and voiceprint storage"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>

          {/* Step Three and Code Snippet */}
          <div className="grid-layout mb-6">
            <div className="hidden md:block md:col-span-3" />
            <div className="col-span-12 md:col-span-6">
              <div className="space-y-6">
                <h4>Step Three: Load into Ontological Vector Database</h4>
                <p>
                  Finally, as raw transcripts are stored in the database, they&apos;ll be picked up and analyzed by the LLM, then compressed and stored for easy RAG retrieval and traversal through a graph database.
                </p>

                <p>
                  For compression, <a href="https://arxiv.org/abs/2309.04269" className="underline hover:no-underline">Chain of Density</a> (CoD) is a common prompting technique we can employ to ensure our speaker turns are vectorized at a high degree of detail and predictable length.
                </p>

                <p>
                  For extracting a social graph, we can employ <a href="#" className="underline hover:no-underline">Few-Shot Prompting</a> and strict JSON output to extract social relationships ready for entry into a traditional nodes + edges graph database.
                </p>
              </div>
            </div>
          </div>

          {/* Load Diagram */}
          <div className="grid-layout mb-6 mt-2">
            <div className="col-span-12 md:col-span-8 md:col-start-3 flex flex-col items-center">
              <div className="w-full overflow-hidden">
                <img
                  src="/research/diagram-load.svg"
                  alt="Detect and process all unprocessed Transcript Chunks"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>

          {/* Code Snippet */}
          <div className="grid-layout mb-6 mt-2">
            <div className="hidden md:block md:col-span-3" />
            <div className="col-span-12 md:col-span-6">
              <div className="space-y-6">
                <p>
                  Here is our example system prompt for the curious:
                </p>

                <div className="mt-4">
                  <CodeSnippet
                    code={SYSTEM_PROMPT_CODE}
                    language="python"
                    collapsedHeight={190}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Neo4j Diagram - 8 Column */}
          <div className="grid-layout mb-24">
            <div className="col-span-12 md:col-span-8 md:col-start-3 flex flex-col items-center">
              <div className="w-full overflow-hidden">
                <img
                  src="/research/neo4j.png"
                  alt="Neo4j graph database visualization"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>

          {/* Benchmarking our Chipsets */}
          <div className="grid-layout mb-6">
            <div className="hidden md:block md:col-span-3" />
            <div className="col-span-12 md:col-span-6">
              <div className="space-y-6">
                <h4>Benchmarking our Chipsets</h4>
                <p>
                A key part of our thesis points to the drastic strides in processing speeds that both open source models and consumer-level chipsets have been making every 6 months. Its safe to bet that what might seem resource constrained and inefficient today is likely to be a breeze on hardware and architectures just a year from now. 
                </p>
                <p>
                We wrote a lightweight test harness (<a href="https://github.com/sanctuarycomputer/intelligence.family" className="underline hover:no-underline">view codebase</a>) to asses the feasibility of running this workload on consumer grade hardware. We used this testing framework to run the same benchmark against three best-in-class chipsets. From least to most performant they are: 
                </p>

              </div>
            </div>
          </div>

          {/* Benchmarking set */}
          <div className="grid-layout mb-12">
            <div className="col-span-12 md:col-span-6 md:col-start-4 flex flex-col items-center">
              <div className="w-full overflow-hidden">
                <img
                  src="/research/benchmarking-chipsets.png"
                  alt="Benchmarking our Chipsets"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>

          {/* Benchmarking audio */}
          <div className="grid-layout mb-12">
            <div className="col-span-12 md:col-span-6 md:col-start-4 flex flex-col items-center">
              <div className="w-full overflow-hidden">
                <p>
                    All benchmarks were run against a cute 3 minute and 42 second story of Hugh&apos;s parents explaining how they met in 1985.
                  </p>

                  <div className="mt-8">
                    <AudioPlayer
                      src="/research/parents_meetcute_short.wav"
                      quote="I think we'll be going back to 1984..."
                      filename="family-meetcute.mp3"
                    />
                  </div>
              </div>
            </div>
          </div>

          {/* Benchmarking audio */}
          <div className="grid-layout mb-12">
            <div className="col-span-12 md:col-span-6 md:col-start-4 flex flex-col items-center">
              <div className="w-full overflow-hidden">
                <p>
                To benchmark the relative performance of these chips, we ran a speaker diarisation process with a local model of pyannote/speaker-diarization-3.1 (<a href="https://huggingface.co/pyannote/speaker-diarization-3.1" className="underline hover:no-underline">Hugging Face</a>) via the <a href="https://github.com/pyannote/pyannote-audio" className="underline hover:no-underline">pyannote-audio</a> python library.
                </p>
                <p>
                As expected, the Thor & Orin drastically outperformed the Raspberry Pi 5 16gb, indicating that for the best possible UX we&apos;ll need to run the Application Runtime against a GPU enabled system for these processing loads.
                </p>
                <p>
                For future tests, we&apos;d be interested to run the benchmarks against a smaller size chip to the Pi with an onboard GPU, such as Orange Pi 5, Khadas VIM4, ASUS Tinker Board, or even a Raspberry Pi 5 running an AI-capable HAT like the HAILO SC1785.
                </p>
                <img
                  src="/research/benchmarking-voiceprint.svg"
                  alt="Benchmarking Voiceprints Chart"
                  className="w-full h-auto mt-8 mb-8"
                />
                <p>
                While these initial results are encouraging, we look forward to seeing the advancements in these test cases in the coming months. 
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== SECTION: Wide media - Family Together (z-20) ===== */}
      <div className="content-section relative z-20">
        <div className="main-content">
          <div className="w-screen -ml-[calc(50vw-50%)] mb-24 mt-16">
            <div className="w-full">
              <img
                src="/research/family-together.png"
                alt="Family together"
                className="w-full h-auto"
              />
            </div>
            <p className="caption mt-4 text-center px-6">
              Intended for use, then for staying
            </p>
          </div>
        </div>
      </div>

      {/* ===== SECTION: Text content - Work with Us (z-0) ===== */}
      <div className="content-section relative z-0">
        <div className="main-content">
          {/* Section IV: Work with Us - 6 column layout */}
          <div className="grid-layout">
            <div className="hidden md:block md:col-span-3" />
            <div className="col-span-12 md:col-span-6">
              <section id="work-with-us" className="mb-10">
                <SectionHeader label="IV" title="Work with Us" />

                <div className="mt-8 space-y-6">
                  <p>
                  garden3d helps forward-thinking teams explore the edges of local ai, speculative hardware, and product storytelling. We collaborate with brands, labs, and founders to design the next generation of tangible ai experiences. This research is in partnership with usb club, a memory network for preserving what matters.
                  </p>

                  <p>
                    For partnerships and collaborations, email us at{" "}
                    <span className="relative inline-block">
                      <a
                        href="mailto:partner@intelligence.family"
                        className="no-underline hover:underline"
                      >
                        partner@intelligence.family
                      </a>
                      <img
                        src="/research/email-underline.png"
                        alt=""
                        className="absolute left-0 -bottom-1 w-full h-auto pointer-events-none"
                        style={{ transform: 'translateY(50%)' }}
                      />
                    </span>.
                  </p>

                  <h4 className="mt-8">Subscribe for Updates</h4>

                  <div className="relative mt-4">
                    <img
                      src="/research/curly-arrow.png"
                      alt=""
                      className="absolute pointer-events-none hidden md:block"
                      style={{
                        width: '80px',
                        height: 'auto',
                        left: '-100px',
                        top: '10px',
                      }}
                    />
                    <SubscribeForm />
                  </div>

                  <p className="mt-8">
                    This is part four in our ongoing research on local AI. Checkout the previous research on our Substack:
                  </p>

                  <div className="mt-4 border border-[rgba(94,123,41,0.5)] rounded-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-[rgba(94,123,41,0.5)]">
                      <h4 className="text-sm font-medium">Local Intelligence Research</h4>
                    </div>
                    <ul>
                      {RESEARCH_LINKS.map((item, index) => (
                        <li
                          key={index}
                          className={`ml-4 ${index !== RESEARCH_LINKS.length - 1 ? "border-b border-[rgba(94,123,41,0.5)]" : ""}`}
                        >
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start gap-4 pl-0 pr-4 py-3 hover:bg-fi-green-200/50 transition-colors group"
                          >
                            <span className="text-sm text-fi-black-900/60 shrink-0 w-20">{item.part}</span>
                            <span className="text-sm group-hover:text-fi-green-500 transition-colors">{item.title}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8 mb-8 border-t border-[rgba(94,123,41,0.5)]">
                    <div
                      className="w-full border-t border-[rgba(94,123,41,0.5)] mb-4"
                      style={{ marginTop: '4px' }}
                    ></div>
                    <p className="text-sm text-fi-black-900/70">
                      Published January 2026 by
                      <br />
                      USB Club (<a href="https://usb.club" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Norm</a>, <a href="https://usb.club" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Yatú</a>) and garden3d (<a href="https://garden3d.net" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Hugh</a>)
                    </p>

                    <div className="mt-6 space-y-1">
                      <a href="https://www.are.na/garden3d/family-intelligence-secondary-research" target="_blank" rel="noopener noreferrer" className="block text-sm underline hover:no-underline">
                        Secondary Research Are.na
                      </a>
                      <a href="https://www.are.na/garden3d/family-intelligence-primary-research" target="_blank" rel="noopener noreferrer" className="block text-sm underline hover:no-underline">
                        Primary Research Are.na
                      </a>
                    </div>

                    <div className="mt-6">
                      <p className="text-sm text-fi-black-900/70">Thank you.</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
      </div>{/* end page-content-wrapper */}
      <div className="pb-24 md:pb-32" />
    </div>
  );
}
