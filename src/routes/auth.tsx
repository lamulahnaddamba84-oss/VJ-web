import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Film } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type Search = { mode?: "signup" | "signin" };

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({ meta: [{ title: "Sign In — VJ STREAM UG" }, { name: "description", content: "Sign in or create an account to stream premium VJ-translated movies." }] }),
  validateSearch: (s: Record<string, unknown>): Search => ({ mode: s.mode === "signup" ? "signup" : "signin" }),
  component: AuthPage,
});

function AuthPage() {
  const search = Route.useSearch();
  const router = useRouter();
  const { user } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">(search.mode ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle()
      .then(({ data }) => router.navigate({ to: data ? "/admin" : "/dashboard" }));
  }, [user, router]);


  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin, data: { full_name: fullName, phone } },
        });
        if (error) throw error;
        toast.success("Account created! Signing you in...");
        router.navigate({ to: "/dashboard" });
      } else if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (!remember) sessionStorage.setItem("vjstream:remember", "0");
        toast.success("Welcome back!");
        router.navigate({ to: "/dashboard" });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth` });
        if (error) throw error;
        toast.success("Password reset email sent — check your inbox.");
        setMode("signin");
      }
    } catch (e: any) {
      toast.error(e.message ?? "Authentication failed");
    } finally { setLoading(false); }
  };


  const google = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } });
      if (error) throw error;
    } catch (e: any) { toast.error(e.message ?? "Google sign-in unavailable"); }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex relative items-center justify-center p-12 bg-gradient-to-br from-black via-card to-black">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, var(--gold) 0%, transparent 40%)" }} />
        <div className="relative max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="grid place-items-center w-10 h-10 rounded-md bg-gradient-gold"><Film className="w-5 h-5 text-black" /></div>
            <span className="font-display font-bold text-xl">VJ STREAM <span className="text-gold">UG</span></span>
          </Link>
          <h1 className="font-display text-4xl font-bold leading-tight">Uganda's premium streaming home.</h1>
          <p className="mt-4 text-muted-foreground">Join thousands watching VJ-translated movies in HD. From UGX 2,000.</p>
        </div>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="grid place-items-center w-9 h-9 rounded-md bg-gradient-gold"><Film className="w-4 h-4 text-black" /></div>
            <span className="font-display font-bold">VJ STREAM <span className="text-gold">UG</span></span>
          </Link>
          <h2 className="font-display text-3xl font-bold">
            {mode === "signup" ? "Create account" : mode === "forgot" ? "Reset password" : "Welcome back"}
          </h2>
          <p className="text-muted-foreground mt-1 mb-6 text-sm">
            {mode === "signup" ? "Start streaming in seconds." : mode === "forgot" ? "We'll email you a reset link." : "Sign in to keep watching."}
          </p>

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <>
                <Field label="Full name" value={fullName} onChange={setFullName} required />
                <Field label="Phone (optional)" value={phone} onChange={setPhone} placeholder="+256..." />
              </>
            )}
            <Field label="Email address" type="email" value={email} onChange={setEmail} required />
            {mode !== "forgot" && <Field label="Password" type="password" value={password} onChange={setPassword} required />}

            {mode === "signin" && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-muted-foreground">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-[var(--gold)]" />
                  Remember me
                </label>
                <button type="button" onClick={() => setMode("forgot")} className="text-gold hover:underline">Forgot password?</button>
              </div>
            )}

            <button disabled={loading} type="submit" className="w-full py-2.5 rounded-md bg-gradient-gold text-black font-semibold shadow-gold disabled:opacity-50">
              {loading ? "Please wait..." : mode === "signup" ? "Create Account" : mode === "forgot" ? "Send reset link" : "Login"}
            </button>
          </form>

          {mode !== "forgot" && (
            <>
              <div className="flex items-center gap-3 my-5 text-xs text-muted-foreground">
                <div className="flex-1 h-px bg-border" /> OR <div className="flex-1 h-px bg-border" />
              </div>
              <button onClick={google} className="w-full py-2.5 rounded-md border border-border hover:border-gold flex items-center justify-center gap-2 text-sm font-medium">
                <GoogleIcon /> Continue with Google
              </button>
            </>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signup" ? "Already have an account?" : mode === "forgot" ? "Remembered your password?" : "New here?"}{" "}
            <button onClick={() => setMode(mode === "signup" ? "signin" : mode === "forgot" ? "signin" : "signup")} className="text-gold hover:underline">
              {mode === "signup" ? "Sign in" : mode === "forgot" ? "Sign in" : "Create account"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required, placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-medium mb-1.5 block">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} placeholder={placeholder} className="w-full px-3 py-2.5 rounded-md bg-input border border-border focus:border-gold outline-none" />
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.9 3.5 14.7 2.5 12 2.5 6.7 2.5 2.4 6.8 2.4 12.1s4.3 9.6 9.6 9.6c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.2-.2-1.7H12z"/>
    </svg>
  );
}
