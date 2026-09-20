import * as SecureStore from 'expo-secure-store';

/** SecureStore 키로 쓸 수 있는 문자만 허용한다. */
const NAME_PATTERN = /^[A-Za-z0-9_.-]{1,64}$/;
const VALUE_KEY_PREFIX = 'secret.';
const INDEX_KEY = 'secret.__index';

export class InvalidSecretNameError extends Error {
  constructor(name: string) {
    super(`비밀 값 이름은 영문·숫자·_ . - 만 쓸 수 있습니다: ${name}`);
    this.name = 'InvalidSecretNameError';
  }
}

function assertValidName(name: string) {
  if (!NAME_PATTERN.test(name)) throw new InvalidSecretNameError(name);
}

async function readIndex(): Promise<string[]> {
  const raw = await SecureStore.getItemAsync(INDEX_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((n): n is string => typeof n === 'string') : [];
  } catch {
    return [];
  }
}

async function writeIndex(names: string[]) {
  await SecureStore.setItemAsync(INDEX_KEY, JSON.stringify([...new Set(names)].sort()));
}

/** 저장된 비밀 값의 **이름만** 돌려준다. 값은 포함하지 않는다. */
export async function listSecretNames(): Promise<string[]> {
  return readIndex();
}

export async function setSecret(name: string, value: string): Promise<void> {
  assertValidName(name);
  await SecureStore.setItemAsync(`${VALUE_KEY_PREFIX}${name}`, value);
  await writeIndex([...(await readIndex()), name]);
}

export async function getSecret(name: string): Promise<string | null> {
  assertValidName(name);
  return SecureStore.getItemAsync(`${VALUE_KEY_PREFIX}${name}`);
}

export async function deleteSecret(name: string): Promise<void> {
  assertValidName(name);
  await SecureStore.deleteItemAsync(`${VALUE_KEY_PREFIX}${name}`);
  await writeIndex((await readIndex()).filter((n) => n !== name));
}
