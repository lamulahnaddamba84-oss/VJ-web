import { Link } from "@tanstack/react-router";
import { Play, Star, Crown } from "lucide-react";

export type Movie = {
  id: string;
  title: string;
  slug: string;
  poster_url: string | null;
  release_year: number | null;
  rating: number | null;
  is_premium: boolean;
  genre: string | null;
  vj?: string | null;
  description?: string | null;
};

export function MovieCard({ movie }: { movie: Movie }) {
  return (
    <Link to="/movies/$slug" params={{ slug: movie.slug }} className="group block">
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-muted shadow-card">
        {movie.poster_url ? (
          <img src={movie.poster_url} alt={movie.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted to-card" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-80 group-hover:opacity-95 transition" />
        {movie.is_premium && (
          <div className="absolute top-2 right-2 px-2 py-1 rounded-md bg-gradient-gold text-black text-[10px] font-bold flex items-center gap-1">
            <Crown className="w-3 h-3" /> PREMIUM
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="flex items-center gap-2 text-[11px] text-gold mb-1">
            <Star className="w-3 h-3 fill-gold" />
            <span>{movie.rating?.toFixed(1) ?? "—"}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{movie.release_year}</span>
          </div>
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 text-white">{movie.title}</h3>
          {movie.vj && <p className="text-[11px] text-muted-foreground mt-0.5">Translated by {movie.vj}</p>}
        </div>
        <div className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition">
          <div className="w-12 h-12 rounded-full bg-gold grid place-items-center shadow-gold">
            <Play className="w-5 h-5 text-black fill-black ml-0.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
