"use client";

import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { id: "the-moment", label: "I. The Moment" },
  { id: "the-idea", label: "II. The Idea" },
  { id: "the-system", label: "III. The System" },
  { id: "work-with-us", label: "IV. Work with Us" },
];

export default function Navigation() {
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

  return (
    <ul className="flex flex-col gap-3 nav">
      {NAV_ITEMS.map(({ id, label }) => {
        const isActive = activeSection === id;
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
              className={`transition-colors ${
                isActive
                  ? "text-fi-green-500"
                  : "text-fi-black-900 hover:text-fi-green-500"
              }`}
            >
              {label}
            </a>
          </li>
        );
      })}
    </ul>
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
      {NAV_ITEMS.map(({ id, label }) => {
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
              {label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

