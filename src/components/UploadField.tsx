import { useState } from "react";
import { Upload, Link as LinkIcon, Check, Loader2 } from "lucide-react";
import { fastUpload } from "@/lib/fastUpload";
import { toast } from "sonner";

type Props = {
  label: string;
  hint?: string;
  value: string;
  onChange: (url: string) => void;
  accept: string; // e.g. "image/*" or "video/*"
  folder: string; // "posters" | "videos" | "trailers"
};

export function UploadField({ label, hint, value, onChange, accept, folder }: Props) {
  const [uploading, setUploading] = useState(false);
  const [percent, setPercent] = useState(0);
  const [speed, setSpeed] = useState<string>("");

  const handleFile = async (file: File) => {
    if (!file) return;
    setUploading(true);
    setPercent(0);
    setSpeed("");
    const started = Date.now();
    try {
      const ext = file.name.split(".").pop() ?? "bin";
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { signedUrl } = await fastUpload({
        bucket: "media",
        path,
        file,
        onProgress: (p) => {
          setPercent(p.percent);
          const elapsed = (Date.now() - started) / 1000;
          if (elapsed > 0.5) {
            const mbps = (p.loaded / 1024 / 1024) / elapsed;
            setSpeed(`${mbps.toFixed(1)} MB/s`);
          }
        },
      });
      onChange(signedUrl);
      setPercent(100);
      toast.success(`${label} uploaded`);
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setTimeout(() => { setUploading(false); setPercent(0); setSpeed(""); }, 400);
    }
  };

  return (
    <div className="rounded-md border border-border bg-input/40 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-foreground">{label}</label>
        {value && <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400"><Check className="w-3 h-3" /> Ready</span>}
      </div>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <LinkIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="url"
            placeholder="Paste a URL (YouTube, direct link)…"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full pl-7 pr-2 py-2 rounded-md bg-input border border-border focus:border-gold outline-none text-xs"
          />
        </div>
        <label className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold cursor-pointer transition ${uploading ? "bg-muted text-muted-foreground" : "bg-gold/15 text-gold border border-gold/40 hover:bg-gold/25"}`}>
          {uploading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> {percent}%{speed && ` · ${speed}`}</> : <><Upload className="w-3.5 h-3.5" /> Upload from device</>}
          <input type="file" accept={accept} className="hidden" disabled={uploading}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
        </label>
      </div>
      {uploading && (
        <div className="h-1 bg-muted rounded overflow-hidden">
          <div className="h-full bg-gradient-gold transition-all" style={{ width: `${percent}%` }} />
        </div>
      )}
      {value && !value.startsWith("blob:") && (
        <p className="text-[10px] text-muted-foreground truncate">{value}</p>
      )}
    </div>
  );
}
