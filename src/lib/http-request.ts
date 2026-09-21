import { resolveSecrets } from '@/features/secrets/resolve-secrets';

export type HttpRequestConfig = {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: string;
};

export class HttpRequestError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'HttpRequestError';
  }
}

/** 사용자가 입력한 주소를 검사한다. 비밀 값이 그대로 나가지 않도록 https를 기본으로 한다. */
export function checkUrl(url: string): { ok: boolean; warning?: string; reason?: string } {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { ok: false, reason: '주소 형식이 올바르지 않습니다.' };
  }

  if (parsed.protocol === 'https:') return { ok: true };
  if (parsed.protocol === 'http:') {
    return {
      ok: true,
      warning: 'http 주소는 통신 내용이 보호되지 않습니다. 가능하면 https를 쓰세요.',
    };
  }
  return { ok: false, reason: 'http 또는 https 주소만 사용할 수 있습니다.' };
}

/**
 * 설정의 {{secret:NAME}}을 요청 직전에만 치환해 호출한다.
 * 실패 메시지에는 헤더·본문을 넣지 않는다(비밀 값 노출 방지).
 */
export async function sendRequest(config: HttpRequestConfig): Promise<Response> {
  const check = checkUrl(config.url);
  if (!check.ok) throw new HttpRequestError(check.reason ?? '주소를 확인하세요.');

  const resolved = await resolveSecrets(config);
  const method = resolved.method ?? 'GET';
  const hasBody = method !== 'GET' && resolved.body !== undefined && resolved.body !== '';

  try {
    return await fetch(resolved.url, {
      method,
      headers: hasBody
        ? { 'Content-Type': 'application/json', ...resolved.headers }
        : resolved.headers,
      body: hasBody ? resolved.body : undefined,
    });
  } catch {
    throw new HttpRequestError('요청을 보내지 못했습니다. 네트워크와 주소를 확인하세요.');
  }
}

export async function requestJson(config: HttpRequestConfig): Promise<unknown> {
  const response = await sendRequest(config);

  if (!response.ok) {
    throw new HttpRequestError(`요청이 실패했습니다 (HTTP ${response.status})`, response.status);
  }

  try {
    return await response.json();
  } catch {
    throw new HttpRequestError('응답을 JSON으로 읽지 못했습니다.', response.status);
  }
}

/**
 * 전송 전용. 응답 본문은 돌려주지 않는다.
 * 일부 서버가 요청 헤더를 그대로 되돌려 주므로(예: httpbin) 본문을 화면에 노출하지 않는다.
 */
export async function runAction(config: HttpRequestConfig): Promise<{ status: number }> {
  const response = await sendRequest(config);

  if (!response.ok) {
    throw new HttpRequestError(`요청이 실패했습니다 (HTTP ${response.status})`, response.status);
  }

  return { status: response.status };
}
