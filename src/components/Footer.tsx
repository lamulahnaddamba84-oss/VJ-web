import { Link } from "@tanstack/react-router";
import { Film, Facebook, Twitter, Instagram, Youtube } from "lucide-react";

const CATEGORIES = ["Action", "Comedy", "Horror", "Romance", "Adventure"];

export function Footer() {
  return (
    <footer className="border-t border-border bg-background mt-16">
      <div className="container-95 py-12 grid gap-8 md:grid-cols-5">
        <div className="md:col-span-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid place-items-center w-9 h-9 rounded-md bg-gradient-gold">
              <Film className="w-5 h-5 text-black" />
            </div>
            <span className="font-display font-bold text-lg">VJ STREAM <span className="text-gold">UG</span></span>
          </Link>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">Premium VJ-translated movies & series streamed in HD. Made for Uganda.</p>
          <div className="flex gap-3 mt-5">
            <a aria-label="Facebook" href="#" className="p-2 rounded-md border border-border hover:border-gold hover:text-gold"><Facebook className="w-4 h-4" /></a>
            <a aria-label="Twitter" href="#" className="p-2 rounded-md border border-border hover:border-gold hover:text-gold"><Twitter className="w-4 h-4" /></a>
            <a aria-label="Instagram" href="#" className="p-2 rounded-md border border-border hover:border-gold hover:text-gold"><Instagram className="w-4 h-4" /></a>
            <a aria-label="YouTube" href="#" className="p-2 rounded-md border border-border hover:border-gold hover:text-gold"><Youtube className="w-4 h-4" /></a>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-gold">Home</Link></li>
            <li><Link to="/movies" className="hover:text-gold">Movies</Link></li>
            <li><Link to="/series" className="hover:text-gold">Series</Link></li>
            <li><Link to="/categories" className="hover:text-gold">Categories</Link></li>
            <li><Link to="/trending" className="hover:text-gold">Trending</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-3">Categories</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {CATEGORIES.map((c) => (
              <li key={c}><Link to="/movies" search={{ category: c.toLowerCase() }} className="hover:text-gold">{c}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-3">Support</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a className="hover:text-gold" href="#">Contact Us</a></li>
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-gold transition">
             Privacy Policy
            </Link>
            <li><a className="hover:text-gold" href="#">Terms of Use</a></li>
            <li><a className="hover:text-gold" href="#">DMCA</a></li>
            <li><a className="hover:text-gold" href="#">FAQ</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-5 flex items-center justify-center text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} VJ STREAM UG. All rights reserved.</span>
      </div>


    </footer>
  );
}
