'use client';

import { useState } from 'react';

type SubscribeStatus = 'idle' | 'loading' | 'subscribed' | 'error';

interface InlineEmailGateProps {
  onSuccess: () => void;
  source?: string;
  prompt?: string;
}

export default function InlineEmailGate({ onSuccess, source, prompt }: InlineEmailGateProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<SubscribeStatus>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), appendTimestamp: true, source }),
      });

      const data = await response.json();

      if (data.status === 'subscribed' || data.status === 'already_subscribed') {
        setStatus('subscribed');

        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'email_subscribe', {
            event_category: 'engagement',
            event_label: 'fundraising_gate',
            value: 1,
          });
        }

        // Brief beat on "Success!" before revealing the content
        setTimeout(() => onSuccess(), 400);
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

  return (
    <div className="w-full max-w-md mx-auto text-center">
      <p className="text-lg md:text-xl leading-relaxed mb-6 text-balance text-fi-black-900">
        {prompt ?? 'Enter your email to keep reading.'}
      </p>

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

      {message && status === 'error' && (
        <p className="pt-4 text-sm text-red-600">{message}</p>
      )}
    </div>
  );
}
