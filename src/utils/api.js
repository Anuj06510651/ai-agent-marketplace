function trimTrailingSlash(value = '') {
  return value.replace(/\/+$/, '');
}

function normalizePath(path = '') {
  return path.startsWith('/') ? path : `/${path}`;
}

export function getApiBaseUrl() {
  const configuredUrl = trimTrailingSlash(import.meta.env.VITE_API_URL || '');
  if (configuredUrl) {
    return configuredUrl;
  }

  return import.meta.env.DEV ? '' : trimTrailingSlash(window.location.origin);
}

export function buildApiUrl(path) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = normalizePath(path);
  const baseUrl = getApiBaseUrl();

  return baseUrl ? `${baseUrl}${normalizedPath}` : normalizedPath;
}

export async function apiRequest(path, options = {}) {
  const response = await fetch(buildApiUrl(path), options);

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.message || `Request failed with status ${response.status}.`);
  }

  return payload;
}
