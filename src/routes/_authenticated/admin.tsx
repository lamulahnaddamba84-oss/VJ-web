import { createFileRoute, redirect, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Film, Users, DollarSign, Plus, Trash2, TrendingUp, Radio, Zap, Pencil, BarChart3, Settings as SettingsIcon, LogOut, Tag, Eye, Tv, HelpCircle, Sparkles, ChevronLeft } from "lucide-react";
import { SidebarProvider, SidebarTrigger, SidebarInset, Sidebar, SidebarHeader, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar } from "@/components/ui/sidebar";
import { UploadField } from "@/components/UploadField";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin Panel — VJ STREAM UG" }] }),
  beforeLoad: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw redirect({ to: "/auth" });
    if (u.user.email?.toLowerCase() !== "shadix@gmail.com") throw redirect({ to: "/dashboard" });
    const { data: role } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id).eq("role", "admin").maybeSingle();
    if (!role) throw redirect({ to: "/dashboard" });
  },
  component: Admin,
});

type Tab = "dashboard" | "movies" | "series" | "live" | "shorts" | "users" | "payments" | "reports" | "settings";

const TABS: { id: Tab; icon: React.ReactNode; label: string }[] = [
  { id: "dashboard", icon: <BarChart3 className="w-4 h-4" />, label: "Dashboard" },
  { id: "movies", icon: <Film className="w-4 h-4" />, label: "Movies" },
  { id: "series", icon: <Tv className="w-4 h-4" />, label: "Series" },
  { id: "live", icon: <Radio className="w-4 h-4" />, label: "Live" },
  { id: "shorts", icon: <Zap className="w-4 h-4" />, label: "Shorts" },
  { id: "users", icon: <Users className="w-4 h-4" />, label: "Users" },
  { id: "payments", icon: <DollarSign className="w-4 h-4" />, label: "Payments" },
  { id: "reports", icon: <TrendingUp className="w-4 h-4" />, label: "Reports" },
  { id: "settings", icon: <SettingsIcon className="w-4 h-4" />, label: "Settings" },
];

// Broad invalidator: refresh admin caches AND the public frontend queries so
// uploads/edits/deletes reflect immediately on user-facing pages.
function invalidateAll(qc: ReturnType<typeof useQueryClient>, ...keys: string[]) {
  const all = new Set([...keys, "admin-stats"]);
  all.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
}

function Admin() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>("dashboard");

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [m, u, s] = await Promise.all([
        supabase.from("movies").select("id, views", { count: "exact" }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("subscriptions").select("amount_ugx, created_at"),
      ]);
      const all = s.data ?? [];
      const today = new Date(); today.setHours(0,0,0,0);
      const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);
      const revenue = all.reduce((sum, r) => sum + (r.amount_ugx ?? 0), 0);
      const todayRev = all.filter((r) => new Date(r.created_at) >= today).reduce((sum, r) => sum + (r.amount_ugx ?? 0), 0);
      const monthRev = all.filter((r) => new Date(r.created_at) >= monthStart).reduce((sum, r) => sum + (r.amount_ugx ?? 0), 0);
      const totalViews = (m.data ?? []).reduce((sum, r) => sum + (r.views ?? 0), 0);
      return { movies: m.count ?? 0, users: u.count ?? 0, revenue, todayRev, monthRev, totalViews };
    },
  });

  const { data: movies } = useQuery({
    queryKey: ["admin-movies"],
    queryFn: async () => (await supabase.from("movies").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const { data: users } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => (await supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(100)).data ?? [],
    enabled: tab === "users",
  });

  const { data: payments } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: async () => (await supabase.from("subscriptions").select("*").order("created_at", { ascending: false })).data ?? [],
    enabled: tab === "payments" || tab === "reports",
  });

  const signOut = async () => {
    await supabase.auth.signOut();
    nav({ to: "/auth" });
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AdminSidebar tab={tab} onSelect={setTab} email={user?.email} onSignOut={signOut} />
        <SidebarInset className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/80 backdrop-blur h-14 px-4">
            <SidebarTrigger />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-gold/20 text-gold text-[10px] font-bold tracking-wider">ADMIN</span>
                <h1 className="font-display text-base sm:text-lg font-bold capitalize truncate">{TABS.find((t) => t.id === tab)?.label}</h1>
              </div>
            </div>
            <button onClick={signOut} className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-md border border-border hover:bg-muted">
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </header>

          <main className="container-95 py-6 sm:py-8">
            {tab === "dashboard" && stats && (
              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard icon={<Film />} label="Movies Uploaded" value={String(stats.movies)} />
                  <StatCard icon={<Users />} label="Subscribers" value={String(stats.users)} />
                  <StatCard icon={<DollarSign />} label="Today's Revenue" value={`UGX ${stats.todayRev.toLocaleString()}`} accent />
                  <StatCard icon={<TrendingUp />} label="Monthly Revenue" value={`UGX ${stats.monthRev.toLocaleString()}`} accent />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <StatCard icon={<Eye />} label="Total Views" value={stats.totalViews.toLocaleString()} />
                  <StatCard icon={<DollarSign />} label="All-Time Revenue" value={`UGX ${stats.revenue.toLocaleString()}`} />
                </div>

                <div>
                  <h2 className="font-display text-xl font-bold mb-3">Recent Uploads</h2>
                  <div className="rounded-lg border border-border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted text-left"><tr><th className="p-3">Movie</th><th className="p-3">Genre</th><th className="p-3">Year</th><th className="p-3">Premium</th><th className="p-3">Views</th></tr></thead>
                      <tbody>
                        {(movies ?? []).slice(0, 8).map((m) => (
                          <tr key={m.id} className="border-t border-border">
                            <td className="p-3 font-medium">{m.title}</td>
                            <td className="p-3 text-muted-foreground">{m.genre}</td>
                            <td className="p-3 text-muted-foreground">{m.release_year}</td>
                            <td className="p-3">{m.is_premium ? <span className="text-gold">Yes</span> : <span className="text-muted-foreground">Free</span>}</td>
                            <td className="p-3 text-muted-foreground">{(m.views ?? 0).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button onClick={() => setTab("movies")} className="mt-4 px-4 py-2 rounded-md bg-gradient-gold text-black font-semibold text-sm inline-flex items-center gap-1">
                    <Plus className="w-4 h-4" /> Upload New Movie
                  </button>
                </div>
              </div>
            )}

            {tab === "movies" && <MoviesTab movies={movies ?? []} onChange={() => invalidateAll(qc, "admin-movies", "movies", "movie", "categories")} />}
            {tab === "series" && <SeriesTab />}
            {tab === "live" && <LiveTab />}
            {tab === "shorts" && <ShortsTab />}

            {tab === "users" && (
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted text-left"><tr><th className="p-3">Name</th><th className="p-3">Phone</th><th className="p-3">Joined</th></tr></thead>
                  <tbody>
                    {users?.map((u) => (
                      <tr key={u.id} className="border-t border-border">
                        <td className="p-3">{u.full_name ?? "—"}</td>
                        <td className="p-3 text-muted-foreground">{u.phone ?? "—"}</td>
                        <td className="p-3 text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {(!users || users.length === 0) && <tr><td colSpan={3} className="p-6 text-center text-muted-foreground">No users yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            )}

            {tab === "payments" && (
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted text-left"><tr><th className="p-3">Plan</th><th className="p-3">Amount</th><th className="p-3">Method</th><th className="p-3">Status</th><th className="p-3">Date</th></tr></thead>
                  <tbody>
                    {payments?.map((p) => (
                      <tr key={p.id} className="border-t border-border">
                        <td className="p-3 capitalize">{p.plan}</td>
                        <td className="p-3 text-gold">UGX {p.amount_ugx.toLocaleString()}</td>
                        <td className="p-3 text-muted-foreground">{p.payment_method}</td>
                        <td className="p-3"><span className="px-2 py-0.5 rounded bg-gold/20 text-gold text-xs">{p.status}</span></td>
                        <td className="p-3 text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {(!payments || payments.length === 0) && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No payments yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            )}

            {tab === "reports" && <ReportsTab payments={payments ?? []} movies={movies ?? []} />}
            {tab === "settings" && <SettingsTab />}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

function AdminSidebar({ tab, onSelect, email, onSignOut }: { tab: Tab; onSelect: (t: Tab) => void; email?: string; onSignOut: () => void }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="border-b border-border p-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-md bg-gradient-gold grid place-items-center text-black shrink-0"><Film className="w-5 h-5" /></div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="font-display font-bold text-sm leading-tight">VJ STREAM <span className="text-gold">UG</span></div>
              <div className="text-[10px] text-muted-foreground truncate">{email}</div>
            </div>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Manage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {TABS.map((t) => (
                <SidebarMenuItem key={t.id}>
                  <SidebarMenuButton
                    isActive={tab === t.id}
                    onClick={() => onSelect(t.id)}
                    tooltip={t.label}
                    className={tab === t.id ? "bg-gradient-gold !text-black font-semibold" : ""}
                  >
                    {t.icon}
                    <span>{t.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Dashboard"><Link to="/dashboard"><ChevronLeft className="w-4 h-4" /><span>User Dashboard</span></Link></SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={onSignOut} tooltip="Sign out"><LogOut className="w-4 h-4" /><span>Sign out</span></SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-5 ${accent ? "border-gold/50 bg-gold/5" : "border-border bg-card"}`}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="text-gold">{icon}</span> {label}
      </div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
    </div>
  );
}

const EMPTY_MOVIE = { title: "", slug: "", description: "", genre: "Action", release_year: new Date().getFullYear(), runtime: 100, poster_url: "", trailer_url: "", video_url: "", is_premium: false, price_ugx: 0, vj: "", country: "", director: "", movie_cast: "", company: "", telegram_url: "" };

function MoviesTab({ movies, onChange }: { movies: any[]; onChange: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(EMPTY_MOVIE);
  const [search, setSearch] = useState("");

  const reset = () => { setForm(EMPTY_MOVIE); setEditingId(null); setShowForm(false); };

  const save = useMutation({
    mutationFn: async () => {
      if (editingId) {
        const { error } = await supabase.from("movies").update(form).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("movies").insert(form);
        if (error) throw error;
      }
    },
    onSuccess: () => { toast.success(editingId ? "Movie updated" : "Movie added"); reset(); onChange(); },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("movies").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Movie deleted"); onChange(); },
    onError: (e: any) => toast.error(e.message),
  });

  const startEdit = (m: any) => {
    setEditingId(m.id);
    setForm({ title: m.title, slug: m.slug, description: m.description ?? "", genre: m.genre ?? "Action", release_year: m.release_year ?? 2024, runtime: m.runtime ?? 100, poster_url: m.poster_url ?? "", trailer_url: m.trailer_url ?? "", video_url: m.video_url ?? "", is_premium: !!m.is_premium, price_ugx: m.price_ugx ?? 0, vj: m.vj ?? "", country: m.country ?? "", director: m.director ?? "", movie_cast: m.movie_cast ?? "", company: m.company ?? "", telegram_url: m.telegram_url ?? "" });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filtered = movies.filter((m) => !search || m.title.toLowerCase().includes(search.toLowerCase()) || m.genre?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex flex-wrap justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold">{movies.length} movies</h2>
          <input placeholder="Search title or genre…" value={search} onChange={(e) => setSearch(e.target.value)} className="px-3 py-1.5 rounded-md bg-input border border-border text-sm w-64" />
        </div>
        <button onClick={() => { if (showForm) reset(); else setShowForm(true); }} className="px-4 py-2 rounded-md bg-gradient-gold text-black font-semibold text-sm flex items-center gap-1">
          <Plus className="w-4 h-4" /> {showForm ? "Cancel" : "Add Movie"}
        </button>
      </div>

      {showForm && (
        <div className="rounded-lg border border-gold/40 bg-card p-5 mb-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h3 className="font-semibold text-gold text-lg">{editingId ? "Edit movie" : "Add a new movie"}</h3>
              <p className="text-xs text-muted-foreground mt-1">Fill the details below. You can either paste a URL or upload the file from your device.</p>
            </div>
            <Sparkles className="w-5 h-5 text-gold shrink-0" />
          </div>

          {/* Quick guide (Prime Video style) */}
          <div className="rounded-md border border-border bg-muted/40 p-3 mb-5 text-xs text-muted-foreground">
            <p className="flex items-center gap-1.5 font-semibold text-foreground mb-1"><HelpCircle className="w-3.5 h-3.5 text-gold" /> Quick guide</p>
            <ul className="list-disc pl-5 space-y-0.5">
              <li><b>Title</b> & <b>Slug</b> — Slug is the URL id, e.g. <code>avengers-endgame</code> (lowercase, dashes).</li>
              <li><b>Poster</b> — vertical image (2:3), JPG/PNG, min 600×900.</li>
              <li><b>Trailer</b> — YouTube link or short MP4 preview.</li>
              <li><b>Video</b> — full film MP4 (upload) or paid CDN URL. Premium films require a subscription to download.</li>
              <li><b>VJ Name</b> — e.g. <i>VJ Junior</i>, <i>VJ Emmy</i>. Displayed on the movie card.</li>
              <li><b>Premium</b> — tick to lock behind a subscription plan.</li>
            </ul>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold">Title</label>
              <input placeholder="e.g. Avengers: Endgame" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: editingId ? form.slug : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") })} className="mt-1 w-full px-3 py-2 rounded-md bg-input border border-border focus:border-gold outline-none text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold">Slug (URL)</label>
              <input placeholder="avengers-endgame" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-md bg-input border border-border focus:border-gold outline-none text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold">Genre</label>
              <input placeholder="Action, Drama, Comedy…" value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-md bg-input border border-border text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold">VJ Name</label>
              <input placeholder="VJ Junior" value={form.vj} onChange={(e) => setForm({ ...form, vj: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-md bg-input border border-border text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold">Release Year</label>
              <input type="number" value={form.release_year} onChange={(e) => setForm({ ...form, release_year: +e.target.value })} className="mt-1 w-full px-3 py-2 rounded-md bg-input border border-border text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold">Runtime (min)</label>
              <input type="number" value={form.runtime} onChange={(e) => setForm({ ...form, runtime: +e.target.value })} className="mt-1 w-full px-3 py-2 rounded-md bg-input border border-border text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold">Country</label>
              <input placeholder="e.g. Philippines" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-md bg-input border border-border text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold">Director</label>
              <input placeholder="e.g. Christopher Novabos" value={form.director} onChange={(e) => setForm({ ...form, director: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-md bg-input border border-border text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold">Company / Studio</label>
              <input placeholder="e.g. Vivamax" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-md bg-input border border-border text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold">Cast (comma separated)</label>
              <input placeholder="Actor 1, Actor 2…" value={form.movie_cast} onChange={(e) => setForm({ ...form, movie_cast: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-md bg-input border border-border text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold">Telegram / Join Channel URL (optional)</label>
              <input placeholder="https://t.me/yourchannel" value={form.telegram_url} onChange={(e) => setForm({ ...form, telegram_url: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-md bg-input border border-border text-sm" />
            </div>
            <div className="sm:col-span-2 grid sm:grid-cols-3 gap-3">
              <UploadField label="Poster image" hint="Vertical cover shown on cards. JPG/PNG." accept="image/*" folder="posters" value={form.poster_url} onChange={(v) => setForm({ ...form, poster_url: v })} />
              <UploadField label="Trailer" hint="YouTube link or short MP4." accept="video/*" folder="trailers" value={form.trailer_url} onChange={(v) => setForm({ ...form, trailer_url: v })} />
              <UploadField label="Full video" hint="MP4 upload or CDN URL." accept="video/*" folder="videos" value={form.video_url} onChange={(v) => setForm({ ...form, video_url: v })} />
            </div>
            <div>
              <label className="text-xs font-semibold">Price (UGX, optional)</label>
              <input type="number" value={form.price_ugx} onChange={(e) => setForm({ ...form, price_ugx: +e.target.value })} className="mt-1 w-full px-3 py-2 rounded-md bg-input border border-border text-sm" />
            </div>
            <label className="flex items-center gap-2 text-sm mt-6">
              <input type="checkbox" checked={form.is_premium} onChange={(e) => setForm({ ...form, is_premium: e.target.checked })} className="w-4 h-4 accent-gold" />
              <span>Premium (subscribers only)</span>
            </label>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold">Description / Synopsis</label>
              <textarea placeholder="A short summary shown on the movie page…" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="mt-1 w-full px-3 py-2 rounded-md bg-input border border-border text-sm" />
            </div>
            <button onClick={() => save.mutate()} disabled={!form.title || !form.slug || save.isPending} className="sm:col-span-2 px-4 py-3 rounded-md bg-gradient-gold text-black font-semibold disabled:opacity-50">
              {save.isPending ? "Saving..." : editingId ? "Update Movie" : "Publish Movie"}
            </button>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left"><tr><th className="p-3">Title</th><th className="p-3">Year</th><th className="p-3">Genre</th><th className="p-3">VJ</th><th className="p-3">Views</th><th className="p-3">Premium</th><th className="p-3 text-right">Actions</th></tr></thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id} className="border-t border-border">
                <td className="p-3 font-medium">{m.title}</td>
                <td className="p-3 text-muted-foreground">{m.release_year}</td>
                <td className="p-3 text-muted-foreground">{m.genre}</td>
                <td className="p-3 text-muted-foreground">{m.vj ?? "—"}</td>
                <td className="p-3 text-muted-foreground">{(m.views ?? 0).toLocaleString()}</td>
                <td className="p-3">{m.is_premium ? <span className="text-gold">★</span> : "—"}</td>
                <td className="p-3">
                  <div className="flex gap-1 justify-end">
                    <button onClick={() => startEdit(m)} className="p-1.5 text-gold hover:bg-gold/10 rounded" title="Edit"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => confirm(`Delete "${m.title}"?`) && del.mutate(m.id)} className="p-1.5 text-destructive hover:bg-destructive/10 rounded" title="Delete"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">No movies match.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LiveTab() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const empty = { title: "", vj: "", stream_url: "", thumbnail_url: "", description: "", is_live: false, scheduled_at: "" };
  const [form, setForm] = useState(empty);

  const { data: streams } = useQuery({
    queryKey: ["admin-live"],
    queryFn: async () => (await supabase.from("live_streams").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const refresh = () => invalidateAll(qc, "admin-live", "live_streams");
  const reset = () => { setForm(empty); setEditingId(null); setShowForm(false); };

  const save = useMutation({
    mutationFn: async () => {
      const payload: any = { ...form };
      if (!payload.scheduled_at) payload.scheduled_at = null;
      else payload.scheduled_at = new Date(payload.scheduled_at).toISOString();
      if (editingId) {
        const { error } = await supabase.from("live_streams").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("live_streams").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { toast.success(editingId ? "Stream updated" : "Stream scheduled"); reset(); refresh(); },
    onError: (e: any) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: async (s: any) => { const { error } = await supabase.from("live_streams").update({ is_live: !s.is_live }).eq("id", s.id); if (error) throw error; },
    onSuccess: () => { toast.success("Status updated"); refresh(); },
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("live_streams").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Removed"); refresh(); },
  });

  const startEdit = (s: any) => {
    setEditingId(s.id);
    setForm({ title: s.title, vj: s.vj ?? "", stream_url: s.stream_url ?? "", thumbnail_url: s.thumbnail_url ?? "", description: s.description ?? "", is_live: !!s.is_live, scheduled_at: s.scheduled_at ? new Date(s.scheduled_at).toISOString().slice(0, 16) : "" });
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h2 className="font-semibold flex items-center gap-2"><Radio className="w-4 h-4 text-red-500" /> {streams?.length ?? 0} streams</h2>
        <button onClick={() => { if (showForm) reset(); else setShowForm(true); }} className="px-4 py-2 rounded-md bg-gradient-gold text-black font-semibold text-sm flex items-center gap-1">
          <Plus className="w-4 h-4" /> {showForm ? "Cancel" : "New Live Stream"}
        </button>
      </div>

      {showForm && (
        <div className="rounded-lg border border-gold/40 bg-card p-5 mb-6 grid sm:grid-cols-2 gap-3">
          <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="px-3 py-2 rounded-md bg-input border border-border focus:border-gold outline-none text-sm" />
          <input placeholder="VJ name" value={form.vj} onChange={(e) => setForm({ ...form, vj: e.target.value })} className="px-3 py-2 rounded-md bg-input border border-border text-sm" />
          <input placeholder="Stream URL (YouTube live or HLS)" value={form.stream_url} onChange={(e) => setForm({ ...form, stream_url: e.target.value })} className="sm:col-span-2 px-3 py-2 rounded-md bg-input border border-border text-sm" />
          <input placeholder="Thumbnail URL" value={form.thumbnail_url} onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })} className="px-3 py-2 rounded-md bg-input border border-border text-sm" />
          <input type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} className="px-3 py-2 rounded-md bg-input border border-border text-sm" />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="sm:col-span-2 px-3 py-2 rounded-md bg-input border border-border text-sm" />
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" checked={form.is_live} onChange={(e) => setForm({ ...form, is_live: e.target.checked })} /> Go live immediately
          </label>
          <button onClick={() => save.mutate()} disabled={!form.title || !form.vj || !form.stream_url || save.isPending} className="sm:col-span-2 px-4 py-2 rounded-md bg-gradient-gold text-black font-semibold disabled:opacity-50">
            {save.isPending ? "Saving..." : editingId ? "Update Stream" : "Publish Stream"}
          </button>
        </div>
      )}

      <div className="rounded-lg border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left"><tr><th className="p-3">Title</th><th className="p-3">VJ</th><th className="p-3">Status</th><th className="p-3">Schedule</th><th className="p-3 text-right">Actions</th></tr></thead>
          <tbody>
            {streams?.map((s) => (
              <tr key={s.id} className="border-t border-border">
                <td className="p-3 font-medium">{s.title}</td>
                <td className="p-3 text-muted-foreground">{s.vj}</td>
                <td className="p-3">
                  <button onClick={() => toggle.mutate(s)} className={`px-2 py-0.5 rounded text-xs font-semibold ${s.is_live ? "bg-red-600 text-white" : "bg-muted text-muted-foreground"}`}>
                    {s.is_live ? "● LIVE" : "Offline"}
                  </button>
                </td>
                <td className="p-3 text-muted-foreground text-xs">{s.scheduled_at ? new Date(s.scheduled_at).toLocaleString() : "—"}</td>
                <td className="p-3">
                  <div className="flex gap-1 justify-end">
                    <button onClick={() => startEdit(s)} className="p-1.5 text-gold hover:bg-gold/10 rounded"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => del.mutate(s.id)} className="p-1.5 text-destructive hover:bg-destructive/10 rounded"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {(!streams || streams.length === 0) && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No streams yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ShortsTab() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const empty = { title: "", vj: "", video_url: "", thumbnail_url: "", description: "", duration: 30 };
  const [form, setForm] = useState(empty);

  const { data: shorts } = useQuery({
    queryKey: ["admin-shorts"],
    queryFn: async () => (await supabase.from("shorts").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const refresh = () => invalidateAll(qc, "admin-shorts", "shorts");
  const reset = () => { setForm(empty); setEditingId(null); setShowForm(false); };

  const save = useMutation({
    mutationFn: async () => {
      if (editingId) {
        const { error } = await supabase.from("shorts").update(form).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("shorts").insert(form);
        if (error) throw error;
      }
    },
    onSuccess: () => { toast.success(editingId ? "Short updated" : "Short published"); reset(); refresh(); },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("shorts").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Removed"); refresh(); },
  });

  const startEdit = (s: any) => {
    setEditingId(s.id);
    setForm({ title: s.title, vj: s.vj ?? "", video_url: s.video_url ?? "", thumbnail_url: s.thumbnail_url ?? "", description: s.description ?? "", duration: s.duration ?? 30 });
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h2 className="font-semibold flex items-center gap-2"><Zap className="w-4 h-4 text-gold" /> {shorts?.length ?? 0} shorts</h2>
        <button onClick={() => { if (showForm) reset(); else setShowForm(true); }} className="px-4 py-2 rounded-md bg-gradient-gold text-black font-semibold text-sm flex items-center gap-1">
          <Plus className="w-4 h-4" /> {showForm ? "Cancel" : "Add Short"}
        </button>
      </div>

      {showForm && (
        <div className="rounded-lg border border-gold/40 bg-card p-5 mb-6 grid sm:grid-cols-2 gap-3">
          <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="px-3 py-2 rounded-md bg-input border border-border focus:border-gold text-sm" />
          <input placeholder="VJ" value={form.vj} onChange={(e) => setForm({ ...form, vj: e.target.value })} className="px-3 py-2 rounded-md bg-input border border-border text-sm" />
          <div className="sm:col-span-2 grid sm:grid-cols-2 gap-3">
            <UploadField label="Short video" hint="Under 60 seconds — MP4 upload or YouTube Shorts URL." accept="video/*" folder="shorts" value={form.video_url} onChange={(v) => setForm({ ...form, video_url: v })} />
            <UploadField label="Thumbnail" hint="Vertical cover (9:16 recommended)." accept="image/*" folder="posters" value={form.thumbnail_url} onChange={(v) => setForm({ ...form, thumbnail_url: v })} />
          </div>
          <input type="number" placeholder="Duration (sec)" value={form.duration} onChange={(e) => setForm({ ...form, duration: +e.target.value })} className="px-3 py-2 rounded-md bg-input border border-border text-sm" />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="sm:col-span-2 px-3 py-2 rounded-md bg-input border border-border text-sm" />
          <button onClick={() => save.mutate()} disabled={!form.title || !form.video_url || save.isPending} className="sm:col-span-2 px-4 py-2 rounded-md bg-gradient-gold text-black font-semibold disabled:opacity-50">
            {save.isPending ? "Saving..." : editingId ? "Update Short" : "Publish Short"}
          </button>
        </div>
      )}

      <div className="rounded-lg border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left"><tr><th className="p-3">Title</th><th className="p-3">VJ</th><th className="p-3">Views</th><th className="p-3">Likes</th><th className="p-3 text-right">Actions</th></tr></thead>
          <tbody>
            {shorts?.map((s) => (
              <tr key={s.id} className="border-t border-border">
                <td className="p-3 font-medium">{s.title}</td>
                <td className="p-3 text-muted-foreground">{s.vj ?? "—"}</td>
                <td className="p-3 text-muted-foreground">{s.views}</td>
                <td className="p-3 text-muted-foreground">{s.likes}</td>
                <td className="p-3">
                  <div className="flex gap-1 justify-end">
                    <button onClick={() => startEdit(s)} className="p-1.5 text-gold hover:bg-gold/10 rounded"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => del.mutate(s.id)} className="p-1.5 text-destructive hover:bg-destructive/10 rounded"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {(!shorts || shorts.length === 0) && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No shorts yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReportsTab({ payments, movies }: { payments: any[]; movies: any[] }) {
  const last30 = new Date(); last30.setDate(last30.getDate() - 30);
  const recent = payments.filter((p) => new Date(p.created_at) >= last30);
  const planTotals = recent.reduce((acc: Record<string, number>, p) => {
    acc[p.plan] = (acc[p.plan] ?? 0) + (p.amount_ugx ?? 0);
    return acc;
  }, {});
  const genreCount = movies.reduce((acc: Record<string, number>, m) => {
    acc[m.genre ?? "Other"] = (acc[m.genre ?? "Other"] ?? 0) + 1;
    return acc;
  }, {});
  const topMovies = [...movies].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold mb-3">Revenue by Plan (30 days)</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {Object.entries(planTotals).length === 0 && <p className="text-sm text-muted-foreground">No revenue yet.</p>}
          {Object.entries(planTotals).map(([plan, total]) => (
            <div key={plan} className="rounded-lg border border-border bg-card p-4">
              <div className="text-xs uppercase text-muted-foreground">{plan}</div>
              <div className="mt-1 text-lg font-bold text-gold">UGX {total.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-display text-xl font-bold mb-3">Movies by Genre</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(genreCount).map(([g, c]) => (
            <span key={g} className="px-3 py-1.5 rounded-md border border-border bg-card text-sm">
              {g} <span className="text-gold font-semibold ml-1">{c}</span>
            </span>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-display text-xl font-bold mb-3">Top 10 Movies by Views</h2>
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left"><tr><th className="p-3">#</th><th className="p-3">Title</th><th className="p-3">Genre</th><th className="p-3 text-right">Views</th></tr></thead>
            <tbody>
              {topMovies.map((m, i) => (
                <tr key={m.id} className="border-t border-border">
                  <td className="p-3 text-muted-foreground">{i + 1}</td>
                  <td className="p-3 font-medium">{m.title}</td>
                  <td className="p-3 text-muted-foreground">{m.genre}</td>
                  <td className="p-3 text-right text-gold">{(m.views ?? 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SettingsTab() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const { data: categories } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => (await supabase.from("categories").select("*").order("name")).data ?? [],
  });

  const refresh = () => invalidateAll(qc, "admin-categories", "categories");

  const add = useMutation({
    mutationFn: async () => { const { error } = await supabase.from("categories").insert({ name, slug: slug || name.toLowerCase().replace(/\s+/g, "-") }); if (error) throw error; },
    onSuccess: () => { toast.success("Category added"); setName(""); setSlug(""); refresh(); },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("categories").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Removed"); refresh(); },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold mb-3 flex items-center gap-2"><Tag className="w-5 h-5 text-gold" /> Categories</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          <input placeholder="Category name" value={name} onChange={(e) => setName(e.target.value)} className="px-3 py-2 rounded-md bg-input border border-border text-sm flex-1 min-w-48" />
          <input placeholder="slug (optional)" value={slug} onChange={(e) => setSlug(e.target.value)} className="px-3 py-2 rounded-md bg-input border border-border text-sm w-48" />
          <button onClick={() => add.mutate()} disabled={!name || add.isPending} className="px-4 py-2 rounded-md bg-gradient-gold text-black font-semibold text-sm disabled:opacity-50">Add</button>
        </div>
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left"><tr><th className="p-3">Name</th><th className="p-3">Slug</th><th className="p-3 text-right">Actions</th></tr></thead>
            <tbody>
              {categories?.map((c) => (
                <tr key={c.id} className="border-t border-border">
                  <td className="p-3 font-medium">{c.name}</td>
                  <td className="p-3 text-muted-foreground">{c.slug}</td>
                  <td className="p-3 text-right"><button onClick={() => del.mutate(c.id)} className="p-1.5 text-destructive hover:bg-destructive/10 rounded inline-flex"><Trash2 className="w-4 h-4" /></button></td>
                </tr>
              ))}
              {(!categories || categories.length === 0) && <tr><td colSpan={3} className="p-6 text-center text-muted-foreground">No categories yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="font-semibold mb-2">Admin account</h3>
        <p className="text-sm text-muted-foreground">Email: <span className="text-foreground font-mono">shadix@gmail.com</span></p>
        <p className="text-sm text-muted-foreground mt-1">Only this account has admin access. To change credentials, use the auth provider's password reset.</p>
      </div>
    </div>
  );
}

function SeriesTab() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const empty = { title: "", slug: "", description: "", genre: "Drama", release_year: new Date().getFullYear(), seasons: 1, episodes: 1, poster_url: "", trailer_url: "", vj: "", is_premium: false };
  const [form, setForm] = useState<any>(empty);

  const { data: series } = useQuery({
    queryKey: ["admin-series"],
    queryFn: async () => (await supabase.from("series").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const refresh = () => invalidateAll(qc, "admin-series", "series");
  const reset = () => { setForm(empty); setEditingId(null); setShowForm(false); };

  const save = useMutation({
    mutationFn: async () => {
      if (editingId) {
        const { error } = await supabase.from("series").update(form).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("series").insert(form);
        if (error) throw error;
      }
    },
    onSuccess: () => { toast.success(editingId ? "Series updated" : "Series added"); reset(); refresh(); },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("series").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Series deleted"); refresh(); },
    onError: (e: any) => toast.error(e.message),
  });

  const startEdit = (s: any) => {
    setEditingId(s.id);
    setForm({ title: s.title, slug: s.slug, description: s.description ?? "", genre: s.genre ?? "Drama", release_year: s.release_year ?? 2024, seasons: s.seasons ?? 1, episodes: s.episodes ?? 1, poster_url: s.poster_url ?? "", trailer_url: s.trailer_url ?? "", vj: s.vj ?? "", is_premium: !!s.is_premium });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      <div className="flex flex-wrap justify-between gap-3 mb-4">
        <h2 className="font-semibold flex items-center gap-2"><Tv className="w-4 h-4 text-gold" /> {series?.length ?? 0} series</h2>
        <button onClick={() => { if (showForm) reset(); else setShowForm(true); }} className="px-4 py-2 rounded-md bg-gradient-gold text-black font-semibold text-sm flex items-center gap-1">
          <Plus className="w-4 h-4" /> {showForm ? "Cancel" : "Add Series"}
        </button>
      </div>

      {showForm && (
        <div className="rounded-lg border border-gold/40 bg-card p-5 mb-6 grid sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2 rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground mb-1">Tip</p>
            Fill title & slug, then use the upload buttons below for poster and trailer, or paste external URLs.
          </div>
          {([["title","Title"],["slug","Slug"],["genre","Genre"],["vj","VJ"]] as const).map(([k,l]) => (
            <input key={k} placeholder={l} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className="px-3 py-2 rounded-md bg-input border border-border focus:border-gold outline-none text-sm" />
          ))}
          <div className="sm:col-span-2 grid sm:grid-cols-2 gap-3">
            <UploadField label="Poster" accept="image/*" folder="posters" value={form.poster_url} onChange={(v) => setForm({ ...form, poster_url: v })} />
            <UploadField label="Trailer" accept="video/*" folder="trailers" value={form.trailer_url} onChange={(v) => setForm({ ...form, trailer_url: v })} />
          </div>
          <input type="number" placeholder="Year" value={form.release_year} onChange={(e) => setForm({ ...form, release_year: +e.target.value })} className="px-3 py-2 rounded-md bg-input border border-border text-sm" />
          <input type="number" placeholder="Seasons" value={form.seasons} onChange={(e) => setForm({ ...form, seasons: +e.target.value })} className="px-3 py-2 rounded-md bg-input border border-border text-sm" />
          <input type="number" placeholder="Episodes" value={form.episodes} onChange={(e) => setForm({ ...form, episodes: +e.target.value })} className="px-3 py-2 rounded-md bg-input border border-border text-sm" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_premium} onChange={(e) => setForm({ ...form, is_premium: e.target.checked })} /> Premium
          </label>
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="sm:col-span-2 px-3 py-2 rounded-md bg-input border border-border text-sm" />
          <button onClick={() => save.mutate()} disabled={!form.title || !form.slug || save.isPending} className="sm:col-span-2 px-4 py-2 rounded-md bg-gradient-gold text-black font-semibold disabled:opacity-50">
            {save.isPending ? "Saving..." : editingId ? "Update Series" : "Publish Series"}
          </button>
        </div>
      )}

      <div className="rounded-lg border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left"><tr><th className="p-3">Title</th><th className="p-3">Year</th><th className="p-3">Seasons</th><th className="p-3">Episodes</th><th className="p-3">VJ</th><th className="p-3 text-right">Actions</th></tr></thead>
          <tbody>
            {series?.map((s) => (
              <tr key={s.id} className="border-t border-border">
                <td className="p-3 font-medium">{s.title}</td>
                <td className="p-3 text-muted-foreground">{s.release_year}</td>
                <td className="p-3 text-muted-foreground">{s.seasons}</td>
                <td className="p-3 text-muted-foreground">{s.episodes}</td>
                <td className="p-3 text-muted-foreground">{s.vj ?? "—"}</td>
                <td className="p-3">
                  <div className="flex gap-1 justify-end">
                    <button onClick={() => startEdit(s)} className="p-1.5 text-gold hover:bg-gold/10 rounded"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => confirm(`Delete "${s.title}"?`) && del.mutate(s.id)} className="p-1.5 text-destructive hover:bg-destructive/10 rounded"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {(!series || series.length === 0) && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No series yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
