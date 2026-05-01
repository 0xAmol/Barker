export const metadata = { title: 'Terms of Service — Barker' }

export default function Terms() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '60px 24px', color: '#fff', background: '#000', fontFamily: '-apple-system, sans-serif', lineHeight: 1.6, minHeight: '100vh' }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 24 }}>Terms of Service</h1>
      <p style={{ color: '#888', marginBottom: 32 }}>Last updated: May 1, 2026</p>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>The service</h2>
      <p>Barker is an AI sales agent for local service businesses. We scan public sources for people requesting service recommendations, draft replies in your voice, capture leads, and notify you via SMS.</p>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>Account responsibility</h2>
      <p>You are responsible for the accuracy of information you provide and for your use of the service. You agree to use Barker in compliance with applicable laws and platform terms (including Facebook&rsquo;s community standards when replies are posted on your behalf).</p>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>Pricing</h2>
      <p>Your first five leads are free. After that, leads are priced per category ($8&ndash;$30). You will be charged only for leads you mark as won or where you fail to respond within seven days.</p>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>SMS notifications</h2>
      <p>SMS notifications are an essential part of the service. By signing up you consent to receive SMS for new leads and weekly summaries. You can opt out by replying STOP, but doing so will disable lead notifications.</p>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>Termination</h2>
      <p>You can cancel your account anytime. We may suspend accounts that violate these terms or engage in spam, harassment, or illegal activity.</p>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>Liability</h2>
      <p>Barker is provided as-is. We make no guarantee about the quality, conversion rate, or revenue generated from leads. You are responsible for your own business operations.</p>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>Contact</h2>
      <p>Questions? Email <a href="mailto:hello@barker.app" style={{ color: '#E5B547' }}>hello@barker.app</a>.</p>
    </main>
  )
}
