export const metadata = { title: 'Privacy Policy — Barker' }

export default function Privacy() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '60px 24px', color: '#fff', background: '#000', fontFamily: '-apple-system, sans-serif', lineHeight: 1.6, minHeight: '100vh' }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 24 }}>Privacy Policy</h1>
      <p style={{ color: '#888', marginBottom: 32 }}>Last updated: May 1, 2026</p>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>Information we collect</h2>
      <p>When you sign up for Barker, we collect your name, business name, phone number, email, and Google Business profile URL. We use this information to operate the service — finding leads for your business and notifying you when new leads arrive.</p>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>SMS consent and messaging</h2>
      <p>By providing your phone number during signup, you consent to receive SMS messages from Barker for the purpose of new-lead notifications and weekly summary reports. Message frequency depends on the volume of leads your business receives. Standard message and data rates may apply. You can opt out at any time by replying STOP. Reply HELP for help.</p>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>How we use your information</h2>
      <p>We use your information to operate Barker, send you lead notifications, process payments, and improve our service. We do not sell your data to third parties.</p>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>Third-party services</h2>
      <p>Barker uses Twilio for SMS, Supabase for data storage, Anthropic for AI processing, and Crossmint for payment infrastructure. These providers process data on our behalf under their respective terms.</p>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>Your rights</h2>
      <p>You can request access to, correction of, or deletion of your personal data at any time by emailing privacy@barker.app.</p>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>Contact</h2>
      <p>Questions? Email <a href="mailto:privacy@barker.app" style={{ color: '#E5B547' }}>privacy@barker.app</a>.</p>
    </main>
  )
}
