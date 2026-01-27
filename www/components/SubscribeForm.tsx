'use client';

import { useState } from 'react';

type SubscribeStatus = 'idle' | 'loading' | 'subscribed' | 'already_subscribed' | 'error';

export default function SubscribeForm() {
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });
      
      const data = await response.json();
      
      setStatus(data.status);
      setMessage(data.message);
      
      if (data.status === 'subscribed' || data.status === 'already_subscribed') {
        setEmail('');
        // Send Google Analytics event
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'email_subscribe', {
            event_category: 'engagement',
            event_label: 'subscribe_form',
            value: 1
          });
        }
      }
    } catch (error) {
      console.error('Subscribe error:', error);
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center rounded-sm overflow-hidden bg-[rgba(184,198,176,0.4)]">
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
            className="flex-1 px-4 py-3 bg-transparent outline-none placeholder:text-fi-black-900/50 font-mono text-sm tracking-wide"
            disabled={status === 'loading'}
            style={{ fontVariationSettings: "'MONO' 100" }}
          />
          <button
            type="submit"
            disabled={status === 'loading' || !email.trim()}
            className="m-[10px] px-4 py-2 bg-[#B8C6B0] hover:bg-fi-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium tracking-wide rounded-sm"
          >
            {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
          </button>
        </div>
      </form>
      
      {/* Status message */}
      {message && (
        <p 
          className={`mt-3 text-sm ${
            status === 'error' 
              ? 'text-red-600' 
              : status === 'already_subscribed'
              ? 'text-fi-green-500'
              : 'text-fi-green-500'
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}

