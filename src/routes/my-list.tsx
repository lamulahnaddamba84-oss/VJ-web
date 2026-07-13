import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MovieCard, type Movie } from "@/components/MovieCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/my-list")({
  ssr: false,
  head: () => ({ meta: [{ title: "My List — VJ STREAM UG" }] }),
  component: MyList,
});

function MyList() {
  const { user, loading } = useAuth();

  const { data: favorites } = useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("favorites").select("movie_id, movies(*)").eq("user_id", user.id);
      return ((data ?? []).map((r: any) => r.movies).filter(Boolean)) as Movie[];
    },
    enabled: !!user,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container-95 py-10">
        <div className="flex items-center gap-3 mb-2">
          <Heart className="w-7 h-7 text-gold fill-gold" />
          <h1 className="font-display text-4xl font-bold">My List</h1>
        </div>
        <p className="text-muted-foreground mb-8">Your saved movies, all in one place.</p>

        {loading ? null : !user ? (
          <div className="text-center py-16 rounded-xl border border-dashed border-border">
            <p className="text-muted-foreground mb-4">Sign in to save movies to your list.</p>
            <Link to="/auth" className="inline-flex px-5 py-2.5 rounded-md bg-gradient-gold text-black font-semibold">Sign in</Link>
          </div>
        ) : favorites && favorites.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {favorites.map((m) => <MovieCard key={m.id} movie={m} />)}
          </div>
        ) : (
          <div className="text-center py-16 rounded-xl border border-dashed border-border">
            <Heart className="w-12 h-12 text-gold mx-auto mb-3" />
            <p className="text-muted-foreground">Your list is empty. Tap the heart on any movie to save it.</p>
            <Link to="/movies" className="inline-flex mt-4 px-5 py-2.5 rounded-md bg-gradient-gold text-black font-semibold">Browse Movies</Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
