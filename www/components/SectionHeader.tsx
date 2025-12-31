interface SectionHeaderProps {
  label: string;
  title: string;
}

export default function SectionHeader({ label, title }: SectionHeaderProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      {/* Label with dividers */}
      <div className="flex items-center gap-2 w-full">
        <div 
          className="flex-1 h-px" 
          style={{ backgroundColor: 'rgba(94, 123, 41, 0.5)' }}
        />
        <h3 className="label">{label}</h3>
        <div 
          className="flex-1 h-px" 
          style={{ backgroundColor: 'rgba(94, 123, 41, 0.5)' }}
        />
      </div>
      {/* Title */}
      <h3>{title}</h3>
    </div>
  );
}

