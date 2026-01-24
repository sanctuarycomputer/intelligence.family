'use client';

import { useState, ReactNode } from 'react';
import EmailGateModal from './EmailGateModal';
import { AnimationProvider } from './PageAnimations';

// Toggle this to enable/disable the email gate modal
export const EMAIL_GATE_ENABLED = true;

interface EmailGateWrapperProps {
  children: ReactNode;
}

export default function EmailGateWrapper({ children }: EmailGateWrapperProps) {
  const [isGateOpen, setIsGateOpen] = useState(EMAIL_GATE_ENABLED);
  const [canAnimate, setCanAnimate] = useState(!EMAIL_GATE_ENABLED);

  const handleGateSuccess = () => {
    setIsGateOpen(false);
    // Small delay before starting animations
    setTimeout(() => {
      setCanAnimate(true);
    }, 100);
  };

  return (
    <AnimationProvider canAnimate={canAnimate}>
      {isGateOpen && <EmailGateModal onSuccess={handleGateSuccess} />}
      {children}
    </AnimationProvider>
  );
}
