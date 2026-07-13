import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { User as UserIcon, Heart, Clock, CreditCard, Crown, Check, Play, Sparkles } from "lucide-react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar, type DashSection } from "@/components/DashboardSidebar";
import { PaymentCheckout } from "@/components/PaymentCheckout";
import { MovieCard } from "@/components/MovieCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useIsAdmin } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "My Dashboard — VJ STREAM UG" },
      { name: "description", content: "Manage your VJ STREAM UG subscription, favorites, downloads, and payment methods." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

const PLANS = [
  { key: "daily", name: "Daily", price: 2000, duration: 1, perks: ["24-hour access", "HD streaming", "All premium movies"] },
  { key: "weekly", name: "Weekly", price: 5000, duration: 7, perks: ["7-day access", "HD streaming", "All premium movies"] },
  { key: "monthly", name: "Monthly", price: 15000, duration: 30, popular: true, perks: ["30-day access", "Full HD", "Priority support"] },
  { key: "yearly", name: "Yearly", price: 120000, duration: 365, perks: ["365-day access", "Save 33%", "Early access"] },
];

function Dashboard() {
  const { user } = useAuth();
  const isAdmin = useIsAdmin(user?.id);
  const qc = useQueryClient();
  const [section, setSection] = useState<DashSection>("overview");
  const [checkoutPlan, setCheckoutPlan] = useState<typeof PLANS[0] | null>(null);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => (await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle()).data,
    enabled: !!user,
  });

  const { data: favorites } = useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("favorites").select("movies(*)").eq("user_id", user!.id);
      return (data ?? []).map((r: any) => r.movies).filter(Boolean);
    },
    enabled: !!user,
  });

  const { data: history } = useQuery({
    queryKey: ["history", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("watch_history").select("*, movies(*)").eq("user_id", user!.id).order("last_watched", { ascending: false }).limit(20);
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: subs } = useQuery({
    queryKey: ["subs", user?.id],
    queryFn: async () => (await supabase.from("subscriptions").select("*").eq("user_id", user!.id).order("created_at", { ascending: false })).data ?? [],
    enabled: !!user,
  });

  const activeSub = subs?.find((s) => s.status === "active" && new Date(s.ends_at) > new Date());

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <DashboardSidebar section={section} onSelect={setSection} isAdmin={isAdmin} email={user?.email} />
        <SidebarInset className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/80 backdrop-blur h-14 px-4">
            <SidebarTrigger />
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-base sm:text-lg font-bold truncate capitalize">{section === "payments" ? "Subscription & Payment" : section === "continue" ? "Continue Watching" : section === "history" ? "Watch History" : section === "favorites" ? "My Favorites" : section}</h1>
            </div>
            {activeSub ? (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-gradient-gold text-black">
                <Crown className="w-3 h-3" /> {activeSub.plan.toUpperCase()}
              </span>
            ) : (
              <button onClick={() => setSection("payments")} className="text-xs px-3 py-1.5 rounded-md border border-gold text-gold hover:bg-gold/10">Upgrade</button>
            )}
          </header>

          <main className="container-95 py-6 sm:py-8">
            {section === "overview" && (
              <Overview profile={profile} user={user} activeSub={activeSub} favCount={favorites?.length ?? 0} histCount={history?.length ?? 0} onGoPay={() => setSection("payments")} />
            )}
            {section === "continue" && (
              <Grid empty="Nothing watched yet.">
                {history?.map((h: any) => h.movies && <MovieCard key={h.id} movie={h.movies} />)}
              </Grid>
            )}
            {section === "favorites" && (
              <Grid empty="No favorites yet. Tap the heart on any movie.">
                {favorites?.map((m: any) => <MovieCard key={m.id} movie={m} />)}
              </Grid>
            )}
            {section === "history" && (
              <div>
                {history && history.length > 0 ? (
                  <div className="rounded-lg border border-border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted text-left"><tr><th className="p-3">Movie</th><th className="p-3">Progress</th><th className="p-3">Last watched</th></tr></thead>
                      <tbody>
                        {history.map((h: any) => (
                          <tr key={h.id} className="border-t border-border">
                            <td className="p-3 font-medium">{h.movies?.title ?? "—"}</td>
                            <td className="p-3 text-gold">{Math.round((h.progress ?? 0))}%</td>
                            <td className="p-3 text-muted-foreground">{new Date(h.last_watched).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <Empty text="Your watch history will appear here." />
                )}
              </div>
            )}
            {section === "payments" && (
              <Payments
                activeSub={activeSub}
                subs={subs ?? []}
                onSubscribe={(plan: typeof PLANS[0]) => setCheckoutPlan(plan)}
              />
            )}
            {section === "profile" && <Profile profile={profile} user={user} />}
          </main>
        </SidebarInset>

        {checkoutPlan && (
          <PaymentCheckout
            plan={checkoutPlan}
            onClose={() => setCheckoutPlan(null)}
            onSuccess={() => qc.invalidateQueries({ queryKey: ["subs"] })}
          />
        )}
      </div>
    </SidebarProvider>
  );
}

function Overview({ profile, user, activeSub, favCount, histCount, onGoPay }: any) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-gold grid place-items-center text-black shrink-0">
          <UserIcon className="w-7 h-7" />
        </div>
        <div className="min-w-0">
          <h2 className="font-display text-2xl font-bold truncate">{profile?.full_name ?? "Welcome back"}</h2>
          <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Stat icon={<CreditCard className="w-5 h-5" />} label="Subscription" value={activeSub ? activeSub.plan : "Free"} accent={!!activeSub} />
        <Stat icon={<Heart className="w-5 h-5" />} label="Favorites" value={String(favCount)} />
        <Stat icon={<Clock className="w-5 h-5" />} label="Watched" value={String(histCount)} />
      </div>

      {activeSub ? (
        <div className="rounded-xl border border-gold/40 bg-gold/5 p-5 flex flex-wrap justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-gold tracking-wider">PREMIUM · {activeSub.plan.toUpperCase()}</div>
            <h3 className="mt-1 font-display text-lg font-bold">You're all set.</h3>
            <p className="text-sm text-muted-foreground">Access ends {new Date(activeSub.ends_at).toLocaleDateString()}.</p>
          </div>
          <Link to="/movies" className="self-center inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-gold text-black font-semibold text-sm">
            <Play className="w-4 h-4 fill-black" /> Browse Movies
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-gold/40 bg-gradient-to-br from-gold/10 to-transparent p-5 flex flex-wrap justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-gold tracking-wider"><Sparkles className="w-3 h-3" /> UNLOCK PREMIUM</div>
            <h3 className="mt-1 font-display text-lg font-bold">Subscribe from UGX 2,000</h3>
            <p className="text-sm text-muted-foreground">Pay directly here with MoMo, Airtel, Card, or PayPal.</p>
          </div>
          <button onClick={onGoPay} className="self-center px-5 py-2.5 rounded-md bg-gradient-gold text-black font-semibold text-sm shadow-gold">Choose a plan</button>
        </div>
      )}
    </div>
  );
}

function Payments({ activeSub, subs, onSubscribe }: any) {
  return (
    <div className="space-y-8">
      {activeSub ? (
        <div className="rounded-xl border border-gold/40 bg-gold/5 p-5">
          <div className="text-xs font-bold text-gold tracking-wider">ACTIVE PLAN</div>
          <h3 className="mt-1 font-display text-xl font-bold capitalize">{activeSub.plan}</h3>
          <p className="text-sm text-muted-foreground">Ends {new Date(activeSub.ends_at).toLocaleDateString()} · UGX {activeSub.amount_ugx.toLocaleString()} · via {activeSub.payment_method}</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-display text-lg font-bold">No active subscription</h3>
          <p className="text-sm text-muted-foreground">Pick a plan below to unlock premium movies and downloads.</p>
        </div>
      )}

      <div>
        <h3 className="font-display text-lg font-bold mb-4">Choose a plan</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map((p) => (
            <div key={p.key} className={`relative rounded-2xl border p-5 flex flex-col ${p.popular ? "border-gold bg-gradient-to-b from-gold/10 to-card shadow-gold" : "border-border bg-card"}`}>
              {p.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-gold text-black text-[10px] font-bold rounded-full">MOST POPULAR</span>}
              <h4 className="font-display text-xl font-bold">{p.name}</h4>
              <div className="mt-2 text-2xl font-bold">UGX {p.price.toLocaleString()}</div>
              <ul className="mt-4 space-y-2 flex-1 text-sm">
                {p.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2"><Check className="w-4 h-4 text-gold mt-0.5 shrink-0" /> <span>{perk}</span></li>
                ))}
              </ul>
              <button onClick={() => onSubscribe(p)} className={`mt-5 w-full py-2.5 rounded-md font-semibold text-sm ${p.popular ? "bg-gradient-gold text-black shadow-gold" : "border border-border hover:border-gold hover:text-gold"}`}>
                Subscribe
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-display text-lg font-bold mb-4">Payment History</h3>
        {subs.length > 0 ? (
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted text-left"><tr><th className="p-3">Plan</th><th className="p-3">Amount</th><th className="p-3">Method</th><th className="p-3">Status</th><th className="p-3">Ends</th></tr></thead>
              <tbody>
                {subs.map((s: any) => (
                  <tr key={s.id} className="border-t border-border">
                    <td className="p-3 capitalize">{s.plan}</td>
                    <td className="p-3 text-gold">UGX {s.amount_ugx.toLocaleString()}</td>
                    <td className="p-3 text-muted-foreground uppercase text-xs">{s.payment_method}</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-gold/20 text-gold text-xs">{s.status}</span></td>
                    <td className="p-3 text-muted-foreground">{new Date(s.ends_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <Empty text="No payments yet." />}
      </div>
    </div>
  );
}

function Profile({ profile, user }: any) {
  return (
    <div className="max-w-xl space-y-4">
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-semibold mb-3">Account details</h3>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="text-muted-foreground">Name</div><div className="col-span-2">{profile?.full_name ?? "—"}</div>
          <div className="text-muted-foreground">Email</div><div className="col-span-2 truncate">{user?.email}</div>
          <div className="text-muted-foreground">Phone</div><div className="col-span-2">{profile?.phone ?? "—"}</div>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-5 ${accent ? "border-gold/50 bg-gold/5" : "border-border bg-card"}`}>
      <div className={`flex items-center gap-2 text-sm ${accent ? "text-gold" : "text-muted-foreground"}`}>{icon} {label}</div>
      <div className="mt-2 text-2xl font-bold capitalize">{value}</div>
    </div>
  );
}

function Grid({ children, empty }: { children: React.ReactNode; empty: string }) {
  const arr = Array.isArray(children) ? children.filter(Boolean) : children ? [children] : [];
  if (arr.length === 0) return <Empty text={empty} />;
  return <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">{children}</div>;
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">{text}</div>;
}
