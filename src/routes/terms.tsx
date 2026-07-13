import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const TERMS_DATA = {
  title: "VJ STREAM UG — TERMS OF USE",
  lastUpdated: "July 2026",
  introduction: "Welcome to VJ STREAM UG. By accessing our platform, streaming video content, or activating premium account plans, you agree to comply with and be bound by the following comprehensive Terms of Use.",
  sections: [
    {
      title: "1. Account Security & Verification",
      text: "To access premium streaming and downloading features, you must register a secure account profile authenticated via Supabase. You are entirely responsible for keeping your login tokens secure. Sharing your personal profile keys with individuals outside your primary household is strictly prohibited."
    },
    {
      title: "2. Subscription Packages & Billing",
      text: "Premium movie access is locked behind active network plans. Our fixed rates are globally governed as follows:",
      bullets: [
        "Daily Pass: UGX 2,000 provides 24 hours of full platform playback access.",
        "Weekly Pass: UGX 5,000 provides 7 days of full platform playback access.",
        "Monthly Premium: UGX 15,000 provides 30 days of Full HD playback + local device downloads.",
        "Yearly Unlimited: UGX 120,000 provides 365 days of Full HD playback + local device downloads.",
        "No Refunds: Due to the instant delivery and digital consumption nature of live data streams, all verified mobile payments are fully final and non-refundable."
      ]
    },
    {
      title: "3. Local Mobile Money Transactions",
      text: "All financial balances are collected natively using local Mobile Money processing channels (MTN MoMo and Airtel Money). It is your responsibility to ensure your wallet has sufficient balance before initiating a transaction. We are not liable for delayed network prompts originating from mobile carrier system dropouts."
    },
    {
      title: "4. Permitted Use & Content Safeguards",
      text: "VJ STREAM UG grants you a limited, personal, non-commercial license to view media assets. You may not record, duplicate, broadcast publicly, or alter the local Luganda VJ audio commentaries overlaying the media files. Violating copyright rules will result in immediate permanent account termination without warning."
    }
  ]
};

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use — VJ STREAM UG" },
      { name: "description", content: "Official platform guidelines, payment agreements, and subscription terms." },
    ],
  }),
  component: TermsComponent,
});

function TermsComponent() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 container-95 py-16 max-w-3xl mx-auto px-4">
        <h1 className="text-4xl font-display font-bold text-gold mb-2">{TERMS_DATA.title}</h1>
        <p className="text-xs text-muted-foreground mb-8">Last Updated: {TERMS_DATA.lastUpdated}</p>
        <p className="text-sm leading-relaxed text-muted-foreground mb-8 bg-card/30 border border-border/40 p-4 rounded-lg">
          {TERMS_DATA.introduction}
        </p>

        <div className="space-y-8">
          {TERMS_DATA.sections.map((sec, i) => (
            <div key={i} className="space-y-3 border-b border-border/20 pb-6 last:border-0">
              <h2 className="text-xl font-semibold text-white">{sec.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{sec.text}</p>
              {sec.bullets && (
                <ul className="space-y-2.5 pl-5 list-disc text-sm text-muted-foreground/90">
                  {sec.bullets.map((b, idx) => (
                    <li key={idx} className="leading-relaxed">{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}