import { useState, FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — VJ STREAM UG" },
      { name: "description", content: "Reach out to support regarding account issues or billing problems." },
    ],
  }),
  component: ContactComponent,
});

function ContactComponent() {
  const [formData, setFormData] = useState({ name: "", email: "", reason: "billing", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    const phoneNumber = "256750434712";
    const message = `Hello VJ STREAM UG.\nName: ${formData.name}\nEmail: ${formData.email}\nReason: ${formData.reason}\nMessage: ${formData.message}`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    try {
      if (typeof window !== "undefined") {
        const newWindow = window.open(whatsappUrl, "_blank", "noopener,noreferrer");
        if (!newWindow) {
          window.location.href = whatsappUrl;
        }
      }

      setStatus("success");
      setFormData({ name: "", email: "", reason: "billing", message: "" });
    } catch (error) {
      console.error("Failed to open WhatsApp", error);
      setStatus("idle");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      
      <main className="flex-1 container-95 py-16 max-w-xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-display font-bold text-gold mb-3">Get In Touch</h1>
          <p className="text-sm text-muted-foreground">
            Having trouble with a Mobile Money voucher, or getting a 'playback interrupted' message? Shoot us a message directly.
          </p>
        </div>

        {status === "success" ? (
          <div className="bg-card border border-gold/40 p-6 rounded-xl text-center space-y-3 animate-fade-in">
            <span className="text-2xl">⚡</span>
            <h3 className="text-lg font-bold text-white">Message Sent Successfully!</h3>
            <p className="text-xs text-muted-foreground">We have received your support log. Our engineering crew will review it shortly.</p>
            <button 
              onClick={() => setStatus("idle")} 
              className="mt-2 text-xs text-gold border border-gold/20 px-3 py-1.5 rounded hover:bg-gold/10 transition"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-card/40 border border-border/40 p-6 rounded-xl space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-background border border-border/60 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-gold transition"
                placeholder="e.g. Julius"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-background border border-border/60 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-gold transition"
                placeholder="name@example.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reason for Support</label>
              <select
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full bg-background border border-border/60 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-gold transition appearance-none"
              >
                <option value="billing">Mobile Money / Subscription Upgrade</option>
                <option value="playback">Video Playback Error</option>
                <option value="account">Account Access / Supabase Login</option>
                <option value="other">General Inquiry</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Message Description</label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-background border border-border/60 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-gold transition resize-none"
                placeholder="Describe your issue detailedly..."
              />
            </div>

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full bg-gradient-gold text-background font-bold text-sm py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50 tracking-wide uppercase"
            >
              {status === "sending" ? "Dispatching Signal..." : "Send Message"}
            </button>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}