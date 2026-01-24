"use client";

import { useEffect, useState, ReactNode, CSSProperties, JSX, createContext, useContext } from "react";

// Context to control when animations should start
interface AnimationContextType {
  canAnimate: boolean;
}

const AnimationContext = createContext<AnimationContextType>({ canAnimate: true });

export function AnimationProvider({
  children,
  canAnimate
}: {
  children: ReactNode;
  canAnimate: boolean;
}) {
  return (
    <AnimationContext.Provider value={{ canAnimate }}>
      {children}
    </AnimationContext.Provider>
  );
}

export function useAnimationContext() {
  return useContext(AnimationContext);
}

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
  const { canAnimate } = useAnimationContext();

  useEffect(() => {
    if (!canAnimate) {
      setIsVisible(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay, canAnimate]);

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
