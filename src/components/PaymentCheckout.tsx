import { useState } from "react";
import { X, Smartphone, CreditCard, Loader2, Check, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type Plan = { key: string; name: string; price: number; duration: number };

const METHODS = [
  { id: "mtn", label: "MTN Mobile Money", icon: Smartphone, hint: "You'll receive an approval prompt on your MTN line.", input: "phone" as const },
  { id: "airtel", label: "Airtel Money", icon: Smartphone, hint: "You'll receive an approval prompt on your Airtel line.", input: "phone" as const },
  { id: "card", label: "Visa / Mastercard", icon: CreditCard, hint: "Secured by 3D-Secure.", input: "card" as const },
  { id: "paypal", label: "PayPal", icon: Wallet, hint: "You'll be redirected to PayPal to complete the payment.", input: "email" as const },
];

export function PaymentCheckout({ plan, onClose, onSuccess }: { plan: Plan; onClose: () => void; onSuccess: () => void }) {
  const { user } = useAuth();
  const [method, setMethod] = useState<string>("mtn");
  const [phone, setPhone] = useState("");
  const [cardNo, setCardNo] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const chosen = METHODS.find((m) => m.id === method)!;
  const canSubmit =
    (chosen.input === "phone" && phone.replace(/\D/g, "").length >= 9) ||
    (chosen.input === "card" && cardNo.replace(/\s/g, "").length >= 12 && cardExp && cardCvc.length >= 3) ||
    (chosen.input === "email" && /\S+@\S+/.test(email));

  const submit = async () => {
    if (!user) { toast.error("Please sign in"); return; }
    setSubmitting(true);
    try {
      // Stub: record the subscription as active. Real provider hookup goes here
      // (MoMo Collect, Airtel Collections, Flutterwave/Stripe card charge, PayPal orders).
      const ends = new Date(); ends.setDate(ends.getDate() + plan.duration);
      const { error } = await supabase.from("subscriptions").insert({
        user_id: user.id,
        plan: plan.key,
        amount_ugx: plan.price,
        payment_method: chosen.id,
        status: "active",
        ends_at: ends.toISOString(),
      });
      if (error) throw error;
      setDone(true);
      toast.success(`${plan.name} plan activated!`);
      setTimeout(() => { onSuccess(); onClose(); }, 900);
    } catch (e: any) {
      toast.error(e.message ?? "Payment failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-gold/40 bg-card shadow-gold overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <div className="text-xs text-muted-foreground">Subscribe to</div>
            <div className="font-display text-lg font-bold">{plan.name} Plan · <span className="text-gold">UGX {plan.price.toLocaleString()}</span></div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted"><X className="w-4 h-4" /></button>
        </div>

        {done ? (
          <div className="p-8 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-gradient-gold grid place-items-center text-black"><Check className="w-7 h-7" /></div>
            <h3 className="mt-4 font-semibold">Payment confirmed</h3>
            <p className="text-sm text-muted-foreground">Enjoy your streaming.</p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            <div>
              <div className="text-xs font-semibold mb-2 text-muted-foreground">Choose payment method</div>
              <div className="grid grid-cols-2 gap-2">
                {METHODS.map((m) => (
                  <button key={m.id} onClick={() => setMethod(m.id)}
                    className={`flex items-center gap-2 rounded-lg border p-3 text-sm transition ${method === m.id ? "border-gold bg-gold/10 text-gold" : "border-border bg-input/40 hover:border-gold/50"}`}>
                    <m.icon className="w-4 h-4" /> <span className="truncate">{m.label}</span>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">{chosen.hint}</p>
            </div>

            {chosen.input === "phone" && (
              <div>
                <label className="text-xs font-semibold">Phone number</label>
                <input inputMode="tel" placeholder="07XX XXX XXX" value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full px-3 py-2.5 rounded-md bg-input border border-border focus:border-gold outline-none text-sm" />
              </div>
            )}

            {chosen.input === "card" && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold">Card number</label>
                  <input inputMode="numeric" placeholder="4242 4242 4242 4242" value={cardNo}
                    onChange={(e) => setCardNo(e.target.value.replace(/[^\d ]/g, "").slice(0, 19))}
                    className="mt-1 w-full px-3 py-2.5 rounded-md bg-input border border-border focus:border-gold outline-none text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold">Expiry</label>
                    <input placeholder="MM/YY" value={cardExp} onChange={(e) => setCardExp(e.target.value.slice(0, 5))}
                      className="mt-1 w-full px-3 py-2.5 rounded-md bg-input border border-border focus:border-gold outline-none text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold">CVC</label>
                    <input inputMode="numeric" placeholder="123" value={cardCvc} onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      className="mt-1 w-full px-3 py-2.5 rounded-md bg-input border border-border focus:border-gold outline-none text-sm" />
                  </div>
                </div>
              </div>
            )}

            {chosen.input === "email" && (
              <div>
                <label className="text-xs font-semibold">PayPal email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full px-3 py-2.5 rounded-md bg-input border border-border focus:border-gold outline-none text-sm" />
              </div>
            )}

            <button onClick={submit} disabled={!canSubmit || submitting}
              className="w-full py-3 rounded-md bg-gradient-gold text-black font-semibold disabled:opacity-50 flex items-center justify-center gap-2 shadow-gold">
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</> : `Pay UGX ${plan.price.toLocaleString()}`}
            </button>
            <p className="text-[11px] text-center text-muted-foreground">Secured checkout · Cancel anytime</p>
          </div>
        )}
      </div>
    </div>
  );
}
