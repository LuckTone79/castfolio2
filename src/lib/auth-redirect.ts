const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function normalizeOrigin(value: string | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.origin;
  } catch {
    return null;
  }
}

export function getAuthOrigin(requestOrigin: string) {
  const configuredOrigin = normalizeOrigin(process.env.NEXT_PUBLIC_APP_URL);
  const requestUrl = new URL(requestOrigin);

  if (configuredOrigin) {
    const requestIsLocal = LOCAL_HOSTS.has(requestUrl.hostname);
    if (!requestIsLocal) return configuredOrigin;
  }

  return requestUrl.origin;
}

export function buildAuthCallbackUrl(requestOrigin: string, nextPath = "/app") {
  const callbackUrl = new URL("/auth/callback", getAuthOrigin(requestOrigin));
  callbackUrl.searchParams.set("next", nextPath);
  return callbackUrl;
}
