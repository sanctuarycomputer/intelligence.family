interface PullQuoteProps {
  children: React.ReactNode;
}

export default function PullQuote({ children }: PullQuoteProps) {
  return (
    <blockquote className="flex flex-col gap-4 text-center italic">
      <div 
        className="h-px w-full" 
        style={{ backgroundColor: 'rgba(94, 123, 41, 0.5)' }}
      />
      <div className="py-2">
        {children}
      </div>
      <div 
        className="h-px w-full" 
        style={{ backgroundColor: 'rgba(94, 123, 41, 0.5)' }}
      />
    </blockquote>
  );
}

