'use client'

import { useState, useEffect } from 'react'

type Step = 'email' | 'code'
type Status = 'idle' | 'loading' | 'error' | 'success'

interface InlineEmailGateProps {
  onSuccess: () => void
  source?: string
  prompt?: string
}

export default function InlineEmailGate({ onSuccess, source, prompt }: InlineEmailGateProps) {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')
  const [resendSecondsLeft, setResendSecondsLeft] = useState(0)

  useEffect(() => {
    if (resendSecondsLeft <= 0) return
    const id = setTimeout(() => setResendSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(id)
  }, [resendSecondsLeft])

  const reset = () => {
    setStep('email')
    setCode('')
    setStatus('idle')
    setMessage('')
  }

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    setMessage('')
    try {
      const res = await fetch('/api/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source }),
      })
      const data = await res.json()
      if (res.ok && data.ok) {
        setStep('code')
        setStatus('idle')
        setResendSecondsLeft(60)
      } else {
        setStatus('error')
        setMessage(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  const submitCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return
    setStatus('loading')
    setMessage('')
    try {
      const res = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      })
      const data = await res.json()
      if (res.ok && data.verified) {
        setStatus('success')
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'email_subscribe', {
            event_category: 'engagement',
            event_label: 'fundraising_gate',
            value: 1,
          })
        }
        setTimeout(() => onSuccess(), 400)
      } else if (res.ok && data.ok === true) {
        setStatus('error')
        setMessage(
          data.attemptsRemaining != null
            ? `Incorrect code. ${data.attemptsRemaining} attempt${data.attemptsRemaining === 1 ? '' : 's'} remaining.`
            : 'Incorrect code.'
        )
      } else {
        setStatus('error')
        setMessage(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  const resendDisabled = resendSecondsLeft > 0

  const inputClass =
    'flex-1 px-4 py-3 bg-transparent outline-none placeholder:text-fi-black-900/50 font-mono text-sm tracking-wide text-center sm:text-left'
  const inputStyle = { fontVariationSettings: "'MONO' 100" } as const
  const buttonClass =
    'm-2 sm:m-[10px] px-4 py-2 bg-[#B8C6B0] hover:bg-fi-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium tracking-wide rounded-sm'

  if (step === 'code') {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <p className="text-lg md:text-xl leading-relaxed mb-6 text-balance text-fi-black-900">
          Enter the 6-digit code we sent to {email}.
        </p>
        <form onSubmit={submitCode} className="w-full">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center rounded-sm overflow-hidden bg-[rgba(184,198,176,0.4)]">
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                if (status !== 'idle') {
                  setStatus('idle')
                  setMessage('')
                }
              }}
              placeholder="6-digit code"
              className={inputClass}
              style={inputStyle}
              disabled={status === 'loading' || status === 'success'}
            />
            <button
              type="submit"
              disabled={status === 'loading' || status === 'success' || code.length !== 6}
              className={buttonClass}
            >
              {status === 'loading' ? 'Verifying...' : status === 'success' ? 'Success!' : 'Verify'}
            </button>
          </div>
        </form>
        <div className="flex justify-center gap-4 pt-4 text-sm">
          <button
            type="button"
            onClick={submitEmail}
            disabled={resendDisabled || status === 'loading'}
            className="underline disabled:opacity-50 disabled:no-underline"
          >
            {resendDisabled ? `Resend in ${resendSecondsLeft}s` : 'Resend code'}
          </button>
          <button type="button" onClick={reset} className="underline">
            Use a different email
          </button>
        </div>
        {message && status === 'error' && (
          <p className="pt-4 text-sm text-red-600">{message}</p>
        )}
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto text-center">
      <p className="text-lg md:text-xl leading-relaxed mb-6 text-balance text-fi-black-900">
        {prompt ?? 'Enter your email to keep reading.'}
      </p>
      <form onSubmit={submitEmail} className="w-full">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center rounded-sm overflow-hidden bg-[rgba(184,198,176,0.4)]">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (status !== 'idle') {
                setStatus('idle')
                setMessage('')
              }
            }}
            placeholder="Your Email Address"
            className={inputClass}
            style={inputStyle}
            disabled={status === 'loading'}
          />
          <button
            type="submit"
            disabled={status === 'loading' || !email.trim()}
            className={buttonClass}
          >
            {status === 'loading' ? 'Sending...' : 'Continue'}
          </button>
        </div>
      </form>
      {message && status === 'error' && (
        <p className="pt-4 text-sm text-red-600">{message}</p>
      )}
    </div>
  )
}
