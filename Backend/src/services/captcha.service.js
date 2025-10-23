
const DEFAULT_TIMEOUT_MS = Number(process.env.RECAPTCHA_TIMEOUT_MS || 8000);


const safeJson = async (res) => {
  try {
    return await res.json();
  } catch {
    return {};
  }
};

export async function verifyRecaptcha(token, remoteIp) {
  const secret = process.env.RECAPTCHA_SECRET;
  const verifyUrl = process.env.RECAPTCHA_VERIFY_URL 
  if (!secret) return { ok: false, reason: "missing-secret" };

  const params = new URLSearchParams();
  params.set("secret", secret);
  params.set("response", token || "");
  if (remoteIp) params.set("remoteip", remoteIp);
  const body = params.toString();

  try {
    if (typeof fetch === "function") {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
      try {
        const res = await fetch(verifyUrl, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        const data = await safeJson(res);
        return { ok: !!data.success, data };
      } catch (error) {
        clearTimeout(timeoutId);
        if (error?.name === "AbortError") {
          return { ok: false, reason: "timeout", error: "recaptcha-timeout" };
        }
        return { ok: false, error: String(error) };
      }
    }

    const https = await import("node:https");
    const data = await new Promise((resolve, reject) => {
      const req2 = https.request(
        new URL(verifyUrl),
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          timeout: DEFAULT_TIMEOUT_MS,
        },
        (resp) => {
          let raw = "";
          resp.on("data", (chunk) => (raw += chunk));
          resp.on("end", () => {
            try {
              resolve(JSON.parse(raw));
            } catch (e) {
              reject(e);
            }
          });
        }
      );
      req2.on("timeout", () => {
        req2.destroy(new Error("recaptcha-timeout"));
      });
      req2.on("error", reject);
      req2.write(body);
      req2.end();
    });
    return { ok: !!data.success, data };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
