
export async function verifyRecaptcha(token, remoteIp) {
  const secret = process.env.RECAPTCHA_SECRET;
  const verifyUrl = process.env.RECAPTCHA_VERIFY_URL 
  if (!secret) return { ok: false, reason: "missing-secret" };

  const params = new URLSearchParams();
  params.set("secret", secret);
  params.set("response", token || "");
  if (remoteIp) params.set("remoteip", remoteIp);

  try {
    if (typeof fetch === "function") {
      const res = await fetch(verifyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params,
      });
      const data = await res.json();
      return { ok: !!data.success, data };
    }
    // Fallback to https if fetch is not available
    const https = await import("node:https");
    const data = await new Promise((resolve, reject) => {
      const req2 = https.request(
        new URL(verifyUrl),
        { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" } },
        (resp) => {
          let raw = "";
          resp.on("data", (c) => (raw += c));
          resp.on("end", () => {
            try { resolve(JSON.parse(raw)); } catch (e) { reject(e); }
          });
        }
      );
      req2.on("error", reject);
      req2.write(params.toString());
      req2.end();
    });
    return { ok: !!data.success, data };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

