import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Radio, Users, Calendar } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

export const Route = createFileRoute("/live")({
  head: () => ({
    meta: [
      { title: "Live Streams — VJ STREAM UG" },
      { name: "description", content: "Watch live VJ broadcasts and scheduled premieres. Real-time movie translations streamed direct to you." },
    ],
  }),
  component: LivePage,
});

function getEmbedUrl(url: string) {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|live\/)|youtu\.be\/)([\w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1`;
  return url;
}

function LivePage() {
  const { data: streams, isLoading } = useQuery({
    queryKey: ["live_streams"],
    queryFn: async () => (await supabase.from("live_streams").select("*").order("is_live", { ascending: false }).order("scheduled_at", { ascending: true })).data ?? [],
  });

  const [active, setActive] = useState<any | null>(null);

  const liveNow = streams?.filter((s) => s.is_live) ?? [];
  const upcoming = streams?.filter((s) => !s.is_live) ?? [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container-95 py-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
          </span>
          <h1 className="font-display text-4xl font-bold">Live Now</h1>
        </div>
        <p className="text-muted-foreground mb-8">Catch your favourite VJs translating live in real time.</p>

        {active && (
          <div className="mb-10 rounded-xl overflow-hidden border border-gold/40 bg-card shadow-gold">
            <div className="aspect-video bg-black">
              <iframe src={getEmbedUrl(active.stream_url)} className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen title={active.title} />
            </div>
            <div className="p-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-bold">{active.title}</h2>
                <p className="text-sm text-muted-foreground">Streamed by {active.vj}</p>
              </div>
              <button onClick={() => setActive(null)} className="px-4 py-2 rounded-md border border-border hover:border-gold text-sm">Close player</button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="aspect-video rounded-xl bg-muted animate-pulse" />)}
          </div>
        ) : (
          <>
            <section className="mb-12">
              <h2 className="text-xl font-display font-bold mb-4 flex items-center gap-2"><Radio className="w-5 h-5 text-red-500" /> Live now ({liveNow.length})</h2>
              {liveNow.length === 0 ? (
                <p className="text-sm text-muted-foreground">No streams live right now. Check the schedule below.</p>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {liveNow.map((s) => <StreamCard key={s.id} stream={s} onPlay={() => setActive(s)} />)}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-xl font-display font-bold mb-4 flex items-center gap-2"><Calendar className="w-5 h-5 text-gold" /> Upcoming</h2>
              {upcoming.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nothing scheduled. Stay tuned.</p>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {upcoming.map((s) => <StreamCard key={s.id} stream={s} />)}
                </div>
              )}
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

function StreamCard({ stream, onPlay }: { stream: any; onPlay?: () => void }) {
  return (
    <article className="group rounded-xl overflow-hidden border border-border bg-card hover:border-gold transition">
      <div className="relative aspect-video bg-muted">
        {stream.thumbnail_url ? (
          <img src={stream.thumbnail_url} alt={stream.title} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-black to-card grid place-items-center">
            <Radio className="w-10 h-10 text-gold/40" />
          </div>
        )}
        {stream.is_live && (
          <div className="absolute top-3 left-3 px-2 py-1 rounded bg-red-600 text-white text-[10px] font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE
          </div>
        )}
        {stream.is_live && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded bg-black/70 text-white text-[10px] flex items-center gap-1">
            <Users className="w-3 h-3" /> {stream.viewers ?? 0}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold leading-tight line-clamp-2">{stream.title}</h3>
        <p className="text-xs text-muted-foreground mt-1">By {stream.vj}</p>
        {stream.scheduled_at && !stream.is_live && (
          <p className="text-xs text-gold mt-2">{new Date(stream.scheduled_at).toLocaleString()}</p>
        )}
        {onPlay && (
          <button onClick={onPlay} className="mt-3 w-full px-3 py-2 rounded-md bg-gradient-gold text-black text-sm font-semibold">Watch now</button>
        )}
      </div>
    </article>
  );
}
