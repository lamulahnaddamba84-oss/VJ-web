import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/seed-admin")({
  server: {
    handlers: {
      GET: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const email = "shadix@gmail.com";
        const password = "Shadix@123";

        const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
        if (listErr) return new Response(JSON.stringify({ error: listErr.message }), { status: 500 });
        const existing = list?.users.find((u) => u.email?.toLowerCase() === email);

        let userId: string;
        if (existing) {
          userId = existing.id;
          await supabaseAdmin.auth.admin.updateUserById(userId, { password, email_confirm: true });
        } else {
          const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email, password, email_confirm: true, user_metadata: { full_name: "Shadix Admin" },
          });
          if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
          userId = data.user!.id;
        }

        await supabaseAdmin.from("profiles").upsert({ id: userId, full_name: "Shadix Admin" });
        await supabaseAdmin.from("user_roles").upsert(
          { user_id: userId, role: "admin" },
          { onConflict: "user_id,role" },
        );
        return new Response(JSON.stringify({ ok: true, userId }), { headers: { "content-type": "application/json" } });
      },
    },
  },
});
