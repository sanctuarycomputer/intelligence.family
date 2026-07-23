import type { Clarification } from '@/lib/clarifications';

// Native <details> keeps this zero-state: keyboard/screen-reader accessible,
// inert-able by the email gate, and `name` groups the items so opening one
// closes the others (older browsers just allow multiple open).
export default function ClarificationItem({
  question,
  answerHtml,
}: Clarification) {
  return (
    <details
      name="clarifications"
      className="group border-t border-fi-green-300"
    >
      <summary className="cursor-pointer list-none py-5 flex items-baseline gap-3 [&::-webkit-details-marker]:hidden">
        <span
          aria-hidden="true"
          className="text-fi-green-500 transition-transform duration-200 group-open:rotate-90"
        >
          &#9656;
        </span>
        <span className="text-lg md:text-xl font-bold">{question}</span>
      </summary>
      {/* Paragraph rhythm comes from globals.css (p.large + p.large), which
          the parser's class stamping opts these paragraphs into. */}
      <div
        className="pb-6 pl-6"
        dangerouslySetInnerHTML={{ __html: answerHtml }}
      />
    </details>
  );
}
