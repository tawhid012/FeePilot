const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Cursor/TS tooling in this repo doesn't include Deno types by default.
// This keeps editor/linter quiet while the function still runs on Deno.
declare const Deno: any;

const encoder = new TextEncoder();

// Admin credentials (DEV/TEST ONLY). Stored here intentionally so you don't need
// Supabase function secrets for username/password/session signing.
const ADMIN_USERNAME = "admin@feepilot";
const ADMIN_PASSWORD = "limuxagencies";

// Must match the secret used in `admin-dashboard`.
const ADMIN_SESSION_SECRET = "feepilot-admin-session-secret-v1";

function toHex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function signSession(payload: string, secret: string) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return `${payload}.${toHex(signature)}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: `Method ${req.method} not allowed. Use POST.` }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { username, password } = await req.json();

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    const token = await signSession(`admin:${expiresAt}`, ADMIN_SESSION_SECRET);

    return new Response(JSON.stringify({ token }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || "Request failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    const token = await signSession(`admin:${expiresAt}`, ADMIN_SESSION_SECRET);

    return new Response(JSON.stringify({ token }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || "Request failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
