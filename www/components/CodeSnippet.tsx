"use client";

import { useState, useRef, useEffect } from "react";
import { Highlight, themes } from "prism-react-renderer";

interface CodeSnippetProps {
  code: string;
  language?: string;
  collapsedHeight?: number;
}

export default function CodeSnippet({
  code,
  language = "python",
  collapsedHeight = 190,
}: CodeSnippetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const preRef = useRef<HTMLPreElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (preRef.current) {
      // Measure the pre element directly for accurate height
      setContentHeight(preRef.current.offsetHeight);
    }
  }, [code]);

  // Determine if we need to show the expand button
  const needsExpansion = contentHeight > collapsedHeight;
  
  // Calculate the display height - always start collapsed
  const displayHeight = isExpanded ? contentHeight : Math.min(contentHeight || collapsedHeight, collapsedHeight);

  const handleToggle = () => {
    if (isExpanded) {
      // Scroll to the top of the code snippet first, then collapse
      // This keeps the user oriented as the content shrinks
      containerRef.current?.scrollIntoView({ 
        behavior: "smooth", 
        block: "start"
      });
      // Small delay to let the scroll start, then collapse
      setTimeout(() => {
        setIsExpanded(false);
      }, 150);
    } else {
      setIsExpanded(true);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Code container with animated height */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          height: displayHeight > 0 ? `${displayHeight}px` : `${collapsedHeight}px`,
          backgroundColor: "#CBD3C3",
          borderTopLeftRadius: "5px",
          borderTopRightRadius: "5px",
          borderBottomLeftRadius: needsExpansion ? "0px" : "5px",
          borderBottomRightRadius: needsExpansion ? "0px" : "5px",
          transition: "height 500ms ease-in-out",
        }}
      >
        <Highlight theme={themes.github} code={code.trim()} language={language}>
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre
              ref={preRef}
              className={className}
              style={{
                ...style,
                margin: 0,
                padding: "24px",
                backgroundColor: "transparent",
                fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",
                fontSize: "13px",
                lineHeight: "1.6",
                overflow: "visible",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })}>
                  {line.map((token, key) => (
                    <span
                      key={key}
                      {...getTokenProps({ token })}
                      style={{
                        ...getTokenProps({ token }).style,
                        color: getTokenColor(token.types),
                      }}
                    />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>

        {/* Gradient overlay when collapsed */}
        {!isExpanded && needsExpansion && (
          <div
            className="absolute bottom-0 left-0 right-0 pointer-events-none transition-opacity duration-300"
            style={{
              height: "80px",
              background: "linear-gradient(to bottom, rgba(203, 211, 195, 0) 13%, rgba(203, 211, 195, 1) 52%)",
            }}
          />
        )}
      </div>

      {/* Expand/Collapse button */}
      {needsExpansion && (
        <button
          onClick={handleToggle}
          className="w-full py-4 text-center transition-all cursor-pointer hover:opacity-70"
          style={{
            backgroundColor: "#CBD3C3",
            fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",
            fontSize: "13px",
            color: "#313131",
            borderBottomLeftRadius: "5px",
            borderBottomRightRadius: "5px",
          }}
        >
          {isExpanded ? "Collapse" : `View Full Prompt (${countLines(code)} lines)`}
        </button>
      )}
    </div>
  );
}

function countLines(code: string): number {
  return code.trim().split("\n").length;
}

// Custom color mapping for Python syntax to fit the sage green theme
function getTokenColor(types: string[]): string {
  const type = types[0];
  
  switch (type) {
    case "keyword":
      return "#596647"; // fi-green-600 - darker green for keywords
    case "string":
    case "triple-quoted-string":
      return "#313131"; // fi-black-900 for strings
    case "comment":
      return "#7B8F5E"; // fi-green-400 for comments
    case "function":
    case "builtin":
      return "#596647"; // fi-green-600
    case "number":
      return "#5E7B29"; // fi-green-500
    case "operator":
    case "punctuation":
      return "#596647"; // fi-green-600
    case "class-name":
      return "#5E7B29"; // fi-green-500
    default:
      return "#313131"; // fi-black-900 default
  }
}
