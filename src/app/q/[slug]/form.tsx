"use client";

import { useState } from "react";

interface QuoteFormProps {
  agentId: string;
  services: string[];
  serviceArea: string[];
}

export function QuoteForm({ agentId, services, serviceArea }: QuoteFormProps) {
  const [step, setStep] = useState<"form" | "submitting" | "success" | "error">("form");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    service_needed: "",
    location: serviceArea[0] || "",
    urgency: "this_week",
    notes: "",
  });

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone) return;

    setStep("submitting");

    try {
      // Grab UTM params from URL
      const params = new URLSearchParams(window.location.search);

      const res = await fetch("/api/leads/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_id: agentId,
          ...formData,
          utm_source: params.get("utm_source"),
          utm_medium: params.get("utm_medium"),
          utm_campaign: params.get("utm_campaign"),
          source_platform: params.get("src") || params.get("utm_source"),
          source_post_url: params.get("ref"),
        }),
      });

      if (!res.ok) throw new Error("Submission failed");

      setStep("success");
    } catch {
      setStep("error");
    }
  };

  if (step === "success") {
    return (
      <div className="form-success">
        <div className="success-icon">✓</div>
        <h3>We got your request!</h3>
        <p>We'll call you back shortly. Usually within the hour.</p>
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="form-success">
        <h3>Something went wrong</h3>
        <p>Please try again or call us directly.</p>
        <button onClick={() => setStep("form")} className="retry-btn">
          Try again
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="form-fields">
        <div className="field">
          <label>Your name *</label>
          <input
            type="text"
            placeholder="Dave Johnson"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="field">
          <label>Phone number *</label>
          <input
            type="tel"
            placeholder="(832) 555-0147"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>

        <div className="field">
          <label>What do you need?</label>
          {services.length > 0 ? (
            <select
              value={formData.service_needed}
              onChange={(e) =>
                setFormData({ ...formData, service_needed: e.target.value })
              }
            >
              <option value="">Select a service...</option>
              {services.map((s, i) => (
                <option key={i} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
              <option value="other">Other</option>
            </select>
          ) : (
            <input
              type="text"
              placeholder="e.g. Kitchen sink is leaking"
              value={formData.service_needed}
              onChange={(e) =>
                setFormData({ ...formData, service_needed: e.target.value })
              }
            />
          )}
        </div>

        <div className="field">
          <label>Your area</label>
          <input
            type="text"
            placeholder="City or neighborhood"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
          />
        </div>

        <div className="field">
          <label>When do you need this?</label>
          <div className="urgency-pills">
            {[
              { value: "today", label: "Today" },
              { value: "this_week", label: "This week" },
              { value: "this_month", label: "This month" },
              { value: "flexible", label: "Flexible" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`urgency-pill ${formData.urgency === opt.value ? "active" : ""}`}
                onClick={() =>
                  setFormData({ ...formData, urgency: opt.value })
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>Anything else? (optional)</label>
          <textarea
            placeholder="Details that would help us give you an accurate quote..."
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            rows={2}
          />
        </div>

        <button
          className="submit-btn"
          onClick={handleSubmit}
          disabled={!formData.name || !formData.phone || step === "submitting"}
        >
          {step === "submitting" ? "Sending..." : "Get My Free Quote →"}
        </button>

        <p className="form-fine">
          No spam. No obligation. We just call you back.
        </p>
      </div>

      <style>{`
        .form-fields { display: flex; flex-direction: column; gap: 16px; }
        .field { display: flex; flex-direction: column; gap: 6px; }
        .field label {
          font-size: 12px; font-weight: 500; color: #b0a898;
          font-family: 'JetBrains Mono', monospace; letter-spacing: 0.03em;
        }
        .field input, .field select, .field textarea {
          background: #0c0b09; border: 1px solid #302b22; border-radius: 10px;
          padding: 14px 16px; font-size: 15px; color: #ece6d8;
          font-family: 'DM Sans', sans-serif; outline: none; transition: border-color 0.2s;
          width: 100%;
        }
        .field input:focus, .field select:focus, .field textarea:focus {
          border-color: #8a6e2a;
        }
        .field input::placeholder, .field textarea::placeholder { color: #6e675d; }
        .field select { cursor: pointer; }
        .field select option { background: #141311; color: #ece6d8; }
        .field textarea { resize: vertical; min-height: 60px; }

        .urgency-pills { display: flex; gap: 6px; flex-wrap: wrap; }
        .urgency-pill {
          padding: 8px 16px; border-radius: 100px; font-size: 13px;
          background: #0c0b09; border: 1px solid #302b22; color: #b0a898;
          cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif;
        }
        .urgency-pill:hover { border-color: #8a6e2a; }
        .urgency-pill.active {
          background: #1e1a12; border-color: #d4a843; color: #d4a843;
        }

        .submit-btn {
          width: 100%; padding: 16px; border: none; border-radius: 12px;
          background: #d4a843; color: #0c0b09; font-size: 16px; font-weight: 700;
          cursor: pointer; transition: background 0.2s, transform 0.1s;
          font-family: 'DM Sans', sans-serif; margin-top: 4px;
        }
        .submit-btn:hover { background: #f0c850; }
        .submit-btn:active { transform: scale(0.98); }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .form-fine {
          text-align: center; font-size: 11px; color: #6e675d; margin-top: 4px;
        }

        .form-success { text-align: center; padding: 32px 0; }
        .success-icon {
          width: 48px; height: 48px; border-radius: 50%;
          background: #1a3a22; color: #3fba5e; font-size: 22px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px;
        }
        .form-success h3 {
          font-family: 'DM Serif Display', serif; font-size: 20px;
          font-weight: 400; margin-bottom: 8px;
        }
        .form-success p { font-size: 14px; color: #b0a898; }
        .retry-btn {
          margin-top: 16px; padding: 10px 24px; border-radius: 8px;
          border: 1px solid #302b22; background: transparent; color: #ece6d8;
          cursor: pointer; font-size: 13px;
        }
      `}</style>
    </>
  );
}
