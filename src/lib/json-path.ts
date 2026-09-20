/**
 * 점 표기 경로로 JSON에서 값을 꺼낸다. 예: `data.items[0].price`
 * 경로가 비어 있으면 원본을 그대로 돌려준다. 값이 없으면 undefined.
 */
export function getByPath(source: unknown, path?: string): unknown {
  if (!path || path.trim() === '') return source;

  return parsePath(path).reduce<unknown>((node, key) => {
    if (node === null || node === undefined) return undefined;
    if (typeof key === 'number') return Array.isArray(node) ? node[key] : undefined;
    if (typeof node !== 'object' || Array.isArray(node)) return undefined;
    return (node as Record<string, unknown>)[key];
  }, source);
}

/** `a.b[0].c` → ['a', 'b', 0, 'c'] */
export function parsePath(path: string): (string | number)[] {
  const keys: (string | number)[] = [];

  for (const segment of path.split('.')) {
    if (segment === '') continue;

    const [name, ...indexes] = segment.split('[');
    if (name) keys.push(name);

    for (const index of indexes) {
      const digits = index.replace(']', '').trim();
      if (digits !== '' && !Number.isNaN(Number(digits))) keys.push(Number(digits));
    }
  }

  return keys;
}
