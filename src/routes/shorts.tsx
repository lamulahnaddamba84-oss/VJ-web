import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, Eye, Zap } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/shorts")({
  head: () => ({
    meta: [
      { title: "Shorts — VJ STREAM UG" },
      { name: "description", content: "Quick VJ-translated clips, trailers, and bite-sized movie moments." },
    ],
  }),
  component: ShortsPage,
});

function getEmbed(url: string) {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([\w-]+)/);
  if (yt) return { type: "iframe" as const, src: `https://www.youtube.com/embed/${yt[1]}` };
  return { type: "video" as const, src: url };
}

function ShortsPage() {
  const qc = useQueryClient();
  const { data: shorts, isLoading } = useQuery({
    queryKey: ["shorts"],
    queryFn: async () => (await supabase.from("shorts").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const like = useMutation({
    mutationFn: async (s: any) => {
      await supabase.from("shorts").update({ likes: (s.likes ?? 0) + 1 }).eq("id", s.id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shorts"] }),
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-3 mb-2">
          <Zap className="w-7 h-7 text-gold" />
          <h1 className="font-display text-4xl font-bold">Shorts</h1>
        </div>
        <p className="text-muted-foreground mb-8">Bite-sized VJ clips, trailers and behind-the-scenes.</p>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-[9/16] rounded-xl bg-muted animate-pulse" />)}
          </div>
        ) : !shorts || shorts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">No shorts yet. Admins can add them from the panel.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {shorts.map((s) => {
              const embed = getEmbed(s.video_url);
              return (
                <article key={s.id} className="group relative aspect-[9/16] rounded-xl overflow-hidden bg-black border border-border hover:border-gold transition">
                  {embed.type === "iframe" ? (
                    <iframe src={embed.src} className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen title={s.title} />
                  ) : (
                    <video src={embed.src} poster={s.thumbnail_url ?? undefined} controls playsInline className="w-full h-full object-cover" />
                  )}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black to-transparent">
                    <h3 className="font-semibold text-sm text-white line-clamp-2">{s.title}</h3>
                    {s.vj && <p className="text-[11px] text-gold mt-0.5">By {s.vj}</p>}
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {s.views ?? 0}</span>
                      <button onClick={() => like.mutate(s)} className="pointer-events-auto flex items-center gap-1 hover:text-gold transition">
                        <Heart className="w-3 h-3" /> {s.likes ?? 0}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
