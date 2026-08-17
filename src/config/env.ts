const REQUIRED_API_URL_MESSAGE =
  "VITE_API_BASE_URL is missing or invalid. Add a valid HTTP(S) URL to your environment configuration.";

let cachedApiBaseUrl: string | undefined;

export function getApiBaseUrl(): string {
  if (cachedApiBaseUrl) {
    return cachedApiBaseUrl;
  }

  const rawValue = import.meta.env.VITE_API_BASE_URL?.trim();

  if (!rawValue) {
    throw new Error(REQUIRED_API_URL_MESSAGE);
  }

  try {
    const parsedUrl = new URL(rawValue);
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      throw new Error("Unsupported URL protocol");
    }

    const normalizedApiBaseUrl = rawValue.replace(/\/+$/, "");
    cachedApiBaseUrl = normalizedApiBaseUrl;
    return normalizedApiBaseUrl;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(REQUIRED_API_URL_MESSAGE, error);
    }
    throw new Error(REQUIRED_API_URL_MESSAGE, { cause: error });
  }
}
