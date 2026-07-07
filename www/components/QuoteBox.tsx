interface QuoteBoxProps {
  quote: React.ReactNode;
  source: string;
  actionLabel?: string;
  href?: string;
  actionHref?: string;
  onActionClick?: () => void;
  showQuotes?: boolean;
  large?: boolean;
  onClick?: () => void;
}

export default function QuoteBox({ quote, source, actionLabel, href, actionHref, onActionClick, showQuotes = true, large = false, onClick }: QuoteBoxProps) {
  const action = actionLabel && actionHref && !href ? (
    <a
      href={actionHref}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onActionClick}
      className="font-sans text-sm font-normal text-fi-green-500 underline hover:no-underline"
    >
      {actionLabel}
    </a>
  ) : actionLabel ? (
    <span className="font-sans text-sm font-normal text-fi-green-500 group-hover:underline">{actionLabel}</span>
  ) : null;

  const content = (
    <>
      {/* Quote Content */}
      <div className="p-6">
        <p className={large ? "large text-fi-black-900" : "font-sans text-base font-normal leading-relaxed text-fi-black-900"}>
          {showQuotes ? <>&ldquo;{quote}&rdquo;</> : quote}
        </p>
      </div>

      {/* Footer Bar */}
      <div className="flex flex-col items-start gap-0 md:flex-row md:justify-between md:items-center md:gap-2 px-6 py-4 border-t border-fi-green-500/50 bg-fi-green-500/5">
        <span className="font-sans text-sm font-medium text-fi-black-900">{source}</span>
        {action}
      </div>
    </>
  );

  if (!href) {
    return (
      <div className="block border border-fi-green-500/50 rounded overflow-hidden">
        {content}
      </div>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className="group block border border-fi-green-500/50 rounded overflow-hidden no-underline transition-colors duration-200 hover:border-fi-green-500 hover:bg-fi-green-500/5"
    >
      {content}
    </a>
  );
}
