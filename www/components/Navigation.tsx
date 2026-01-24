"use client";

import { useEffect, useState, useRef } from "react";
import { useAnimationContext } from "./PageAnimations";

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
      // The navbar starts aligned with "The Moment" section header
      // The sticky point is top-8 (32px from viewport top)
      // We want to collapse when the nav has scrolled past its original position
      const sidebarNav = navRef.current?.closest('.sidebar-nav-fixed');
      if (!sidebarNav) return;

      const rect = sidebarNav.getBoundingClientRect();
      // When the top of the sidebar-nav-fixed container is at or above 32px (the sticky point),
      // the sticky inner element is now "stuck" and should collapse
      const isSticky = rect.top <= 32;
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
      className="cursor-pointer w-full min-w-[180px]"
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

function MobileNavContent({ activeSection }: { activeSection: string }) {
  return (
    <ul className="flex flex-row justify-between gap-2 nav">
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
              className={`flex flex-col items-center text-center transition-colors ${
                isActive
                  ? "text-fi-green-500"
                  : "text-fi-black-900 hover:text-fi-green-500"
              }`}
            >
              <span className="text-xs">{numeral}</span>
              <span className="text-xs leading-tight">{title}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export function MobileNavigation() {
  const [activeSection, setActiveSection] = useState("the-moment");
  const [isSticky, setIsSticky] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const lastScrollY = useRef(0);
  const placeholderRef = useRef<HTMLDivElement>(null);

  // Track scroll direction and position to show/hide sticky nav
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const placeholder = placeholderRef.current;

      if (!placeholder) return;

      const placeholderRect = placeholder.getBoundingClientRect();
      const hasScrolledPastNav = placeholderRect.bottom < 0;

      // Once scrolled past the original nav position
      if (hasScrolledPastNav) {
        setIsSticky(true);
        // Show when scrolling up, hide when scrolling down
        if (currentScrollY < lastScrollY.current) {
          setIsVisible(true);
        } else if (currentScrollY > lastScrollY.current) {
          setIsVisible(false);
        }
      } else {
        // Back at the top, show nav in normal flow
        setIsSticky(false);
        setIsVisible(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
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

  const [hasMounted, setHasMounted] = useState(false);
  const { canAnimate } = useAnimationContext();

  // Fade in after mount with delay, but only when animations are allowed
  useEffect(() => {
    if (!canAnimate) {
      setHasMounted(false);
      return;
    }

    const timer = setTimeout(() => {
      setHasMounted(true);
    }, 400); // 400ms delay to match desktop sidebar nav
    return () => clearTimeout(timer);
  }, [canAnimate]);

  return (
    <>
      {/* In-flow nav - visible when at top of page */}
      <div
        ref={placeholderRef}
        className="mb-8 transition-opacity duration-500 ease-in-out"
        style={{
          opacity: hasMounted && !isSticky ? 1 : 0,
          transform: hasMounted ? 'translateY(0)' : 'translateY(-12px)',
          transition: 'opacity 0.6s ease-in-out, transform 0.6s ease-in-out',
        }}
      >
        <MobileNavContent activeSection={activeSection} />
      </div>

      {/* Fixed nav - appears when scrolling up after passing the in-flow nav */}
      <div
        className="fixed top-0 left-0 w-full bg-fi-green-100 z-[100] transition-transform duration-300 ease-in-out"
        style={{
          transform: isSticky && isVisible ? 'translateY(0)' : 'translateY(-100%)',
        }}
      >
        <div className="px-6 py-4">
          <MobileNavContent activeSection={activeSection} />
        </div>
      </div>
    </>
  );
}

