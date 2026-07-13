This is a big batch — here's how I'll tackle it. Approve and I'll build it in one go.

## 1. Wider responsive layout (95% width)
- Replace `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` used across every page (Home, Movies, Series, Shorts, Live, Trending, Categories, Pricing, Dashboard, Admin, My List, Watch, Auth) with a shared `w-[95%] max-w-[1800px] mx-auto` container.
- Add a `.container-95` utility in `src/styles.css` so one class change updates the whole site.
- Keep gutters tight on mobile (95% still leaves 2.5% each side) and cap on huge monitors so lines don't get unreadable.

## 2. SEO pass
- Fill in `head()` on every route that's currently missing per-page `title` / `description` / `og:title` / `og:description` / `og:type` / `og:url` / canonical (Movies list, Series, Shorts, Live, Trending, Categories, My List, Auth, Watch, movie detail using loader data).
- Add JSON-LD: `Organization` in `__root.tsx`, `Movie` schema on movie detail, `BreadcrumbList` on deep routes.
- Update `public/robots.txt` and `src/routes/sitemap[.]xml.ts` to include all public routes.
- Trigger an SEO scan at the end.

## 3. Faster movie uploads
- Switch `UploadField` from single-shot upload to a resumable/parallel upload:
  - Files ≤ 6 MB → direct upload (current path, but with concurrency + no fake progress timer).
  - Files > 6 MB (videos/trailers) → chunked upload via `supabase.storage.uploadToSignedUrl` with 6 MB parts and 4-way parallelism, so a 500 MB movie uploads in parallel streams instead of one slow POST.
- Real byte-level progress from `XMLHttpRequest` for chunks (replaces the fake timer).
- Long cache headers already set; add `contentType` sniffing and immediate signed-URL minting once the last chunk lands.
- Admin form: allow the poster + trailer + video to upload in parallel (they currently block each other in the UI). Save the movie row the moment the poster is ready and patch video URLs in as they finish so the movie appears in the catalog almost immediately.

## 4. Sidebar dashboards (Admin + User) with payments inside
- New `AppSidebar` using the shadcn Sidebar component with `collapsible="icon"` and a persistent trigger in a slim top bar.
- **User dashboard sidebar** (`/dashboard`): Overview, Continue Watching, My Favorites, Watch History, Downloads, **Subscription & Payment** (in-sidebar page, not a link to `/pricing`), Profile Settings, Sign Out.
- **Admin sidebar** (`/admin`): Dashboard, Movies, Series, Shorts, Live Streams, Categories, Users, Subscriptions, Analytics, Settings.
- Both dashboards become layout routes (`_authenticated/dashboard.tsx` → `_authenticated/dashboard/route.tsx` with child sections). Keeps deep-linking (`/dashboard/payments`, `/admin/movies`) and lets each section have its own SEO head.
- The main Navbar hides on dashboard routes (sidebar replaces it) so nothing competes for space.

## 5. In-dashboard payment flow (users only)
- New `/dashboard/payments` section renders the 4 plans inline (Daily / Weekly / Monthly / Yearly) plus current-subscription status.
- "Subscribe" opens a payment modal with method picker: **MTN MoMo**, **Airtel Money**, **Card (Visa/Mastercard)**, **PayPal**.
- For now the modal collects phone / card details in a proper form and calls a `createPayment` server function that records the pending subscription; each provider gets a clearly-labelled stub handler ready for real keys. When the user later provides Flutterwave / Pesapal / Stripe keys I'll wire the real charge — no code rewrite needed.
- Non-admin users only — admin sidebar shows subscription analytics, not a checkout.

## 6. UI/UX polish
- Consistent card radius, spacing scale, and gold accent on active sidebar item.
- Loading skeletons on dashboard sections instead of blank space.
- Mobile: sidebar becomes an off-canvas drawer with a hamburger; content still hits 95% width.

## Technical notes
- Sidebar: `@/components/ui/sidebar` (shadcn) wrapped in a `DashboardLayout` under `_authenticated/`. Uses TanStack `Link` + `useRouterState` for active highlighting.
- Uploads: new helper `src/lib/chunkedUpload.ts` handling signed multipart. Bucket stays private; final signed URL TTL unchanged (10 years).
- Payments: `src/lib/payments.functions.ts` with `createServerFn` + `requireSupabaseAuth`; inserts into `subscriptions` table (already exists). No schema changes needed for the stubs; I'll add a `payment_status` + `provider_ref` column via migration so real webhooks can update rows later.
- SEO: per-route heads use existing TanStack pattern; canonical uses relative paths (no domain baked in).

## Out of scope for this pass (say the word and I add them)
- Real payment provider integration (needs your Flutterwave / Pesapal / Stripe / PayPal keys).
- Video transcoding / HLS (would need a worker; current MP4 direct-play stays).
- Email receipts after payment.
