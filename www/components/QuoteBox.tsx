interface QuoteBoxProps {
  quote: string;
  source: string;
  actionLabel: string;
  href: string;
}

export default function QuoteBox({ quote, source, actionLabel, href }: QuoteBoxProps) {
  return (
    <a 
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block border border-fi-green-500/50 rounded overflow-hidden no-underline transition-colors duration-200 hover:border-fi-green-500 hover:bg-fi-green-500/5"
    >
      {/* Quote Content */}
      <div className="p-6">
        <p className="font-sans text-base font-normal leading-relaxed text-fi-black-900">
          "{quote}"
        </p>
      </div>
      
      {/* Footer Bar */}
      <div className="flex justify-between items-center px-6 py-4 border-t border-fi-green-500/50 bg-fi-green-500/5">
        <span className="font-sans text-sm font-medium text-fi-black-900">{source}</span>
        <span className="font-sans text-sm font-normal text-fi-green-500 group-hover:underline">{actionLabel}</span>
      </div>
    </a>
  );
}
