import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

// 1. DATA OBJECT (Right here in the same file so you don't need a constants folder)
const VJ_STREAM_PRIVACY_POLICY = {
  title: "VJ STREAM UG — PRIVACY POLICY",
  lastUpdated: "July 2026",
  introduction: "At VJ STREAM UG, we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, store, and utilize your information when you use our web platform to stream premium VJ-translated Luganda entertainment.",
  sections: [
    {
      id: "information-collection",
      title: "1. The Information We Collect",
      description: "We only collect minimal data necessary to maintain your streaming profile and track active access criteria:",
      points: [
        "Account Profile: Managed securely through Supabase Auth. We retain your email address and basic profile tokens. We do not store or read your private network passwords.",
        "Mobile Money Billing: When purchasing viewing time (Daily, Weekly, Monthly, or Yearly tiers), transaction status handles are verified via native payment APIs. No raw banking pins or financial details are saved.",
        "Streaming Aggregation: Anonymous view counters are tabulated exclusively to update our local 'Top 10 Trending in Uganda' rows and curate optimal catalog categories."
      ]
    },
    {
      id: "information-usage",
      title: "2. How We Use Your Information",
      description: "Your information guarantees that backend services are delivered smoothly and securely:",
      points: [
        "To instantly validate premium streaming privileges and grant device download access for offline storage plans.",
        "To maintain your active session tokens securely in your browser storage so you don't have to log in repeatedly.",
        "To diagnose playback errors or network drops to minimize streaming interruptions."
      ]
    },
    {
      id: "data-security",
      title: "3. Data Safety & Protection Standards",
      description: "We employ strict security rules to defend your details:",
      points: [
        "We never sell, rent, or trade user profile identifiers to third-party ad networks or marketing groups.",
        "All data routing is protected by industry-standard cryptographic web signatures (JWT tokens) linked directly to your authenticated session."
      ]
    }
  ]
};

// 2. ROUTE DEFINITION
export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — VJ STREAM UG" },
      { name: "description", content: "Privacy Policy and data standards for VJ STREAM UG premium streaming." },
    ],
  }),
  component: PrivacyComponent,
});

// 3. VISUAL COMPONENT
function PrivacyComponent() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Universal Website Navbar */}
      <Navbar />

      {/* Main Content Layout */}
      <main className="flex-1 container-95 py-16 max-w-3xl mx-auto px-4">
        <h1 className="text-4xl font-display font-bold text-gold mb-2">
          {VJ_STREAM_PRIVACY_POLICY.title}
        </h1>
        <p className="text-xs text-muted-foreground mb-8">
          Last Updated: {VJ_STREAM_PRIVACY_POLICY.lastUpdated}
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground mb-8 bg-card/40 border border-border/40 p-4 rounded-lg">
          {VJ_STREAM_PRIVACY_POLICY.introduction}
        </p>

        <div className="space-y-8">
          {VJ_STREAM_PRIVACY_POLICY.sections.map((sec) => (
            <div key={sec.id} className="space-y-3 border-b border-border/20 pb-6 last:border-0">
              <h2 className="text-xl font-semibold text-white">{sec.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{sec.description}</p>
              
              {sec.points && (
                <ul className="space-y-2.5 pl-5 list-disc text-sm text-muted-foreground/90">
                  {sec.points.map((pt, i) => (
                    <li key={i} className="leading-relaxed">{pt}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </main>

      {/* Universal Website Footer */}
      <Footer />
    </div>
  );
}