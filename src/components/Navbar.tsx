import { Link, useRouter } from "@tanstack/react-router";
import { Film, Search, Menu, X, LogOut, User as UserIcon, Shield, Radio, Zap, Tv, Flame, Heart } from "lucide-react";
import { useState } from "react";
import { useAuth, useIsAdmin } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function Navbar() {
  const { user } = useAuth();
  const isAdmin = useIsAdmin(user?.id);
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const links = [
    { to: "/", label: "Home", icon: null },
    { to: "/movies", label: "Movies", icon: null },
    { to: "/series", label: "Series", icon: <Tv className="w-3.5 h-3.5" /> },
    { to: "/categories", label: "Categories", icon: null },
    { to: "/trending", label: "Trending", icon: <Flame className="w-3.5 h-3.5" /> },
    { to: "/my-list", label: "My List", icon: <Heart className="w-3.5 h-3.5" /> },
    { to: "/live", label: "Live", icon: <Radio className="w-3.5 h-3.5" /> },
    { to: "/shorts", label: "Shorts", icon: <Zap className="w-3.5 h-3.5" /> },
  ] as const;

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border">
      <div className="container-95 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <div className="grid place-items-center w-9 h-9 rounded-md bg-gradient-gold shadow-gold">
            <Film className="w-5 h-5 text-black" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">
            VJ STREAM <span className="text-gold">UG</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-0.5">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="px-2.5 py-2 text-sm font-medium text-muted-foreground hover:text-gold transition-colors flex items-center gap-1" activeProps={{ className: "text-gold" }}>
              {l.icon}{l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Link to="/movies" className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-gold" aria-label="Search">
            <Search className="w-4 h-4" />
          </Link>
          {user ? (
            <>
              {isAdmin && (
                <Link to="/admin" className="px-3 py-1.5 text-sm font-medium text-gold hover:bg-muted rounded-md flex items-center gap-1.5">
                  <Shield className="w-4 h-4" /> Admin
                </Link>
              )}
              <Link to="/dashboard" className="px-3 py-1.5 text-sm font-medium hover:bg-muted rounded-md flex items-center gap-1.5">
                <UserIcon className="w-4 h-4" /> Account
              </Link>
              <button onClick={signOut} className="p-2 rounded-md hover:bg-muted text-muted-foreground" aria-label="Sign out">
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Link to="/auth" className="px-3 py-1.5 text-sm font-medium hover:text-gold">Login</Link>
              <Link to="/auth" search={{ mode: "signup" }} className="px-4 py-2 rounded-md bg-gradient-gold text-black text-sm font-semibold hover:opacity-90 shadow-gold">
                Sign Up
              </Link>
            </>
          )}
        </div>

        <button onClick={() => setOpen(!open)} className="lg:hidden p-2" aria-label="Menu">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-background">
          <div className="px-4 py-4 space-y-1">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted">{l.icon}{l.label}</Link>
            ))}
            <div className="pt-2 mt-2 border-t border-border">
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md hover:bg-muted">Dashboard</Link>
                  {isAdmin && <Link to="/admin" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md text-gold">Admin Panel</Link>}
                  <button onClick={signOut} className="block w-full text-left px-3 py-2 rounded-md hover:bg-muted">Sign out</button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Link to="/auth" onClick={() => setOpen(false)} className="flex-1 text-center px-3 py-2 rounded-md border border-border">Login</Link>
                  <Link to="/auth" search={{ mode: "signup" }} onClick={() => setOpen(false)} className="flex-1 text-center px-3 py-2 rounded-md bg-gradient-gold text-black font-semibold">Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
