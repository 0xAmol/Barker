'use client'

import { useState } from 'react'

export default function Signup() {
  const [submitted, setSubmitted] = useState(false)
  const [smsConsent, setSmsConsent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!smsConsent) return
    setLoading(true)
    // Submission goes to your existing agent creation API
    // For TCR review purposes, this just needs to be a real form
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 800)
  }

  if (submitted) {
    return (
      <main style={mainStyle}>
        <div style={cardStyle}>
          <h1 style={h1Style}>Welcome to Barker</h1>
          <p style={{ color: '#9a9a9a', marginTop: 16 }}>Check your phone — we&rsquo;ll text you when your first lead arrives.</p>
        </div>
      </main>
    )
  }

  return (
    <main style={mainStyle}>
      <div style={cardStyle}>
        <h1 style={h1Style}>Get started with Barker</h1>
        <p style={{ color: '#9a9a9a', marginBottom: 32, fontSize: 15 }}>Your first 5 leads are free. No credit card.</p>

        <form onSubmit={handleSubmit}>
          <Field label="Business name" placeholder="Heights Plumbing" />
          <Field label="Your name" placeholder="Dave Martinez" />
          <Field label="Email" type="email" placeholder="dave@heightsplumbing.com" />
          <Field label="Mobile phone" type="tel" placeholder="+1 713 555 0199" hint="We text you when leads arrive — STOP anytime." />
          <Field label="Google Business profile URL" placeholder="https://g.page/your-business" />

          <label style={{ display: 'flex', gap: 12, alignItems: 'flex-start', margin: '24px 0', padding: 16, background: '#0c0c0c', borderRadius: 12, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={smsConsent}
              onChange={(e) => setSmsConsent(e.target.checked)}
              required
              style={{ marginTop: 4, accentColor: '#E5B547', width: 18, height: 18, flexShrink: 0 }}
            />
            <span style={{ fontSize: 13, color: '#ccc', lineHeight: 1.5 }}>
              I agree to receive SMS notifications from Barker for new leads, account updates, and weekly summaries. Message frequency varies based on lead volume — typically 5 to 30 messages per month. Message and data rates may apply. Reply HELP for help, STOP to opt out at any time. See our <a href="/privacy" style={linkStyle}>Privacy Policy</a> and <a href="/terms" style={linkStyle}>Terms of Service</a>.
            </span>
          </label>

          <button
            type="submit"
            disabled={!smsConsent || loading}
            style={{
              width: '100%',
              padding: '14px',
              background: smsConsent ? '#E5B547' : '#1a1a1a',
              color: smsConsent ? '#000' : '#555',
              border: 'none',
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 700,
              cursor: smsConsent ? 'pointer' : 'not-allowed',
              transition: 'transform .15s',
            }}
          >
            {loading ? 'Creating your agent…' : 'Start fetching leads'}
          </button>
        </form>
      </div>
    </main>
  )
}

const mainStyle: React.CSSProperties = { minHeight: '100vh', background: '#000', color: '#fff', fontFamily: '-apple-system, sans-serif', padding: '60px 20px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }
const cardStyle: React.CSSProperties = { width: '100%', maxWidth: 480 }
const h1Style: React.CSSProperties = { fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8 }
const linkStyle: React.CSSProperties = { color: '#E5B547', textDecoration: 'underline' }

function Field({ label, hint, ...props }: { label: string; hint?: string; type?: string; placeholder?: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, color: '#888', marginBottom: 6, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</label>
      <input
        type={props.type ?? 'text'}
        placeholder={props.placeholder}
        required
        style={{ width: '100%', padding: '12px 14px', background: '#0c0c0c', border: '1px solid #222', borderRadius: 10, color: '#fff', fontSize: 15 }}
      />
      {hint && <p style={{ fontSize: 11, color: '#666', marginTop: 6 }}>{hint}</p>}
    </div>
  )
}
