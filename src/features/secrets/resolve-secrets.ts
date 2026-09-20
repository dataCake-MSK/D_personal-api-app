import { getSecret } from './secret-store';

/** 위젯 설정에서 비밀 값을 참조하는 형식: {{secret:NAME}} */
const SECRET_REFERENCE = /\{\{\s*secret:([A-Za-z0-9_.-]{1,64})\s*\}\}/g;

export class MissingSecretError extends Error {
  constructor(public readonly secretName: string) {
    super(`저장된 비밀 값이 없습니다: ${secretName}`);
    this.name = 'MissingSecretError';
  }
}

export function findSecretReferences(value: unknown): string[] {
  const found = new Set<string>();

  const walk = (node: unknown) => {
    if (typeof node === 'string') {
      for (const match of node.matchAll(SECRET_REFERENCE)) found.add(match[1]);
      return;
    }
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (node && typeof node === 'object') {
      Object.values(node).forEach(walk);
    }
  };

  walk(value);
  return [...found];
}

/**
 * 설정 안의 {{secret:NAME}}을 실제 값으로 바꾼다.
 * 반환값에는 실제 비밀 값이 들어가므로 화면 표시·로그·영구 저장에 쓰지 않는다.
 */
export async function resolveSecrets<T>(
  value: T,
  lookup: (name: string) => Promise<string | null> = getSecret,
): Promise<T> {
  const names = findSecretReferences(value);
  if (names.length === 0) return value;

  const entries = await Promise.all(
    names.map(async (name) => {
      const secret = await lookup(name);
      if (secret === null) throw new MissingSecretError(name);
      return [name, secret] as const;
    }),
  );
  const secrets = new Map(entries);

  const replace = (node: unknown): unknown => {
    if (typeof node === 'string') {
      return node.replace(SECRET_REFERENCE, (_, name: string) => secrets.get(name) ?? '');
    }
    if (Array.isArray(node)) return node.map(replace);
    if (node && typeof node === 'object') {
      return Object.fromEntries(Object.entries(node).map(([key, item]) => [key, replace(item)]));
    }
    return node;
  };

  return replace(value) as T;
}
