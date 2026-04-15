export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

let csrfTokenPromise: Promise<string> | null = null;

const isMutationMethod = (method?: string) => {
  const normalizedMethod = method?.toUpperCase() ?? 'GET';
  return !['GET', 'HEAD', 'OPTIONS'].includes(normalizedMethod);
};

const getCsrfToken = async () => {
  if (!csrfTokenPromise) {
    csrfTokenPromise = fetch('/auth/csrf')
      .then(async (response) => {
        const payload = (await response.json()) as {
          data: { csrfToken: string } | null;
          error: null | { code: string; message: string };
        };

        if (!response.ok || !payload.data?.csrfToken) {
          throw new ApiError(
            payload.error?.message ?? 'Failed to fetch CSRF token.',
            response.status,
            payload.error?.code,
          );
        }

        return payload.data.csrfToken;
      })
      .catch((error) => {
        csrfTokenPromise = null;
        throw error;
      });
  }

  return csrfTokenPromise;
};

export const apiFetch = async <T>(input: string, init?: RequestInit) => {
  const headers = new Headers(init?.headers ?? {});

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (isMutationMethod(init?.method)) {
    headers.set('x-csrf-token', await getCsrfToken());
  }

  const response = await fetch(input, {
    ...init,
    headers,
  });

  const payload = (await response.json()) as {
    data: T | null;
    error: null | { code: string; message: string };
  };

  if (!response.ok || payload.error) {
    throw new ApiError(
      payload.error?.message ?? 'Request failed.',
      response.status,
      payload.error?.code,
    );
  }

  return payload.data as T;
};
