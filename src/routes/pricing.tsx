import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Crown, Smartphone, CreditCard } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Premium Plans — VJ STREAM UG" },
      { name: "description", content: "Choose a streaming plan from UGX 2,000 daily to UGX 120,000 yearly. Pay with MTN, Airtel Money, Visa, or PayPal." },
    ],
  }),
  component: Pricing,
});

const plans = [
  { key: "daily", name: "Daily", price: 2000, duration: 1, perks: ["24-hour access", "HD streaming", "All premium movies"] },
  { key: "weekly", name: "Weekly", price: 5000, duration: 7, perks: ["7-day access", "HD streaming", "All premium movies", "Offline saves (soon)"] },
  { key: "monthly", name: "Monthly", price: 15000, duration: 30, popular: true, perks: ["30-day access", "Full HD", "All premium movies", "Priority support"] },
  { key: "yearly", name: "Yearly", price: 120000, duration: 365, perks: ["365-day access", "Full HD + 4K (soon)", "All premium movies", "Save 33%", "Early access"] },
];

function Pricing() {
  const { user } = useAuth();

  const subscribe = async (plan: typeof plans[0]) => {
    if (!user) { toast.error("Please sign in first"); return; }
    const ends = new Date(); ends.setDate(ends.getDate() + plan.duration);
    const { error } = await supabase.from("subscriptions").insert({
      user_id: user.id, plan: plan.key, amount_ugx: plan.price, payment_method: "demo", ends_at: ends.toISOString(),
    });
    if (error) toast.error(error.message);
    else toast.success(`${plan.name} plan activated! (Demo — integrate MoMo/Stripe for live payments)`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="container-95 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/40 bg-gold/10 text-gold text-xs font-medium mb-5">
            <Crown className="w-3 h-3" /> Premium Plans
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold">Pick a plan. <span className="text-gold">Start watching.</span></h1>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">Cancel anytime. Pay with what works in Uganda.</p>
        </section>

        <section className="container-95 pb-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((p) => (
            <div key={p.key} className={`relative rounded-2xl border p-6 flex flex-col ${p.popular ? "border-gold bg-gradient-to-b from-gold/10 to-card shadow-gold" : "border-border bg-card"}`}>
              {p.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-gold text-black text-xs font-bold rounded-full">MOST POPULAR</span>}
              <h3 className="font-display text-xl font-bold">{p.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-bold">UGX {p.price.toLocaleString()}</span>
              </div>
              <ul className="mt-5 space-y-2.5 flex-1">
                {p.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-gold mt-0.5 shrink-0" /> <span>{perk}</span>
                  </li>
                ))}
              </ul>
              <button onClick={() => subscribe(p)} className={`mt-6 w-full py-2.5 rounded-md font-semibold ${p.popular ? "bg-gradient-gold text-black shadow-gold" : "border border-border hover:border-gold hover:text-gold"}`}>
                {user ? "Subscribe" : "Sign in to subscribe"}
              </button>
            </div>
          ))}
        </section>

        <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h3 className="font-display text-2xl font-bold mb-6">Pay your way</h3>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            {["MTN Mobile Money", "Airtel Money", "Visa", "Mastercard", "PayPal"].map((m) => (
              <div key={m} className="px-4 py-2 rounded-md border border-border bg-card flex items-center gap-2">
                {m.includes("Money") ? <Smartphone className="w-4 h-4 text-gold" /> : <CreditCard className="w-4 h-4 text-gold" />} {m}
              </div>
            ))}
          </div>
          {!user && <Link to="/auth" search={{ mode: "signup" }} className="mt-8 inline-block px-6 py-3 rounded-md bg-gradient-gold text-black font-semibold shadow-gold">Create free account</Link>}
        </section>
      </main>
      <Footer />
    </div>
  );
}
