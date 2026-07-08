'use client';

import { useState, useEffect } from 'react';

type SubscribeStatus = 'idle' | 'loading' | 'subscribed' | 'already_subscribed' | 'error';

interface EmailGateModalProps {
  onSuccess: () => void;
}

export default function EmailGateModal({ onSuccess }: EmailGateModalProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<SubscribeStatus>('idle');
  const [message, setMessage] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Scroll to top when modal mounts
    window.scrollTo(0, 0);
    // Prevent scrolling while modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) return;

    setStatus('loading');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          appendTimestamp: true,
        }),
      });

      const data = await response.json();

      if (data.status === 'subscribed' || data.status === 'already_subscribed') {
        setStatus('subscribed');
        setMessage(data.message);

        // Send Google Analytics event
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'email_subscribe', {
            event_category: 'engagement',
            event_label: 'email_gate',
            value: 1
          });
        }

        // Start fade out animation
        setTimeout(() => {
          setIsFadingOut(true);
          // After fade out, scroll to top and trigger success
          setTimeout(() => {
            window.scrollTo(0, 0);
            setIsVisible(false);
            onSuccess();
          }, 500);
        }, 500);
      } else {
        setStatus('error');
        setMessage(data.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Subscribe error:', error);
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-fi-green-100 transition-opacity duration-500 ${
        isFadingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="w-full max-w-md px-6 text-center">
        <p className="text-lg md:text-xl leading-relaxed mb-8 text-balance">
          Welcome, enter your email to view the Family Intelligence research.
        </p>
        <br/>

        <form onSubmit={handleSubmit} className="w-full">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center rounded-sm overflow-hidden bg-[rgba(184,198,176,0.4)]">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status !== 'idle' && status !== 'loading') {
                  setStatus('idle');
                  setMessage('');
                }
              }}
              placeholder="Your Email Address"
              className="flex-1 px-4 py-3 bg-transparent outline-none placeholder:text-fi-black-900/50 font-mono text-sm tracking-wide text-center sm:text-left"
              disabled={status === 'loading' || status === 'subscribed'}
              style={{ fontVariationSettings: "'MONO' 100" }}
              autoFocus
            />
            <button
              type="submit"
              disabled={status === 'loading' || status === 'subscribed' || !email.trim()}
              className="m-2 sm:m-[10px] px-4 py-2 bg-[#B8C6B0] hover:bg-fi-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium tracking-wide rounded-sm"
            >
              {status === 'loading' ? 'Submitting...' : status === 'subscribed' ? 'Success!' : 'Submit'}
            </button>
          </div>
        </form>

        {/* Status message */}
        {message && status === 'error' && (
          <p className="pt-4 text-sm text-red-600">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
