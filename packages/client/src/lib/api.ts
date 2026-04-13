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

export const apiFetch = async <T>(input: string, init?: RequestInit) => {
  const response = await fetch(input, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
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
