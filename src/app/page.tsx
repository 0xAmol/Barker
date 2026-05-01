import './landing.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Barker — Fetch new jobs',
  description:
    'Your AI sales rep finds local demand, drafts replies in your voice, and texts you the lead. You just reply WON or LOST.',
}

const AppleIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M17.05 12.04c-.03-2.85 2.32-4.22 2.43-4.29-1.32-1.94-3.39-2.21-4.13-2.24-1.76-.18-3.43 1.04-4.32 1.04-.9 0-2.27-1.01-3.74-.99-1.92.03-3.69 1.12-4.68 2.83-2 3.46-.51 8.59 1.43 11.41.95 1.38 2.07 2.93 3.55 2.87 1.43-.06 1.97-.92 3.7-.92s2.22.92 3.74.89c1.55-.03 2.52-1.4 3.46-2.79 1.09-1.6 1.54-3.15 1.57-3.23-.03-.02-3.01-1.16-3.01-4.58zM14.31 3.7c.79-.96 1.32-2.29 1.18-3.62-1.13.05-2.51.76-3.32 1.71-.73.84-1.36 2.19-1.19 3.49 1.27.1 2.55-.64 3.33-1.58z"/></svg>
)

const PlayIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M3.6 1.5C3.2 1.7 3 2.1 3 2.7v18.6c0 .6.2 1 .6 1.2L13.7 12 3.6 1.5zm11.3 11.3l2.6 2.6-9.5 5.5 6.9-8.1zm0-1.6L8 3.1l9.5 5.5-2.6 2.6zm5.6-1.4l-2.5-1.5-2.9 2.9 2.9 2.9 2.5-1.4c.7-.4.7-1.5 0-1.9z"/></svg>
)

const StoreButtons = ({ noMargin = false }: { noMargin?: boolean }) => (
  <div className="bk-stores" style={noMargin ? { marginBottom: 0 } : undefined}>
    <a href="#" className="bk-store">
      <AppleIcon />
      <div><div className="bk-store-sm">Download on the</div><div className="bk-store-lg">App Store</div></div>
    </a>
    <a href="#" className="bk-store">
      <PlayIcon />
      <div><div className="bk-store-sm">Get it on</div><div className="bk-store-lg">Google Play</div></div>
    </a>
  </div>
)

export default function LandingPage() {
  return (
    <div className="bk-page">
      <nav className="bk-nav">
        <div className="bk-logo"><div className="bk-logo-dot" />Barker</div>
        <a href="#download" className="bk-nav-cta">Get the app</a>
      </nav>

      <section className="bk-section">
        <p className="bk-eyebrow">For plumbers · electricians · trades</p>
        <h1 className="bk-headline">Fetch new<br /><em>jobs.</em></h1>
        <p className="bk-sub">Your AI sales rep finds local demand, drafts replies in your voice, and texts you the lead. You just reply WON or LOST.</p>
        <StoreButtons />
        <div className="bk-phone-wrap">
          <div className="bk-phone">
            <div className="bk-screen">
              <div className="ps-head">
                <div className="ps-head-l"><div className="bk-logo-dot" />Barker</div>
                <div className="ps-head-r" />
              </div>
              <div className="ps-card">
                <p className="ps-tag">New lead · 2m ago</p>
                <p className="ps-name">Sarah M.</p>
                <p className="ps-job">Bathroom sink leak — Heights, asap. Has water damage starting.</p>
                <span className="ps-call">📞 Call (713) 555-0142</span>
                <div className="ps-row">
                  <div className="ps-btn ps-won">WON</div>
                  <div className="ps-btn ps-lost">LOST</div>
                </div>
              </div>
              <p className="ps-section-h">Demand alerts · 3 new</p>
              <div className="ps-alert"><div className="ps-alert-dot" /><div><p className="ps-alert-t">&ldquo;Anyone know a good plumber in Montrose? Toilet won&rsquo;t stop running.&rdquo;</p><p className="ps-alert-m">Houston Homeowners · 14m ago</p></div></div>
              <div className="ps-alert"><div className="ps-alert-dot" /><div><p className="ps-alert-t">&ldquo;Need someone for a water heater install this week.&rdquo;</p><p className="ps-alert-m">Heights Neighbors · 41m ago</p></div></div>
              <div className="ps-stats">
                <div><div className="ps-stat-n">7</div><div className="ps-stat-l">Replies</div></div>
                <div><div className="ps-stat-n">3</div><div className="ps-stat-l">Leads</div></div>
                <div><div className="ps-stat-n">$2.4k</div><div className="ps-stat-l">Pipeline</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="bk-divider" />

      <section className="bk-section">
        <p className="bk-eyebrow">Step 1</p>
        <h2 className="bk-feat-h">Find <em>demand</em><br />before they call.</h2>
        <p className="bk-feat-sub">Barker scans local Facebook Groups for people asking for trades. You see the request before your competitors do.</p>
        <div className="bk-phone-wrap">
          <div className="bk-phone">
            <div className="bk-screen">
              <div className="df-search">🔍 Houston · plumbing · today</div>
              <div className="df-post">
                <div className="df-post-head"><div className="df-avatar" /><div className="df-post-meta"><b>Marcus T.</b> · Houston Homeowners<br />posted 8 minutes ago</div></div>
                <p className="df-post-text">Anyone have a recommendation for a <mark>good plumber</mark> in the Heights area? My kitchen sink is backing up bad and I need someone today if possible. TIA!</p>
                <div className="df-draft">⚡ Draft reply →</div>
              </div>
              <div className="df-post">
                <div className="df-post-head"><div className="df-avatar" /><div className="df-post-meta"><b>Linda K.</b> · Montrose Moms<br />posted 24 minutes ago</div></div>
                <p className="df-post-text">Hot water heater <mark>just died</mark> 😩 anyone trustworthy you&rsquo;ve used recently? Hoping to get this sorted before the weekend.</p>
                <div className="df-draft">⚡ Draft reply →</div>
              </div>
              <div className="df-post">
                <div className="df-post-head"><div className="df-avatar" /><div className="df-post-meta"><b>James R.</b> · Heights Neighbors<br />posted 1 hour ago</div></div>
                <p className="df-post-text">Need a <mark>plumber for a remodel</mark> — adding a half bath. Looking for quotes.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="bk-divider" />

      <section className="bk-section">
        <p className="bk-eyebrow">Step 2</p>
        <h2 className="bk-feat-h">Reply in <em>your</em><br />voice. Not a bot&rsquo;s.</h2>
        <p className="bk-feat-sub">Barker learns how you write from your Google Business profile. Every reply sounds like you — never a fake referral, never spammy.</p>
        <div className="bk-phone-wrap">
          <div className="bk-phone">
            <div className="bk-screen">
              <div className="rd-thread">
                <p className="rd-orig">Original post</p>
                <p className="rd-orig-t">&ldquo;Anyone have a recommendation for a good plumber in the Heights? Kitchen sink is backing up bad.&rdquo;</p>
                <div className="rd-draft-head"><span className="rd-pill">DRAFT</span><span className="rd-draft-h">In Dave&rsquo;s voice</span></div>
                <p className="rd-reply">Hey Marcus — Dave with Heights Plumbing here. Sounds like a clog past the trap, pretty common with disposals. I can swing by today, $89 to diagnose and most clogs we knock out same visit. Send me a text at (713) 555-0199 if you want me out there.</p>
                <div className="rd-actions">
                  <div className="rd-send">Send as Dave</div>
                  <div className="rd-edit">Edit</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="bk-divider" />

      <section className="bk-section">
        <p className="bk-eyebrow">Step 3</p>
        <h2 className="bk-feat-h">Reply <em>WON</em><br />or LOST. Done.</h2>
        <p className="bk-feat-sub">When a lead comes in, you get a text with their name, job, and phone. Tap to call. One word back to Barker — that&rsquo;s your only job.</p>
        <div className="bk-phone-wrap">
          <div className="bk-phone">
            <div className="bk-screen">
              <p className="wl-arrived">⚡ New lead · just now</p>
              <div className="wl-card">
                <p className="wl-name">Sarah M.</p>
                <p className="wl-job">Bathroom sink leak</p>
                <div className="wl-detail"><span className="wl-detail-l">Phone</span><span className="wl-detail-v">(713) 555-0142</span></div>
                <div className="wl-detail"><span className="wl-detail-l">Address</span><span className="wl-detail-v">Heights, 77008</span></div>
                <div className="wl-detail"><span className="wl-detail-l">Urgency</span><span className="wl-detail-v">Today, asap</span></div>
                <div className="wl-detail"><span className="wl-detail-l">Source</span><span className="wl-detail-v">Houston Homeowners FB</span></div>
              </div>
              <p className="wl-prompt">After the job · tap one</p>
              <div className="wl-buttons">
                <div className="wl-won">WON</div>
                <div className="wl-lost">LOST</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="bk-strip">
        <div className="bk-strip-item"><div className="bk-strip-n">5</div><div className="bk-strip-l">Free leads</div></div>
        <div className="bk-strip-item"><div className="bk-strip-n">$8–30</div><div className="bk-strip-l">Per lead after</div></div>
        <div className="bk-strip-item"><div className="bk-strip-n">$0</div><div className="bk-strip-l">Setup fees</div></div>
        <div className="bk-strip-item"><div className="bk-strip-n">2 min</div><div className="bk-strip-l">To onboard</div></div>
      </div>

      <section id="download" className="bk-section" style={{ padding: '96px 40px' }}>
        <h2 className="bk-headline" style={{ fontSize: 72 }}>Stop chasing.<br /><em>Start fetching.</em></h2>
        <p className="bk-sub">Free for your first five leads. No credit card.</p>
        <StoreButtons noMargin />
      </section>

      <footer className="bk-footer">
        <div className="bk-footer-logo"><div className="bk-logo-dot" />Barker</div>
        <div className="bk-footer-links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Contact</a>
        </div>
        <p className="bk-copy">© 2026 Barker · Built for tradespeople</p>
      </footer>
    </div>
  )
}
