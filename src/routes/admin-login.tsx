import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Shield, Lock, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ADMIN_EMAIL = "shadix@gmail.com";

export const Route = createFileRoute("/admin-login")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin Login — VJ STREAM UG" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminLogin,
});

function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user?.email?.toLowerCase() === ADMIN_EMAIL) {
        router.navigate({ to: "/admin" });
      }
    });
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim().toLowerCase() !== ADMIN_EMAIL) {
      toast.error("This portal is restricted. Admins only.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      // verify admin role
      const { data: role } = await supabase
        .from("user_roles").select("role").eq("user_id", data.user!.id).eq("role", "admin").maybeSingle();
      if (!role) {
        await supabase.auth.signOut();
        throw new Error("Account is not an admin.");
      }
      toast.success("Welcome, Admin");
      router.navigate({ to: "/admin" });
    } catch (e: any) {
      toast.error(e.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-background px-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle at 30% 20%, var(--gold) 0%, transparent 50%), radial-gradient(circle at 70% 80%, var(--gold) 0%, transparent 50%)" }} />
      <Link to="/" className="absolute top-6 left-6 text-sm text-muted-foreground hover:text-gold inline-flex items-center gap-1.5">
        <ArrowLeft className="w-4 h-4" /> Back to site
      </Link>

      <div className="relative w-full max-w-md rounded-2xl border border-gold/30 bg-card/80 backdrop-blur-xl p-8 shadow-gold">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-gradient-gold grid place-items-center shadow-gold mb-3">
            <Shield className="w-7 h-7 text-black" />
          </div>
          <h1 className="font-display text-2xl font-bold">Admin Portal</h1>
          <p className="text-sm text-muted-foreground mt-1">Restricted access — authorized personnel only.</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Admin Email</span>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@vjstream.ug"
              className="w-full px-3 py-2.5 rounded-md bg-input border border-border focus:border-gold outline-none" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Password</span>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 rounded-md bg-input border border-border focus:border-gold outline-none" />
          </label>
          <button disabled={loading} type="submit"
            className="w-full py-2.5 rounded-md bg-gradient-gold text-black font-semibold shadow-gold disabled:opacity-50 inline-flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" /> {loading ? "Verifying..." : "Sign in to Admin"}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            Not an admin?{" "}
            <Link to="/auth" className="text-gold hover:underline">Sign in as user</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
