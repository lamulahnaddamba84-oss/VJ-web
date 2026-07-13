import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, PictureInPicture2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/watch/$slug")({
  ssr: false,
  head: () => ({ meta: [{ title: "Now Playing — VJ STREAM UG" }] }),
  component: WatchPage,
});

function WatchPage() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  const { data: movie } = useQuery({
    queryKey: ["movie", slug],
    queryFn: async () => (await supabase.from("movies").select("*").eq("slug", slug).maybeSingle()).data,
  });

  const { data: next } = useQuery({
    queryKey: ["movie", "up-next", movie?.id],
    queryFn: async () => (await supabase.from("movies").select("*").neq("id", movie!.id).order("views", { ascending: false }).limit(1).maybeSingle()).data,
    enabled: !!movie,
  });

  useEffect(() => {
    if (!movie) return;
    if (movie.is_premium && !user) { toast.error("Sign in to watch premium content"); nav({ to: "/movies/$slug", params: { slug } }); return; }
    supabase.from("movies").update({ views: (movie.views ?? 0) + 1 }).eq("id", movie.id);
    if (user) supabase.from("watch_history").upsert({ user_id: user.id, movie_id: movie.id, progress_seconds: 0, last_watched: new Date().toISOString() }, { onConflict: "user_id,movie_id" });
  }, [movie, user, nav, slug]);

  const pip = async () => {
    try { if (videoRef.current) await videoRef.current.requestPictureInPicture(); } catch (e) { toast.error("Picture-in-picture unavailable"); }
  };

  if (!movie) return <div className="min-h-screen bg-black"><Navbar /><div className="p-10 text-center text-white">Loading player...</div></div>;

  const isYT = movie.video_url?.includes("youtube") || movie.video_url?.includes("youtu.be");

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black to-transparent">
        <Link to="/movies/$slug" params={{ slug }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-black/60 border border-white/10 text-white text-sm hover:border-gold">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <h1 className="text-white text-sm sm:text-base font-semibold truncate max-w-[60%]">{movie.title}</h1>
        <button onClick={pip} className="p-2 rounded-md bg-black/60 border border-white/10 text-white hover:border-gold" aria-label="Picture in picture">
          <PictureInPicture2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-2 sm:px-6 pb-6">
        <div className="w-full max-w-6xl aspect-video rounded-lg overflow-hidden border border-white/10 shadow-card bg-black">
          {isYT ? (
            <iframe src={movie.video_url ?? ""} title={movie.title} className="w-full h-full" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowFullScreen />
          ) : movie.video_url ? (
            <video ref={videoRef} src={movie.video_url} poster={movie.poster_url ?? undefined} controls autoPlay playsInline preload="auto" controlsList="nodownload" className="w-full h-full bg-black" />
          ) : (
            <div className="w-full h-full grid place-items-center text-white/60 text-sm">No stream available yet.</div>
          )}
        </div>
      </div>

      {next && (
        <div className="px-4 sm:px-8 pb-8">
          <p className="text-xs uppercase tracking-widest text-gold mb-2">Up Next</p>
          <Link to="/watch/$slug" params={{ slug: next.slug }} className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 p-3 hover:border-gold transition max-w-2xl">
            {next.poster_url && <img src={next.poster_url} alt={next.title} className="w-20 h-28 object-cover rounded" />}
            <div className="min-w-0">
              <h3 className="text-white font-semibold truncate">{next.title}</h3>
              <p className="text-xs text-white/60 truncate">{next.genre} · {next.release_year}</p>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
