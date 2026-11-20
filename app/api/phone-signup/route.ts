import { createClient } from "@supabase/supabase-js";
import { phoneEmail, readId } from "@/lib/loginId";

// A phone account is an email account with a hidden address, <digits>@ourcml.com (lib/loginId.ts).
// The project asks new email accounts to confirm by email, and these addresses have no inbox,
// so the account is created here, already confirmed, with the service role key. No email is sent.
export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return Response.json({ error: "not configured" }, { status: 503 });

  const body = (await request.json().catch(() => null)) as { phone?: unknown; password?: unknown } | null;
  const id = typeof body?.phone === "string" ? readId(body.phone) : null;
  const password = typeof body?.password === "string" ? body.password : "";
  if (!id || !("phone" in id)) return Response.json({ error: "bad phone" }, { status: 400 });
  if (password.length < 8 || password.length > 72) return Response.json({ error: "bad password" }, { status: 400 });

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
  // At most 5 sign-ups per IP address per hour (009_signup_limit.sql): admin calls skip Supabase's own limits.
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || request.headers.get("x-real-ip") || "unknown";
  const { data: allowed, error: limitError } = await admin.rpc("signup_allowed", { p_ip: ip });
  if (limitError) return Response.json({ error: "try again later" }, { status: 503 });
  if (!allowed) return Response.json({ error: "too many sign-ups, try again in an hour" }, { status: 429 });

  const { error } = await admin.auth.admin.createUser({
    email: phoneEmail(id.phone),
    password,
    email_confirm: true,
    user_metadata: { phone: id.phone },
  });
  if (error) {
    const taken = /already|exists|registered/i.test(error.message);
    return Response.json({ error: taken ? "taken" : error.message }, { status: taken ? 409 : 500 });
  }
  return Response.json({ ok: true }, { status: 201 });
}
