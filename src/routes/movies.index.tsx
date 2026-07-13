import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, Lock } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MovieCard, type Movie } from "@/components/MovieCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type SearchParams = { category?: string; q?: string; year?: number };

export const Route = createFileRoute("/movies/")({
  head: () => ({
    meta: [
      { title: "All Movies — VJ STREAM UG" },
      { name: "description", content: "Browse the full catalog of VJ-translated movies. Filter by genre, year, and search by title." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): SearchParams => ({
    category: typeof s.category === "string" ? s.category : undefined,
    q: typeof s.q === "string" ? s.q : undefined,
    year: typeof s.year === "number" ? s.year : s.year ? Number(s.year) || undefined : undefined,
  }),
  component: MoviesPage,
});

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1999 }, (_, i) => CURRENT_YEAR - i);

function MoviesPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [q, setQ] = useState(search.q ?? "");
  const { user, loading: authLoading } = useAuth();

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await supabase.from("categories").select("*")).data ?? [],
    enabled: !!user,
  });

  const { data: movies, isLoading } = useQuery({
    queryKey: ["movies", "list", search.category, search.q, search.year],
    enabled: !!user,
    queryFn: async () => {
      let query = supabase.from("movies").select("*, categories(slug)").order("release_year", { ascending: false });
      if (search.q) query = query.ilike("title", `%${search.q}%`);
      if (search.year) query = query.eq("release_year", search.year);
      const { data } = await query;
      let result = (data ?? []) as (Movie & { categories?: { slug: string } | null })[];
      if (search.category) result = result.filter((m) => m.categories?.slug === search.category);
      return result;
    },
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
            <h1 className="font-display text-2xl font-bold mb-2">Sign in to browse movies</h1>
            <p className="text-sm text-muted-foreground mb-6">Create a free account to unlock the full catalog, categories, and My List.</p>
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
        <h1 className="font-display text-4xl font-bold mb-2">All Movies</h1>
        <p className="text-muted-foreground mb-6">Discover VJ-translated cinema curated for Uganda.</p>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <form onSubmit={(e) => { e.preventDefault(); navigate({ search: { ...search, q: q || undefined } }); }} className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search movies, VJs..." className="w-full pl-10 pr-4 py-2.5 rounded-md bg-input border border-border focus:border-gold focus:outline-none" />
          </form>
        </div>

        <div className="mb-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Genre</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => navigate({ search: { ...search, category: undefined } })} className={`px-4 py-1.5 rounded-full text-sm border ${!search.category ? "bg-gold text-black border-gold" : "border-border hover:border-gold"}`}>All</button>
            {categories?.map((c) => (
              <button key={c.id} onClick={() => navigate({ search: { ...search, category: c.slug } })} className={`px-4 py-1.5 rounded-full text-sm border ${search.category === c.slug ? "bg-gold text-black border-gold" : "border-border hover:border-gold"}`}>{c.name}</button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Release Year</p>
          <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto pb-1">
            <button onClick={() => navigate({ search: { ...search, year: undefined } })} className={`px-3 py-1 rounded-full text-xs border ${!search.year ? "bg-gold text-black border-gold" : "border-border hover:border-gold"}`}>All years</button>
            {YEARS.map((y) => (
              <button key={y} onClick={() => navigate({ search: { ...search, year: y } })} className={`px-3 py-1 rounded-full text-xs border ${search.year === y ? "bg-gold text-black border-gold" : "border-border hover:border-gold text-muted-foreground"}`}>{y}</button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => <div key={i} className="aspect-[2/3] rounded-lg bg-muted animate-pulse" />)}
          </div>
        ) : movies && movies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {movies.map((m) => <MovieCard key={m.id} movie={m} />)}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">No movies found{search.year ? ` for ${search.year}` : ""}.</div>
        )}
      </main>
      <Footer />
    </div>
  );
}
