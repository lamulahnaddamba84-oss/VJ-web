import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Star, Crown, Tv, Lock } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/series")({
  head: () => ({
    meta: [
      { title: "Series — VJ STREAM UG" },
      { name: "description", content: "Binge VJ-translated TV series and seasons. Drama, action, comedy and more in Luganda." },
    ],
  }),
  component: SeriesPage,
});

function SeriesPage() {
  const { user, loading: authLoading } = useAuth();
  const { data: series, isLoading } = useQuery({
    queryKey: ["series", "all"],
    enabled: !!user,
    queryFn: async () => (await supabase.from("series").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  if (!authLoading && !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 grid place-items-center px-4 py-24">
          <div className="max-w-md text-center rounded-2xl border border-gold/40 bg-card p-10 shadow-card">
            <div className="w-14 h-14 mx-auto rounded-full bg-gold/15 grid place-items-center mb-4">
              <Lock className="w-7 h-7 text-gold" />
            </div>
            <h1 className="font-display text-2xl font-bold mb-2">Sign in to watch series</h1>
            <p className="text-sm text-muted-foreground mb-6">Create a free account to unlock full seasons and episodes.</p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Link to="/auth" search={{ mode: "signup" }} className="px-5 py-2.5 rounded-md bg-gradient-gold text-black font-semibold shadow-gold">Create free account</Link>
              <Link to="/auth" className="px-5 py-2.5 rounded-md border border-border hover:border-gold">Sign in</Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }


  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container-95 py-10">
        <div className="flex items-center gap-3 mb-2">
          <Tv className="w-7 h-7 text-gold" />
          <h1 className="font-display text-4xl font-bold">Series</h1>
        </div>
        <p className="text-muted-foreground mb-8">Full seasons translated by your favorite VJs.</p>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => <div key={i} className="aspect-[2/3] rounded-lg bg-muted animate-pulse" />)}
          </div>
        ) : series && series.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {series.map((s: any) => (
              <Link key={s.id} to="/series" className="group block">
                <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-muted shadow-card">
                  {s.poster_url ? <img src={s.poster_url} alt={s.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" /> : <div className="w-full h-full bg-gradient-to-br from-muted to-card" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  {s.is_premium && <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-gradient-gold text-black text-[10px] font-bold flex items-center gap-1"><Crown className="w-3 h-3" /> PREMIUM</span>}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="flex items-center gap-2 text-[11px] text-gold mb-1">
                      <Star className="w-3 h-3 fill-gold" />
                      <span>{s.rating?.toFixed(1) ?? "—"}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">S{s.seasons} · {s.episodes}ep</span>
                    </div>
                    <h3 className="font-semibold text-sm leading-tight line-clamp-2 text-white">{s.title}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 rounded-xl border border-dashed border-border">
            <Tv className="w-12 h-12 text-gold mx-auto mb-3" />
            <h2 className="font-display text-xl font-bold">No series yet</h2>
            <p className="text-muted-foreground text-sm mt-1">New seasons drop weekly. Check back soon.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
