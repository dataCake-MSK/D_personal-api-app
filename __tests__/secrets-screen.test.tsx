import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';

import SecretsScreen from '@/app/secrets';
import { getSecret } from '@/features/secrets/secret-store';

beforeEach(() => {
  (SecureStore as unknown as { __store: Map<string, string> }).__store.clear();
});

async function saveSecret(name: string, value: string) {
  await fireEvent.changeText(screen.getByPlaceholderText('예: WEATHER_API_KEY'), name);
  await fireEvent.changeText(screen.getByPlaceholderText('여기에 붙여넣기'), value);
  await fireEvent.press(screen.getByText('저장'));
}

describe('<SecretsScreen />', () => {
  it('저장된 키가 없으면 안내를 표시한다', async () => {
    await render(<SecretsScreen />);

    expect(await screen.findByText('저장된 키가 없습니다.')).toBeTruthy();
  });

  it('키를 저장하면 이름만 목록에 보이고 값은 화면에 남지 않는다', async () => {
    await render(<SecretsScreen />);

    await saveSecret('WEATHER_KEY', 'super-secret-value');

    expect(await screen.findByText('WEATHER_KEY')).toBeTruthy();
    expect(screen.queryByText('super-secret-value')).toBeNull();
    expect(screen.getByText('••••••••')).toBeTruthy();
    await waitFor(async () => {
      expect(await getSecret('WEATHER_KEY')).toBe('super-secret-value');
    });
  });

  it('쓸 수 없는 이름은 저장하지 않고 이유를 알려준다', async () => {
    await render(<SecretsScreen />);

    await saveSecret('잘못된 이름!', 'x');

    expect(await screen.findByText(/영문·숫자/)).toBeTruthy();
    expect(screen.getByText('저장된 키가 없습니다.')).toBeTruthy();
  });

  it('키를 삭제하면 목록에서 사라진다', async () => {
    await render(<SecretsScreen />);
    await saveSecret('TOKEN', 'abc');
    expect(await screen.findByText('TOKEN')).toBeTruthy();

    await fireEvent.press(screen.getByText('삭제'));

    expect(await screen.findByText('저장된 키가 없습니다.')).toBeTruthy();
    await waitFor(async () => {
      expect(await getSecret('TOKEN')).toBeNull();
    });
  });
});
