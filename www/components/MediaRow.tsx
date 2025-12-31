interface MediaItem {
  type: "image" | "video";
  src: string;
  alt?: string;
}

interface MediaRowProps {
  items: MediaItem[];
  caption?: string;
  height?: number;
}

export default function MediaRow({ items, caption, height = 400 }: MediaRowProps) {
  return (
    <div className="media-row-wrapper">
      <div 
        className="media-row"
        style={{ height: `${height}px` }}
      >
        {items.map((item, index) => (
          <div 
            key={index} 
            className="media-item"
            style={{ height: `${height}px` }}
          >
            {item.type === "video" ? (
              <video
                src={item.src}
                autoPlay
                loop
                muted
                playsInline
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.src}
                alt={item.alt || ""}
              />
            )}
          </div>
        ))}
      </div>
      {caption && (
        <p className="caption text-fi-black-900 text-center mt-4">
          {caption}
        </p>
      )}
    </div>
  );
}

