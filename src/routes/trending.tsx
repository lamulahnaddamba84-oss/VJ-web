import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Flame } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MovieCard, type Movie } from "@/components/MovieCard";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/trending")({
  head: () => ({
    meta: [
      { title: "Trending Now — VJ STREAM UG" },
      { name: "description", content: "The most watched VJ-translated movies this week in Uganda." },
    ],
  }),
  component: TrendingPage,
});

function TrendingPage() {
  const { data: trending, isLoading } = useQuery({
    queryKey: ["movies", "trending-all"],
    queryFn: async () => (await supabase.from("movies").select("*").order("views", { ascending: false }).limit(40)).data as Movie[] ?? [],
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container-95 py-10">
        <div className="flex items-center gap-3 mb-2">
          <Flame className="w-7 h-7 text-gold" />
          <h1 className="font-display text-4xl font-bold">Trending Now</h1>
        </div>
        <p className="text-muted-foreground mb-8">The hottest VJ picks Uganda is watching this week.</p>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => <div key={i} className="aspect-[2/3] rounded-lg bg-muted animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {trending?.map((m, i) => (
              <div key={m.id} className="relative">
                <span className="absolute -top-2 -left-2 z-10 grid place-items-center w-8 h-8 rounded-full bg-gradient-gold text-black text-sm font-bold shadow-gold">{i + 1}</span>
                <MovieCard movie={m} />
              </div>
            ))}
            {(!trending || trending.length === 0) && <p className="col-span-full text-center py-16 text-muted-foreground"><TrendingUp className="w-8 h-8 mx-auto mb-2" />No trending data yet.</p>}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
