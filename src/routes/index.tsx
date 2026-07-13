import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Play, ChevronRight, ChevronLeft, Sparkles, Smartphone, Wifi, Shield, Star, Crown, Tv, Check, Download } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MovieCard, type Movie } from "@/components/MovieCard";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-cinema.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VJ STREAM UG — Premium VJ-Translated Movies in HD" },
      { name: "description", content: "Stream the best VJ-translated movies in Luganda. Action, comedy, romance, horror, and more. Subscribe from UGX 2,000." },
    ],
  }),
  component: Index,
});

function Index() {
  const { data: featured } = useQuery({
    queryKey: ["movies", "featured"],
    queryFn: async () => {
      const { data } = await supabase.from("movies").select("*").eq("is_featured", true).limit(6);
      return (data ?? []) as Movie[];
    },
  });
  const { data: trending } = useQuery({
    queryKey: ["movies", "trending"],
    queryFn: async () => {
      const { data } = await supabase.from("movies").select("*").order("views", { ascending: false }).limit(8);
      return (data ?? []) as Movie[];
    },
  });
  const { data: latestUpdates } = useQuery({
    queryKey: ["movies", "latest-updates"],
    queryFn: async () => {
      const { data } = await supabase.from("movies").select("*").order("release_year", { ascending: false }).limit(8);
      return (data ?? []) as Movie[];
    },
  });
  const { data: newlyAdded } = useQuery({
    queryKey: ["movies", "newly-added"],
    queryFn: async () => {
      const { data } = await supabase.from("movies").select("*").order("created_at", { ascending: false }).limit(8);
      return (data ?? []) as Movie[];
    },
  });
  const { data: explore } = useQuery({
    queryKey: ["movies", "explore"],
    queryFn: async () => {
      const { data } = await supabase.from("movies").select("*").order("title", { ascending: true }).limit(8);
      return (data ?? []) as Movie[];
    },
  });
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*");
      return data ?? [];
    },
  });
  const { data: series } = useQuery({
    queryKey: ["series", "home-trailers"],
    queryFn: async () => (await supabase.from("series").select("*").order("created_at", { ascending: false }).limit(8)).data ?? [],
  });

  // Featured = latest additions (per user brief: hero = new movies collection)
  const slides = (newlyAdded && newlyAdded.length > 0 ? newlyAdded : featured && featured.length > 0 ? featured : trending)?.slice(0, 5) ?? [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* HERO CAROUSEL */}
      <HeroCarousel slides={slides} categories={categories} />


      {/* CATEGORIES */}
      <section className="container-95 py-12">
        <h2 className="text-2xl font-display font-bold mb-6">Browse by Genre</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {categories?.map((c) => (
            <Link key={c.id} to="/movies" search={{ category: c.slug }} className="px-4 py-6 rounded-lg border border-border hover:border-gold hover:bg-gold/5 text-center transition group">
              <span className="font-semibold text-sm group-hover:text-gold">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <TopTenRow movies={trending?.slice(0, 10)} />
      <SectionRow title="Latest Update" movies={latestUpdates} />
      <SectionRow title="Newly Added" movies={newlyAdded} />
      <SectionRow title="Explore" movies={explore} />
      <SeriesTrailersRow series={series} />
      <PricingPreview />


      <Footer />
    </div>
  );
}

function SectionRow({ title, movies }: { title: string; movies?: Movie[] }) {
  if (!movies || movies.length === 0) return null;
  return (
    <section className="container-95 py-8">
      <div className="flex items-end justify-between mb-5">
        <h2 className="text-2xl font-display font-bold">{title}</h2>
        <Link to="/movies" className="text-sm text-gold hover:underline">See all →</Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {movies.slice(0, 5).map((m) => <MovieCard key={m.id} movie={m} />)}
      </div>
    </section>
  );
}

function TopTenRow({ movies }: { movies?: Movie[] }) {
  if (!movies || movies.length === 0) return null;
  return (
    <section className="container-95 py-8">
      <div className="flex items-end justify-between mb-5">
        <h2 className="text-2xl font-display font-bold flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-gold text-black text-xs font-bold tracking-wider">TOP 10</span>
          Trending in Uganda
        </h2>
        <Link to="/trending" className="text-sm text-gold hover:underline">See all →</Link>
      </div>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4">
        {movies.map((m, i) => (
          <Link key={m.id} to="/movies/$slug" params={{ slug: m.slug }} className="group relative shrink-0 flex items-end">
            <span
              className="font-display font-black leading-none text-transparent select-none pr-2"
              style={{
                fontSize: "clamp(6rem, 14vw, 12rem)",
                WebkitTextStroke: "3px var(--gold)",
                textShadow: "0 6px 30px rgba(0,0,0,0.6)",
              }}
              aria-hidden
            >
              {i + 1}
            </span>
            <div className="relative w-32 sm:w-40 md:w-48 aspect-[2/3] overflow-hidden rounded-lg shadow-card -ml-4 sm:-ml-6">
              {m.poster_url ? (
                <img src={m.poster_url} alt={m.title} loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-muted to-card" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <div className="absolute bottom-2 left-2 right-2">
                <h3 className="font-semibold text-xs sm:text-sm leading-tight line-clamp-2 text-white">{m.title}</h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}


function HeroCarousel({ slides, categories }: { slides: Movie[]; categories?: any[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;
  const heroCategories = (categories ?? []).slice(0, 10);

  useEffect(() => {
    if (count <= 1 || paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), 6000);
    return () => clearInterval(id);
  }, [count, paused]);

  const go = (dir: number) => setIndex((i) => (i + dir + Math.max(count, 1)) % Math.max(count, 1));

  if (count === 0) {
    return (
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0">
          <img src={heroImage} alt="" className="w-full h-full object-cover object-center block" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/20 to-slate-950/75" />
        </div>
        <div className="relative container-95 py-24 sm:py-28 lg:py-32">
          <div className="max-w-3xl rounded-[2rem] border border-white/10 bg-slate-950/50 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-white">
              Uganda's home for <span className="text-gold">VJ-translated</span> cinema.
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl">
              Discover the latest movies in Luganda with premium streaming quality and local VJ flavor.
            </p>
            <Link to="/movies" className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-gold px-6 py-3 text-black font-semibold shadow-gold transition hover:brightness-110">
              <Play className="w-4 h-4 fill-black" /> Browse movies
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative overflow-hidden bg-slate-950"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      <div className="relative h-[70vh] min-h-[540px] max-h-[780px] w-full">
        {slides.map((m, i) => (
          <div
            key={m.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${i === index ? "opacity-100 z-10" : "opacity-0 z-0"}`}
            aria-hidden={i !== index}
          >
            <img
              src={m.poster_url || heroImage}
              alt={m.title}
              className="absolute inset-0 h-full w-full object-cover object-center"
              loading={i === 0 ? "eager" : "lazy"}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/10 to-slate-950/95" />

            <div className="relative z-10 h-full container-95 flex items-center">
              <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-[minmax(520px,700px)_auto]">
                <div className="order-2 lg:order-1">
                  <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-2xl shadow-black/40 backdrop-blur-2xl max-w-3xl lg:max-w-2xl">
                    <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.32em] text-slate-300 mb-5">
                      <span className="rounded-full bg-slate-800/80 px-3 py-1 text-slate-100">{m.release_year ?? "2025"}</span>
                      <span className="rounded-full bg-slate-800/80 px-3 py-1 text-slate-100">Movie</span>
                      {m.vj ? (
                        <span className="rounded-full bg-rose-500/10 border border-rose-500/20 px-3 py-1 text-rose-300 tracking-[0.16em]">vj {m.vj}</span>
                      ) : null}
                    </div>
                    <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-tight text-white mb-4">
                      {m.title}
                    </h1>
                    <p className="text-sm sm:text-base leading-7 sm:leading-8 text-slate-300 max-w-2xl mb-8">
                      {m.description ?? "After the underlying tech for M3GAN is stolen and misused by a powerful defense contractor to create a military-grade weapon known as Amelia, your favourite VJ brings the action to life."}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Link to="/movies/$slug" params={{ slug: m.slug }} className="inline-flex items-center gap-2 rounded-full bg-pink-400 px-6 py-3 text-slate-950 font-semibold shadow-lg shadow-pink-500/20 hover:brightness-105 transition">
                        <Download className="w-4 h-4" /> Download Now
                      </Link>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 lg:pb-0">
                      {heroCategories.map((category) => (
                        <span key={category.id} className="rounded-full border border-white/10 bg-slate-800/70 px-3 py-2 text-sm text-slate-100">
                          {category.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="relative order-1 lg:order-2 flex items-start justify-end p-6 lg:p-0">
                  <div className="flex flex-col gap-4 rounded-full border border-white/10 bg-black/30 p-4 backdrop-blur-xl shadow-2xl shadow-black/40">
                    <button
                      onClick={() => go(-1)}
                      className="h-12 w-12 rounded-full border border-white/15 bg-slate-900/85 text-white shadow-sm transition hover:bg-white/10"
                      aria-label="Previous slide"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => go(1)}
                      className="h-12 w-12 rounded-full border border-white/15 bg-slate-900/85 text-white shadow-sm transition hover:bg-white/10"
                      aria-label="Next slide"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {count > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              aria-label="Previous slide"
              className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 grid place-items-center rounded-full bg-black/50 border border-white/10 hover:bg-gold hover:text-black text-white transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Next slide"
              className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 grid place-items-center rounded-full bg-black/50 border border-white/10 hover:bg-gold hover:text-black text-white transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${i === index ? "w-8 bg-gold" : "w-3 bg-white/40 hover:bg-white/70"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}


function SeriesTrailersRow({ series }: { series?: any[] }) {
  if (!series || series.length === 0) return null;
  return (
    <section className="container-95 py-8">
      <div className="flex items-end justify-between mb-5">
        <h2 className="text-2xl font-display font-bold flex items-center gap-2"><Tv className="w-6 h-6 text-gold" /> Series & Trailers</h2>
        <Link to="/series" className="text-sm text-gold hover:underline">See all →</Link>
      </div>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-3 -mx-4 px-4">
        {series.map((s) => (
          <Link key={s.id} to="/series" className="group shrink-0 w-64">
            <div className="relative aspect-video overflow-hidden rounded-lg bg-muted shadow-card border border-border">
              {s.poster_url ? <img src={s.poster_url} alt={s.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full bg-gradient-to-br from-muted to-card" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              {s.trailer_url && <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-gold text-black text-[10px] font-bold">TRAILER</span>}
              <div className="absolute bottom-2 left-2 right-2">
                <h3 className="text-white text-sm font-semibold line-clamp-1">{s.title}</h3>
                <p className="text-[11px] text-white/70">S{s.seasons ?? 1} · {s.episodes ?? 1} ep</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

const HOME_PLANS = [
  { key: "daily", name: "Daily", price: 2000, perks: ["24-hour access", "HD streaming"] },
  { key: "weekly", name: "Weekly", price: 5000, perks: ["7-day access", "All premium"] },
  { key: "monthly", name: "Monthly", price: 15000, popular: true, perks: ["30-day access", "Full HD", "Downloads"] },
  { key: "yearly", name: "Yearly", price: 120000, perks: ["365-day access", "Save 33%", "Downloads"] },
];

function PricingPreview() {
  return (
    <section className="container-95 py-16">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/40 bg-gold/10 text-gold text-xs font-medium mb-3">
          <Crown className="w-3 h-3" /> Premium Plans
        </div>
        <h2 className="font-display text-3xl sm:text-4xl font-bold">Subscribe to unlock downloads</h2>
        <p className="mt-2 text-sm text-muted-foreground">Sign in to browse the full catalog — pay a plan to download and keep watching offline.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {HOME_PLANS.map((p) => (
          <div key={p.key} className={`relative rounded-2xl border p-5 flex flex-col ${p.popular ? "border-gold bg-gradient-to-b from-gold/10 to-card shadow-gold" : "border-border bg-card"}`}>
            {p.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gradient-gold text-black text-[10px] font-bold rounded-full">POPULAR</span>}
            <h3 className="font-display text-lg font-bold">{p.name}</h3>
            <div className="mt-2 text-2xl font-bold">UGX {p.price.toLocaleString()}</div>
            <ul className="mt-4 space-y-1.5 flex-1 text-sm">
              {p.perks.map((x) => <li key={x} className="flex items-start gap-1.5"><Check className="w-4 h-4 text-gold mt-0.5 shrink-0" /> {x}</li>)}
            </ul>
            <Link to="/pricing" className={`mt-5 w-full text-center py-2 rounded-md font-semibold text-sm ${p.popular ? "bg-gradient-gold text-black shadow-gold" : "border border-border hover:border-gold hover:text-gold"}`}>
              Choose {p.name}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
