import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Tag, ChevronRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { mergeCategories } from "@/lib/categories";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Categories — VJ STREAM UG" },
      { name: "description", content: "Browse VJ-translated movies by category: action, comedy, romance, horror, adventure and more." },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => mergeCategories((await supabase.from("categories").select("*").order("name")).data ?? []),
  });

  const { data: counts } = useQuery({
    queryKey: ["categories", "counts"],
    queryFn: async () => {
      const { data } = await supabase.from("movies").select("category_id");
      const map: Record<string, number> = {};
      (data ?? []).forEach((r: any) => { if (r.category_id) map[r.category_id] = (map[r.category_id] ?? 0) + 1; });
      return map;
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container-95 py-10">
        <div className="flex items-center gap-3 mb-2">
          <Tag className="w-7 h-7 text-gold" />
          <h1 className="font-display text-4xl font-bold">Categories</h1>
        </div>
        <p className="text-muted-foreground mb-8">Find your next favorite by genre.</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories?.map((c: any) => (
            <Link key={c.id} to="/movies" search={{ category: c.slug }} className="group rounded-xl border border-border bg-card p-6 hover:border-gold hover:bg-gold/5 transition">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display text-xl font-bold group-hover:text-gold">{c.name}</h3>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-gold group-hover:translate-x-1 transition" />
              </div>
              <p className="text-sm text-muted-foreground">{counts?.[c.id] ?? 0} titles</p>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
