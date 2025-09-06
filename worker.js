export default {
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname !== "/api/roblox-validate") return new Response("not found",{status:404});
    const u = url.searchParams.get("u") || "";
    if (!/^[a-zA-Z][a-zA-Z0-9_]{2,19}$/.test(u)) {
      // roblox rules (approx): 3–20 chars, start with letter
      return new Response(JSON.stringify({nameAvailable:false, reason:"invalid_format"}), {
        headers:{ "content-type":"application/json" }
      });
    }
    const upstream = `https://auth.roblox.com/v1/usernames/validate?request.username=${encodeURIComponent(u)}&request.birthday=2000-01-01&request.context=Signup`;
    const r = await fetch(upstream, { headers:{ "accept":"application/json" }});
    const data = await r.json();
    // normalize a bit: some responses return {code,message}, some {message,name,code}. we expose nameAvailable
    const nameAvailable = data?.message === "Username is valid" || data?.code === 0 || data?.name === "UsernameIsValid";
    return new Response(JSON.stringify({ nameAvailable, raw:data }), {
      headers:{ "content-type":"application/json", "cache-control":"no-store" }
    });
  }
};
