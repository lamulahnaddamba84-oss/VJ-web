import { createServerFn } from "@tanstack/react-start";

export const seedAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const email = "shadix@gmail.com";
  const password = "Shadix@123";

  const { data: list } = await supabaseAdmin.auth.admin.listUsers();
  const existing = list?.users.find((u) => u.email?.toLowerCase() === email);

  let userId: string;
  if (existing) {
    userId = existing.id;
    await supabaseAdmin.auth.admin.updateUserById(userId, { password, email_confirm: true });
  } else {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email, password, email_confirm: true, user_metadata: { full_name: "Shadix Admin" },
    });
    if (error) throw error;
    userId = data.user!.id;
  }

  await supabaseAdmin.from("user_roles").upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
  return { ok: true, userId };
});
