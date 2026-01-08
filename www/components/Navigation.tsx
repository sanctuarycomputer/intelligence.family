"use client";

import { useEffect, useState, useRef } from "react";

const NAV_ITEMS = [
  { id: "the-moment", numeral: "I.", title: "The Moment" },
  { id: "the-idea", numeral: "II.", title: "The Idea" },
  { id: "the-system", numeral: "III.", title: "The System" },
  { id: "work-with-us", numeral: "IV.", title: "Work with Us" },
];

export default function Navigation() {
  const [activeSection, setActiveSection] = useState("the-moment");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  // Track scroll to detect when navbar becomes sticky
  useEffect(() => {
    const handleScroll = () => {
      // The navbar has top-8 (32px) sticky positioning
      // We want to collapse when we've scrolled past the point where it becomes sticky
      // The sidebar-nav starts at the content-with-sidebar div
      const sidebarNav = navRef.current?.closest('.sidebar-nav');
      if (!sidebarNav) return;
      
      const rect = sidebarNav.getBoundingClientRect();
      // When the top of the sidebar-nav container is at or above the viewport top,
      // the sticky element is now "stuck"
      const isSticky = rect.top <= 0;
      setIsCollapsed(isSticky);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial state
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Active section tracking
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const sectionRatios: Map<string, number> = new Map();

    const updateActiveSection = () => {
      let maxRatio = 0;
      let maxSection = "the-moment";

      sectionRatios.forEach((ratio, sectionId) => {
        if (ratio > maxRatio) {
          maxRatio = ratio;
          maxSection = sectionId;
        }
      });

      // Only update if we have a section with meaningful visibility
      if (maxRatio > 0) {
        setActiveSection(maxSection);
      }
    };

    NAV_ITEMS.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (!element) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            sectionRatios.set(id, entry.intersectionRatio);
          });
          updateActiveSection();
        },
        {
          threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
          rootMargin: "-10% 0px -10% 0px",
        }
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  // The navbar shows expanded when not collapsed OR when hovered
  const showExpanded = !isCollapsed || isHovered;

  return (
    <div 
      ref={navRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="cursor-pointer"
    >
      {/* Top Divider - animates width */}
      <div 
        className="h-px mb-6 mt-[13px] bg-fi-green-500/50 transition-all duration-300 ease-in-out"
        style={{ width: showExpanded ? '100%' : '24px' }}
      />
      
      <ul className="flex flex-col gap-3 nav">
        {NAV_ITEMS.map(({ id, numeral, title }, index) => {
          const isActive = activeSection === id;
          // Staggered delays: 0ms, 50ms, 100ms, 150ms from top to bottom
          const delayMs = index * 50;
          
          return (
            <li key={id} className="relative">
              {/* Active dot - positioned outside to the left */}
              <span
                className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[calc(100%+8px)] w-1.5 h-1.5 rounded-full bg-fi-green-500 transition-opacity duration-200 ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
              />
              <a
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`flex items-center whitespace-nowrap transition-colors duration-200 ${
                  isActive
                    ? "text-fi-green-500"
                    : "text-fi-black-900 hover:text-fi-green-500"
                }`}
              >
                {/* Numeral - always visible */}
                <span className="inline-block">{numeral}</span>
                
                {/* Title container - handles collapse/expand animation with staggered delay */}
                <span 
                  className="inline-block overflow-hidden"
                  style={{
                    transition: `opacity 300ms ease-in-out ${delayMs}ms, max-width 300ms ease-in-out ${delayMs}ms, margin-left 300ms ease-in-out ${delayMs}ms, transform 300ms ease-in-out ${delayMs}ms`,
                    opacity: showExpanded ? 1 : 0,
                    maxWidth: showExpanded ? '200px' : '0px',
                    marginLeft: showExpanded ? '0.25rem' : '0',
                    transform: showExpanded ? 'translateX(0)' : 'translateX(-5px)',
                  }}
                >
                  {/* Title text - inherits color from parent <a>, no transition delay */}
                  <span className="inline-block">{title}</span>
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function MobileNavigation() {
  const [activeSection, setActiveSection] = useState("the-moment");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const sectionRatios: Map<string, number> = new Map();

    const updateActiveSection = () => {
      let maxRatio = 0;
      let maxSection = "the-moment";

      sectionRatios.forEach((ratio, sectionId) => {
        if (ratio > maxRatio) {
          maxRatio = ratio;
          maxSection = sectionId;
        }
      });

      if (maxRatio > 0) {
        setActiveSection(maxSection);
      }
    };

    NAV_ITEMS.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (!element) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            sectionRatios.set(id, entry.intersectionRatio);
          });
          updateActiveSection();
        },
        {
          threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
          rootMargin: "-10% 0px -10% 0px",
        }
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  return (
    <ul className="flex flex-row flex-wrap gap-4 nav">
      {NAV_ITEMS.map(({ id, numeral, title }) => {
        const isActive = activeSection === id;
        return (
          <li key={id}>
            <a
              href={`#${id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`flex items-center gap-2 transition-colors ${
                isActive
                  ? "text-fi-green-500"
                  : "text-fi-black-900 hover:text-fi-green-500"
              }`}
            >
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-fi-green-500" />
              )}
              {numeral} {title}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

