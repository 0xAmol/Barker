export const metadata = { title: 'Privacy Policy — Barker' }

export default function Privacy() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '60px 24px', color: '#fff', background: '#000', fontFamily: '-apple-system, sans-serif', lineHeight: 1.6, minHeight: '100vh' }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 24 }}>Privacy Policy</h1>
      <p style={{ color: '#888', marginBottom: 32 }}>Last updated: May 1, 2026</p>

      <h2 style={h2}>Information we collect</h2>
      <p>When you sign up for Barker at <a href="/signup" style={a}>barkerapp.vercel.app/signup</a>, we collect your name, business name, mobile phone number, email, and Google Business profile URL. We use this information to operate the service — finding leads for your business and notifying you when new leads arrive.</p>

      <h2 style={h2}>SMS notifications and consent</h2>
      <p>By checking the SMS consent checkbox during signup at <a href="/signup" style={a}>barkerapp.vercel.app/signup</a>, you expressly consent to receive SMS messages from Barker, including:</p>
      <ul style={{ marginLeft: 20, marginTop: 12, marginBottom: 16 }}>
        <li>New lead notifications when our platform identifies a relevant sales opportunity for your business</li>
        <li>Confirmation messages when you respond to update lead status</li>
        <li>Weekly summary reports of leads, conversions, and account activity</li>
        <li>Account-related notifications (low credit balance, payment confirmations)</li>
      </ul>
      <p><strong>Message frequency:</strong> typically 5 to 30 messages per month, varying with the lead volume of your business.</p>
      <p style={{ marginTop: 12 }}><strong>Message and data rates:</strong> standard message and data rates from your mobile carrier may apply.</p>
      <p style={{ marginTop: 12 }}><strong>Opt-out:</strong> reply <strong>STOP</strong> to any message to immediately and permanently unsubscribe from SMS notifications. After opting out, you will not receive further SMS, but other Barker services remain unaffected.</p>
      <p style={{ marginTop: 12 }}><strong>Help:</strong> reply <strong>HELP</strong> to any message for support information, or contact us at <a href="mailto:hello@barker.app" style={a}>hello@barker.app</a>.</p>
      <p style={{ marginTop: 12 }}>Phone numbers are never collected from public sources, purchased lists, or third parties. We never share, sell, or transfer phone numbers to third parties for any purpose. Phone numbers are used exclusively for the SMS notifications you have consented to receive.</p>

      <h2 style={h2}>How we use your information</h2>
      <p>We use your information to operate Barker, send you lead notifications, process payments, and improve our service. We do not sell your data to third parties.</p>

      <h2 style={h2}>Third-party services</h2>
      <p>Barker uses Twilio for SMS, Supabase for data storage, Anthropic for AI processing, and Crossmint for payment infrastructure. These providers process data on our behalf under their respective terms.</p>

      <h2 style={h2}>Your rights</h2>
      <p>You can request access to, correction of, or deletion of your personal data at any time by emailing <a href="mailto:privacy@barker.app" style={a}>privacy@barker.app</a>.</p>

      <h2 style={h2}>Contact</h2>
      <p>Questions? Email <a href="mailto:privacy@barker.app" style={a}>privacy@barker.app</a>.</p>
    </main>
  )
}

const h2: React.CSSProperties = { fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 12 }
const a: React.CSSProperties = { color: '#E5B547' }
