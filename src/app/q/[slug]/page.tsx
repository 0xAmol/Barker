import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { QuoteForm } from "./form";
import type { Metadata } from "next";

interface Props {
  params: { slug: string };
}

async function getQuotePage(slug: string) {
  const { data: page } = await supabase
    .from("quote_pages")
    .select("*, agents(*)")
    .eq("slug", slug)
    .eq("active", true)
    .single();

  return page;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getQuotePage(params.slug);
  if (!page) return { title: "Barker" };

  return {
    title: `${page.agents.business_name} — Free Quote`,
    description: page.subheadline || `Get a free quote from ${page.agents.business_name}`,
    openGraph: {
      title: page.headline || `${page.agents.business_name} — Free Quote`,
      description: page.subheadline,
    },
  };
}

export default async function QuotePage({ params }: Props) {
  const page = await getQuotePage(params.slug);
  if (!page) notFound();

  const agent = page.agents;
  const reviews = (page.review_highlights || []) as {
    text: string;
    author: string;
    rating: number;
  }[];
  const services = (page.services_list || []) as string[];

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />
      <div className="page">
        {/* NAV */}
        <nav className="nav">
          <div className="nav-biz">{agent.business_name}</div>
          {page.phone_display && (
            <a href={`tel:${page.phone_display}`} className="nav-phone">
              {page.phone_display}
            </a>
          )}
        </nav>

        {/* HERO */}
        <section className="hero">
          <div className="hero-content">
            {agent.rating && (
              <div className="rating-badge">
                {"★".repeat(Math.round(agent.rating || 5))}{" "}
                {agent.rating}/5
                {agent.total_leads > 0 && ` · ${agent.total_leads}+ jobs`}
              </div>
            )}
            <h1>{page.headline || `${agent.business_name}`}</h1>
            <p className="subheadline">
              {page.subheadline ||
                `Professional ${agent.services?.[0] || "service"} in ${agent.service_area?.[0] || "your area"}. Fast response, fair pricing.`}
            </p>

            {/* SERVICES */}
            {services.length > 0 && (
              <div className="services">
                {services.map((s: string, i: number) => (
                  <span key={i} className="service-pill">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* FORM */}
          <div className="form-card">
            <div className="form-header">
              <h2>{page.cta_text || "Get a Free Quote"}</h2>
              <p className="form-sub">
                Takes 30 seconds. We&#39;ll call you back fast.
              </p>
            </div>
            <QuoteForm
              agentId={agent.id}
              services={agent.services || []}
              serviceArea={agent.service_area || []}
            />
          </div>
        </section>

        {/* REVIEWS */}
        {reviews.length > 0 && (
          <section className="reviews">
            <div className="reviews-label">What customers say</div>
            <div className="reviews-grid">
              {reviews.map(
                (
                  r: { text: string; author: string; rating: number },
                  i: number
                ) => (
                  <div key={i} className="review-card">
                    <div className="review-stars">
                      {"★".repeat(r.rating)}
                    </div>
                    <p className="review-text">&ldquo;{r.text}&rdquo;</p>
                    <div className="review-author">— {r.author}</div>
                  </div>
                )
              )}
            </div>
          </section>
        )}

        {/* TRUST */}
        <section className="trust">
          <div className="trust-items">
            <div className="trust-item">
              <div className="trust-icon">⚡</div>
              <div>Fast response</div>
            </div>
            <div className="trust-item">
              <div className="trust-icon">💰</div>
              <div>Free quotes</div>
            </div>
            <div className="trust-item">
              <div className="trust-icon">🛡️</div>
              <div>Licensed &amp; insured</div>
            </div>
            <div className="trust-item">
              <div className="trust-icon">📍</div>
              <div>Local to {agent.service_area?.[0] || "your area"}</div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="footer">
          <span>Powered by Barker AI</span>
        </footer>
      </div>

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'DM Sans', sans-serif; color: #ece6d8; -webkit-font-smoothing: antialiased; background: #0c0b09; margin: 0; }
        .page { min-height: 100vh; background: #0c0b09; }

        .nav {
          display: flex; justify-content: space-between; align-items: center;
          padding: 16px 32px; border-bottom: 1px solid #252219;
        }
        .nav-biz { font-family: 'DM Serif Display', serif; font-size: 18px; }
        .nav-phone {
          font-family: 'JetBrains Mono', monospace; font-size: 13px;
          color: #d4a843; text-decoration: none; padding: 8px 16px;
          border: 1px solid #8a6e2a; border-radius: 8px;
        }
        .nav-phone:hover { background: #1e1a12; }

        .hero {
          max-width: 1080px; margin: 0 auto; padding: 60px 32px 80px;
          display: grid; grid-template-columns: 1fr 380px; gap: 60px; align-items: start;
        }

        .rating-badge {
          display: inline-block; font-size: 13px; color: #d4a843;
          background: #1e1a12; border: 1px solid #8a6e2a;
          padding: 6px 14px; border-radius: 100px; margin-bottom: 24px;
          font-family: 'JetBrains Mono', monospace; letter-spacing: 0.03em;
        }

        h1 {
          font-family: 'DM Serif Display', serif; font-size: clamp(32px, 4vw, 48px);
          font-weight: 400; line-height: 1.1; margin-bottom: 16px;
        }
        .subheadline {
          font-size: 17px; color: #b0a898; line-height: 1.7;
          max-width: 480px; margin-bottom: 28px;
        }

        .services { display: flex; flex-wrap: wrap; gap: 6px; }
        .service-pill {
          font-size: 12px; padding: 6px 14px; border-radius: 100px;
          background: #141311; border: 1px solid #252219; color: #b0a898;
          font-family: 'JetBrains Mono', monospace; letter-spacing: 0.02em;
        }

        .form-card {
          background: #141311; border: 1px solid #302b22;
          border-radius: 16px; padding: 32px; position: sticky; top: 24px;
        }
        .form-header { margin-bottom: 24px; }
        .form-header h2 {
          font-family: 'DM Serif Display', serif; font-size: 22px;
          font-weight: 400; margin-bottom: 6px;
        }
        .form-sub { font-size: 13px; color: #6e675d; }

        .reviews {
          max-width: 1080px; margin: 0 auto; padding: 0 32px 80px;
        }
        .reviews-label {
          font-family: 'JetBrains Mono', monospace; font-size: 10px;
          letter-spacing: 0.15em; text-transform: uppercase;
          color: #8a6e2a; margin-bottom: 24px;
        }
        .reviews-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; }
        .review-card {
          background: #141311; border: 1px solid #252219;
          border-radius: 12px; padding: 24px;
        }
        .review-stars { color: #d4a843; font-size: 14px; margin-bottom: 10px; }
        .review-text { font-size: 14px; color: #b0a898; line-height: 1.6; margin-bottom: 10px; font-style: italic; }
        .review-author { font-size: 12px; color: #6e675d; }

        .trust {
          max-width: 1080px; margin: 0 auto; padding: 0 32px 60px;
        }
        .trust-items {
          display: flex; justify-content: center; gap: 40px; flex-wrap: wrap;
          padding: 32px; border: 1px solid #252219; border-radius: 12px;
          background: #141311;
        }
        .trust-item { display: flex; align-items: center; gap: 10px; font-size: 14px; color: #b0a898; }
        .trust-icon { font-size: 18px; }

        .footer {
          text-align: center; padding: 24px; font-size: 11px; color: #6e675d;
          border-top: 1px solid #252219;
          font-family: 'JetBrains Mono', monospace; letter-spacing: 0.05em;
        }

        @media (max-width: 800px) {
          .hero { grid-template-columns: 1fr; gap: 32px; padding: 40px 20px; }
          .form-card { position: static; }
          .nav { padding: 14px 20px; }
          .reviews, .trust { padding-left: 20px; padding-right: 20px; }
        }
      `}</style>
    </>
  );
}
