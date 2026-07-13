import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Play, Heart, Star, Crown, MessageCircle, Download, Film as FilmIcon, Share2, PlayCircle, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useActiveSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";

export const Route = createFileRoute("/movies/$slug")({
  component: MovieDetail,
});

function MovieDetail() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [showTrailer, setShowTrailer] = useState(false);

  const { data: movie, isLoading } = useQuery({
    queryKey: ["movie", slug],
    queryFn: async () => (await supabase.from("movies").select("*").eq("slug", slug).maybeSingle()).data,
  });

  const { data: recommended } = useQuery({
    queryKey: ["movie", "recommended", movie?.id],
    queryFn: async () => {
      if (!movie) return [];
      let q = supabase.from("movies").select("*").neq("id", movie.id).limit(6);
      if (movie.genre) q = q.eq("genre", movie.genre);
      const { data } = await q;
      if (data && data.length) return data;
      const { data: any } = await supabase.from("movies").select("*").neq("id", movie.id).limit(6);
      return any ?? [];
    },
    enabled: !!movie,
  });

  const { data: comments } = useQuery({
    queryKey: ["comments", movie?.id],
    queryFn: async () => {
      if (!movie) return [];
      const { data } = await supabase.from("comments").select("*, profiles(full_name)").eq("movie_id", movie.id).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!movie,
  });

  const { data: isFavorite } = useQuery({
    queryKey: ["favorite", movie?.id, user?.id],
    queryFn: async () => {
      if (!user || !movie) return false;
      const { data } = await supabase.from("favorites").select("user_id").eq("user_id", user.id).eq("movie_id", movie.id).maybeSingle();
      return !!data;
    },
    enabled: !!user && !!movie,
  });

  const toggleFav = useMutation({
    mutationFn: async () => {
      if (!user || !movie) throw new Error("Sign in required");
      if (isFavorite) await supabase.from("favorites").delete().eq("user_id", user.id).eq("movie_id", movie.id);
      else await supabase.from("favorites").insert({ user_id: user.id, movie_id: movie.id });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["favorite", movie?.id, user?.id] });
      toast.success(isFavorite ? "Removed from Watch List" : "Added to Watch List");
    },
    onError: (e) => toast.error(e.message),
  });

  const postComment = useMutation({
    mutationFn: async () => {
      if (!user || !movie) throw new Error("Sign in required");
      const { error } = await supabase.from("comments").insert({ user_id: user.id, movie_id: movie.id, content: comment, rating });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comments", movie?.id] });
      setComment("");
      toast.success("Comment posted");
    },
    onError: (e) => toast.error(e.message),
  });

  const { data: activeSub } = useActiveSubscription(user?.id);

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) await navigator.share({ title: movie?.title ?? "", url });
      else { await navigator.clipboard.writeText(url); toast.success("Link copied"); }
    } catch {}
  };

  const download = async () => {
    if (!movie) return;
    if (!user) { toast.error("Sign in to download"); return; }
    if (!activeSub) { toast.error("Downloads require an active subscription."); return; }
    const url = movie.download_url || movie.video_url;
    if (!url) { toast.error("No download available"); return; }
    await supabase.from("downloads").insert({ user_id: user.id, movie_id: movie.id });
    await supabase.from("movies").update({ downloads_count: (movie.downloads_count ?? 0) + 1 }).eq("id", movie.id);
    qc.invalidateQueries({ queryKey: ["movie", slug] });
    try {
      toast.info("Preparing download…");
      const res = await fetch(url);
      if (!res.ok) throw new Error("Network error");
      const blob = await res.blob();
      const ext = (url.split("?")[0].split(".").pop() || "mp4").toLowerCase();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${movie.slug}.${ext}`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1500);
      toast.success("Download ready");
    } catch {
      const a = document.createElement("a");
      a.href = url; a.download = `${movie.slug}`; a.target = "_blank"; a.rel = "noopener";
      document.body.appendChild(a); a.click(); a.remove();
      toast.success("Download starting…");
    }
  };

  if (isLoading) return <div className="min-h-screen"><Navbar /><div className="p-10 text-center">Loading...</div></div>;
  if (!movie) return <div className="min-h-screen"><Navbar /><div className="p-10 text-center">Movie not found.</div></div>;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-background">
        <div className="container-95 py-6 grid lg:grid-cols-[1fr_320px] gap-6">
          {/* MAIN CARD */}
          <section className="rounded-2xl border border-border bg-card/60 p-4 sm:p-6 shadow-card">
            <div className="grid md:grid-cols-[280px_1fr] gap-6">
              {/* Poster + buttons */}
              <div className="flex flex-col gap-3">
                <div className="aspect-[2/3] rounded-xl overflow-hidden border border-border bg-muted">
                  {movie.poster_url && <img src={movie.poster_url} alt={movie.title} className="w-full h-full object-cover" />}
                </div>
                <button onClick={() => toggleFav.mutate()} disabled={!user}
                  className={`w-full py-2.5 rounded-md border text-sm font-semibold inline-flex items-center justify-center gap-2 ${isFavorite ? "border-gold text-gold bg-gold/10" : "border-border hover:border-gold"}`}>
                  <Heart className={`w-4 h-4 ${isFavorite ? "fill-gold" : ""}`} /> {isFavorite ? "IN WATCH LIST" : "ADD TO WATCH LIST"}
                </button>
                {movie.trailer_url && (
                  <button onClick={() => setShowTrailer((v) => !v)}
                    className="w-full py-2.5 rounded-md border border-border hover:border-gold text-sm font-semibold inline-flex items-center justify-center gap-2">
                    <PlayCircle className="w-4 h-4" /> TRAILER
                  </button>
                )}
              </div>

              {/* Info */}
              <div className="min-w-0">
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-gold">{movie.title}</h1>

                <div className="mt-3 flex flex-wrap gap-2">
                  {movie.genre && <span className="px-3 py-1 rounded-md border border-border bg-muted/40 text-sm">{movie.genre}</span>}
                  {movie.is_premium && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gradient-gold text-black text-xs font-bold">
                      <Crown className="w-3 h-3" /> PREMIUM
                    </span>
                  )}
                </div>

                <div className="mt-4 rounded-lg border border-border bg-background/40 p-4">
                  <p className="text-sm leading-relaxed text-foreground/90">{movie.description || "No description available."}</p>
                </div>

                <dl className="mt-4 space-y-1.5 text-sm">
                  {movie.country && <MetaRow label="Country" value={movie.country} />}
                  {movie.director && <MetaRow label="Director" value={movie.director} />}
                  {movie.language && <MetaRow label="Language" value={movie.language} />}
                  {movie.company && <MetaRow label="Company" value={movie.company} />}
                  {movie.movie_cast && <MetaRow label="Cast" value={movie.movie_cast} />}
                </dl>

                {/* Chips row */}
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  {movie.release_year && <Chip>{movie.release_year}</Chip>}
                  {movie.vj && <Chip><span className="w-2 h-2 rounded-full bg-gold inline-block mr-1.5" /> VJ {movie.vj}</Chip>}
                  <Chip><Star className="w-3.5 h-3.5 text-gold fill-gold" /> {movie.rating?.toFixed(1) ?? "0.0"}</Chip>
                  {typeof movie.downloads_count === "number" && movie.downloads_count > 0 && (
                    <Chip><Download className="w-3.5 h-3.5 text-gold" /> {movie.downloads_count.toLocaleString()}</Chip>
                  )}
                  <button onClick={share} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border hover:border-gold text-sm">
                    <Share2 className="w-3.5 h-3.5" /> Share
                  </button>
                  <button onClick={download} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gold text-gold hover:bg-gold/10 text-sm font-semibold">
                    <Download className="w-3.5 h-3.5" /> Download Movie
                  </button>
                  {movie.telegram_url && (
                    <a href={movie.telegram_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border hover:border-gold text-sm">
                      <MessageCircle className="w-3.5 h-3.5" /> Join Channel
                    </a>
                  )}
                  <Link to="/watch/$slug" params={{ slug: movie.slug }} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gradient-gold text-black text-sm font-semibold shadow-gold">
                    <Play className="w-3.5 h-3.5 fill-black" /> Watch Now
                  </Link>
                </div>

                {!activeSub && (
                  <div className="mt-4 rounded-md border border-gold/30 bg-gold/5 p-3 text-xs text-foreground/80">
                    Note: Downloads require an active subscription. <Link to="/pricing" className="text-gold hover:underline font-semibold">View plans →</Link>
                  </div>
                )}
              </div>
            </div>

            {/* Trailer */}
            {showTrailer && movie.trailer_url && (
              <div className="mt-6 rounded-xl overflow-hidden border border-border bg-black aspect-video">
                {movie.trailer_url.includes("youtube") || movie.trailer_url.includes("youtu.be") ? (
                  <iframe src={movie.trailer_url} title={`${movie.title} trailer`} className="w-full h-full" allow="autoplay; encrypted-media; fullscreen" allowFullScreen />
                ) : (
                  <video src={movie.trailer_url} controls className="w-full h-full" />
                )}
              </div>
            )}

            {/* Inline player */}
            <div className="mt-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gold mb-2 flex items-center gap-2"><PlayCircle className="w-4 h-4" /> Watch</h2>
              <div className="rounded-xl overflow-hidden border border-border bg-black aspect-video">
                {movie.video_url ? (
                  movie.video_url.includes("youtube") || movie.video_url.includes("youtu.be") ? (
                    <iframe src={movie.video_url} title={movie.title} className="w-full h-full" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowFullScreen />
                  ) : (
                    <video src={movie.video_url} poster={movie.poster_url ?? undefined} controls playsInline preload="metadata" className="w-full h-full bg-black" />
                  )
                ) : (
                  <div className="w-full h-full grid place-items-center text-white/60 text-sm">No stream available yet.</div>
                )}
              </div>
            </div>

            {/* Comments */}
            <div className="mt-8">
              <h2 className="text-lg font-display font-bold mb-4 flex items-center gap-2"><MessageCircle className="w-5 h-5 text-gold" /> Reviews</h2>
              {user ? (
                <div className="rounded-lg border border-border bg-background/40 p-4 mb-4">
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button key={i} onClick={() => setRating(i + 1)} aria-label={`Rate ${i + 1}`}>
                        <Star className={`w-5 h-5 ${i < rating ? "text-gold fill-gold" : "text-muted-foreground"}`} />
                      </button>
                    ))}
                  </div>
                  <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your thoughts..." rows={3}
                    className="w-full bg-input border border-border rounded-md p-3 focus:border-gold outline-none text-sm" />
                  <button onClick={() => postComment.mutate()} disabled={!comment.trim() || postComment.isPending}
                    className="mt-3 px-4 py-2 bg-gradient-gold text-black font-semibold rounded-md disabled:opacity-50 text-sm">
                    {postComment.isPending ? "Posting..." : "Post Review"}
                  </button>
                </div>
              ) : (
                <div className="rounded-lg border border-border bg-background/40 p-4 mb-4 text-sm text-muted-foreground">
                  <Link to="/auth" className="text-gold hover:underline">Sign in</Link> to leave a review.
                </div>
              )}
              <div className="space-y-3">
                {comments?.map((c: any) => (
                  <div key={c.id} className="rounded-lg border border-border bg-background/40 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{c.profiles?.full_name ?? "User"}</span>
                      <div className="flex">{Array.from({ length: c.rating ?? 0 }).map((_, i) => <Star key={i} className="w-3 h-3 text-gold fill-gold" />)}</div>
                    </div>
                    <p className="text-sm text-muted-foreground">{c.content}</p>
                  </div>
                ))}
                {comments?.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No reviews yet. Be the first!</p>}
              </div>
            </div>
          </section>

          {/* RECOMMENDED SIDEBAR */}
          <aside className="rounded-2xl border border-border bg-card/60 p-4 shadow-card h-fit lg:sticky lg:top-4">
            <div className="flex items-center gap-2 mb-4 text-gold font-bold uppercase tracking-wider text-sm">
              <ChevronRight className="w-4 h-4" /> Recommended //
            </div>
            <div className="space-y-3">
              {recommended?.map((r: any) => (
                <Link key={r.id} to="/movies/$slug" params={{ slug: r.slug }}
                  className="flex gap-3 rounded-lg border border-border/60 bg-background/40 p-2 hover:border-gold transition">
                  <div className="w-20 h-28 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                    {r.poster_url ? <img src={r.poster_url} alt={r.title} className="w-full h-full object-cover" /> : <div className="w-full h-full grid place-items-center"><FilmIcon className="w-6 h-6 text-muted-foreground" /></div>}
                  </div>
                  <div className="min-w-0 flex-1 flex flex-col justify-center gap-1.5">
                    <h3 className="font-semibold text-sm line-clamp-2">{r.title}</h3>
                    <div className="flex flex-wrap gap-1">
                      {r.release_year && <span className="px-2 py-0.5 rounded border border-border text-[10px]">{r.release_year}</span>}
                      {r.vj && <span className="px-2 py-0.5 rounded border border-border text-[10px] text-gold">vj {r.vj}</span>}
                      <span className="px-2 py-0.5 rounded border border-border text-[10px] inline-flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 text-gold fill-gold" /> {r.rating?.toFixed(1) ?? "0.0"}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
              {(!recommended || recommended.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-6">No recommendations yet.</p>
              )}
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-sm">
      <span className="text-muted-foreground">{label}: </span>
      <span className="text-gold">{value}</span>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-border bg-muted/40 text-sm">{children}</span>;
}
