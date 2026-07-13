import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

// 1. DYNAMIC FAQ DATA CATEGORIES
const FAQ_DATA = [
  {
    category: "🍿 General Questions",
    items: [
      {
        q: "What is VJ STREAM UG?",
        a: "VJ STREAM UG is a premium digital video streaming platform built specifically for the Ugandan audience. We offer high-definition international blockbuster movies and series complete with local Luganda translated audio commentaries voiced by your favorite Video Jokers (VJs)."
      },
      {
        q: "Do I need to pay to browse the catalog?",
        a: "No! Browsing our home page carousel, checking the Top 10 Trending titles, sorting categories, and watching promotional trailers is 100% free. You only need an active account and subscription tier to unlock full movie streams and offline downloads."
      }
    ]
  },
  {
    category: "💳 Subscriptions & Payments",
    items: [
      {
        q: "What are the available streaming packages?",
        a: "We provide flexible access rates tailored to your watching habits: Daily Pass (UGX 2,000 for 24 hours), Weekly Pass (UGX 5,000 for 7 days), Monthly Premium (UGX 15,000 for 30 days), and the Yearly Unlimited (UGX 120,000 for 365 days)."
      },
      {
        q: "How do I pay using Mobile Money?",
        a: "When you choose a package, click 'Subscribe Now'. Our integrated payment terminal prompts you to securely authorize the transaction directly on your phone network (MTN MoMo or Airtel Money). Your streaming access unlocks automatically the second the token transaction confirms."
      },
      {
        q: "Can I download movies to watch offline?",
        a: "Yes! Offline downloading to local device storage is supported exclusively on our Monthly Premium and Yearly Unlimited subscription packages."
      }
    ]
  },
  {
    category: "🛠️ Technical Help & Errors",
    items: [
      {
        q: "The video player displays 'Playback Interrupted'. How do I fix it?",
        a: "This error occurs if your local internet connection drops unexpectedly or if you logged into your account from a different browser. Simply refresh the page to establish a new secure session token with our Supabase database layer."
      },
      {
        q: "How does the platform secure my login details?",
        a: "We utilize encrypted Supabase Authentication standards. Whether you connect via regular email or a social network link, your private passwords are kept fully isolated and are never visible to platform administrators."
      }
    ]
  }
];

// 2. ROUTE REGISTRATION FOR TANSTACK ROUTER
export const Route = createFileRoute("/FAQs")({
  head: () => ({
    meta: [
      { title: "Frequently Asked Questions — VJ STREAM UG" },
      { name: "description", content: "Find answers regarding packages, Mobile Money activation, and player troubleshooting." },
    ],
  }),
  component: FAQComponent,
});

// 3. MAIN COMPONENT WITH ACCORDION INTERACTIVITY
function FAQComponent() {
  // Using an object state to track which question items are open/toggled
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Universal Website Navbar */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 container-95 py-16 max-w-3xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-gold mb-3">
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Got questions about packages, local mobile money billing, or playback? We have laid out all the configurations below.
          </p>
        </div>

        {/* Map through FAQ categories */}
        <div className="space-y-10">
          {FAQ_DATA.map((cat, catIdx) => (
            <div key={catIdx} className="space-y-4">
              <h2 className="text-lg font-bold text-gold/90 uppercase tracking-wider border-b border-border/20 pb-2">
                {cat.category}
              </h2>

              <div className="space-y-3">
                {cat.items.map((item, itemIdx) => {
                  const itemKey = `${catIdx}-${itemIdx}`;
                  const isOpen = !!openItems[itemKey];

                  return (
                    <div 
                      key={itemIdx} 
                      className="bg-card/40 border border-border/40 rounded-lg overflow-hidden transition-all duration-200"
                    >
                      {/* Accordion Toggle Header */}
                      <button
                        onClick={() => toggleItem(itemKey)}
                        className="w-full text-left p-4 flex justify-between items-center hover:bg-card/80 transition"
                      >
                        <span className="font-medium text-sm text-white pr-4">
                          {item.q}
                        </span>
                        <span className={`text-gold font-mono text-lg transform transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`}>
                          +
                        </span>
                      </button>

                      {/* Accordion Collapsible Content */}
                      <div 
                        className={`transition-all duration-200 ease-in-out ${
                          isOpen ? "max-h-40 opacity-100 border-t border-border/20 p-4" : "max-h-0 opacity-0"
                        } overflow-hidden`}
                      >
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {item.a}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Universal Website Footer */}
      <Footer />
    </div>
  );
}