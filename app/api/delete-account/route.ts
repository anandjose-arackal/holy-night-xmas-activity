import { createClient } from "@supabase/supabase-js";

// Deleting the auth user cascades to children and completions (see 001_init.sql).
// This needs the service role key, so it must run on the server.
// The sign-in is shared with fest_hub: someone with a fest_hub profile keeps their login and loses only their children.
export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const token = request.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!url || !serviceKey) return new Response(null, { status: 503 });
  if (!token) return new Response(null, { status: 401 });

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
  // The id comes from the verified token, never from the request body.
  const { data } = await admin.auth.getUser(token);
  if (!data.user) return new Response(null, { status: 401 });

  // A missing profiles table (no fest_hub in this project) reads as "no profile"; any other error stops here,
  // so a timeout can never delete a fest_hub admin's login.
  const { data: festProfile, error: lookupError } = await admin.from("profiles").select("id").eq("id", data.user.id).maybeSingle();
  if (lookupError && lookupError.code !== "42P01" && lookupError.code !== "PGRST205") return new Response(null, { status: 500 });
  if (festProfile) {
    const { error } = await admin.from("children").delete().eq("guardian_id", data.user.id);
    return new Response(null, { status: error ? 500 : 204 });
  }

  const { error } = await admin.auth.admin.deleteUser(data.user.id);
  return new Response(null, { status: error ? 500 : 204 });
}
