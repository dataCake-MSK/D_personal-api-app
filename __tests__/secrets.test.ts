import * as SecureStore from 'expo-secure-store';

import {
  findSecretReferences,
  MissingSecretError,
  resolveSecrets,
} from '@/features/secrets/resolve-secrets';
import {
  deleteSecret,
  getSecret,
  InvalidSecretNameError,
  listSecretNames,
  setSecret,
} from '@/features/secrets/secret-store';

beforeEach(() => {
  (SecureStore as unknown as { __store: Map<string, string> }).__store.clear();
});

describe('비밀 값 저장소', () => {
  it('저장하면 이름만 목록에 남고 값은 보안 저장소에서 읽는다', async () => {
    await setSecret('WEATHER_KEY', 'super-secret-value');

    expect(await listSecretNames()).toEqual(['WEATHER_KEY']);
    expect(await getSecret('WEATHER_KEY')).toBe('super-secret-value');
  });

  it('목록에는 값이 들어가지 않는다', async () => {
    await setSecret('WEATHER_KEY', 'super-secret-value');

    expect(JSON.stringify(await listSecretNames())).not.toContain('super-secret-value');
  });

  it('삭제하면 목록과 값이 함께 사라진다', async () => {
    await setSecret('A', '1');
    await setSecret('B', '2');

    await deleteSecret('A');

    expect(await listSecretNames()).toEqual(['B']);
    expect(await getSecret('A')).toBeNull();
  });

  it('쓸 수 없는 이름은 거부한다', async () => {
    await expect(setSecret('비밀 키!', 'x')).rejects.toBeInstanceOf(InvalidSecretNameError);
  });
});

describe('비밀 값 치환', () => {
  const lookup = async (name: string) => (name === 'TOKEN' ? 'abc123' : null);

  it('중첩된 설정에서 참조를 찾는다', () => {
    const config = {
      url: 'https://example.com',
      headers: { Authorization: 'Bearer {{secret:TOKEN}}' },
      list: ['{{secret:OTHER}}'],
    };

    expect(findSecretReferences(config).sort()).toEqual(['OTHER', 'TOKEN']);
  });

  it('문자열 안의 참조를 실제 값으로 바꾼다', async () => {
    const resolved = await resolveSecrets(
      { headers: { Authorization: 'Bearer {{secret:TOKEN}}' } },
      lookup,
    );

    expect(resolved.headers.Authorization).toBe('Bearer abc123');
  });

  it('공백이 있는 표기도 인식한다', async () => {
    expect(await resolveSecrets('{{ secret:TOKEN }}', lookup)).toBe('abc123');
  });

  it('참조가 없으면 원본을 그대로 돌려준다', async () => {
    const config = { url: 'https://example.com' };

    expect(await resolveSecrets(config, lookup)).toBe(config);
  });

  it('저장되지 않은 이름을 참조하면 오류를 낸다', async () => {
    await expect(resolveSecrets('{{secret:UNKNOWN}}', lookup)).rejects.toBeInstanceOf(
      MissingSecretError,
    );
  });

  it('원본 설정은 바뀌지 않는다', async () => {
    const config = { headers: { Authorization: 'Bearer {{secret:TOKEN}}' } };

    await resolveSecrets(config, lookup);

    expect(config.headers.Authorization).toBe('Bearer {{secret:TOKEN}}');
  });
});
