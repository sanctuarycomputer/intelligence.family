"use client";

import { useEffect, useState, ReactNode, CSSProperties } from "react";

interface AnimatedElementProps {
  children: ReactNode;
  delay: number;
  className?: string;
  style?: CSSProperties;
  as?: keyof JSX.IntrinsicElements;
}

export function AnimatedElement({ 
  children, 
  delay, 
  className = "", 
  style = {},
  as: Component = "div" 
}: AnimatedElementProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const animationStyle: CSSProperties = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? "translateY(0)" : "translateY(-12px)",
    transition: "opacity 0.6s ease-in-out, transform 0.6s ease-in-out",
    ...style,
  };

  return (
    <Component className={className} style={animationStyle}>
      {children}
    </Component>
  );
}
