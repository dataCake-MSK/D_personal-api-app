import { fireEvent, render, screen } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';

import { setSecret } from '@/features/secrets/secret-store';
import { useSecretsStore } from '@/features/secrets/secrets-store';
import { HeadersEditor, toHeaderRecord, toHeaderRows } from '@/widgets/common/headers-editor';

function Harness({ initial }: { initial?: Record<string, string> }) {
  const [headers, setHeaders] = useState<Record<string, string> | undefined>(initial);
  return <HeadersEditor headers={headers} onChange={setHeaders} />;
}

beforeEach(() => {
  (SecureStore as unknown as { __store: Map<string, string> }).__store.clear();
  useSecretsStore.setState({ names: [] });
});

describe('헤더 변환', () => {
  it('저장 형태와 편집 형태를 오간다', () => {
    const record = { Authorization: 'Bearer x', Accept: 'application/json' };

    expect(toHeaderRows(record)).toEqual([
      { name: 'Authorization', value: 'Bearer x' },
      { name: 'Accept', value: 'application/json' },
    ]);
    expect(toHeaderRecord(toHeaderRows(record))).toEqual(record);
  });

  it('이름이 빈 줄은 저장하지 않는다', () => {
    expect(
      toHeaderRecord([
        { name: '  ', value: 'x' },
        { name: 'A', value: '1' },
      ]),
    ).toEqual({
      A: '1',
    });
  });
});

describe('<HeadersEditor />', () => {
  it('헤더를 추가하고 값을 입력하면 설정에 반영된다', async () => {
    await render(<Harness />);

    await fireEvent.press(screen.getByText('+ 헤더 추가'));
    await fireEvent.changeText(
      screen.getByPlaceholderText('값 (예: Bearer {{secret:MY_TOKEN}})'),
      'Bearer {{secret:MY_TOKEN}}',
    );

    expect(screen.getByPlaceholderText('이름 (예: Authorization)').props.value).toBe(
      'Authorization',
    );
    expect(screen.getByPlaceholderText('값 (예: Bearer {{secret:MY_TOKEN}})').props.value).toBe(
      'Bearer {{secret:MY_TOKEN}}',
    );
  });

  it('기존 헤더를 불러와 보여준다', async () => {
    await render(<Harness initial={{ Accept: 'application/json' }} />);

    expect(screen.getByPlaceholderText('이름 (예: Authorization)').props.value).toBe('Accept');
    expect(screen.getByPlaceholderText('값 (예: Bearer {{secret:MY_TOKEN}})').props.value).toBe(
      'application/json',
    );
  });

  it('이름을 비워도 줄이 사라지지 않는다', async () => {
    await render(<Harness initial={{ Accept: 'application/json' }} />);

    await fireEvent.changeText(screen.getByPlaceholderText('이름 (예: Authorization)'), '');

    expect(screen.getByPlaceholderText('이름 (예: Authorization)')).toBeTruthy();
  });

  it('헤더를 삭제한다', async () => {
    await render(<Harness initial={{ Accept: 'application/json' }} />);

    await fireEvent.press(screen.getByText('헤더 삭제'));

    expect(screen.queryByPlaceholderText('이름 (예: Authorization)')).toBeNull();
  });

  it('저장된 키를 고르면 값에 참조가 들어간다', async () => {
    await setSecret('MY_TOKEN', 'real-value');
    await useSecretsStore.getState().refresh();

    await render(<Harness initial={{ Authorization: 'Bearer ' }} />);

    await fireEvent.press(await screen.findByText('MY_TOKEN'));

    const valueInput = screen.getByPlaceholderText('값 (예: Bearer {{secret:MY_TOKEN}})');
    expect(valueInput.props.value).toBe('Bearer {{secret:MY_TOKEN}}');
    // 실제 키 값은 설정에 들어가지 않는다
    expect(valueInput.props.value).not.toContain('real-value');
  });

  it('저장된 키가 없으면 안내를 보여준다', async () => {
    await render(<Harness />);

    expect(screen.getByText(/API 키 관리 화면에 키를 저장하면/)).toBeTruthy();
  });
});
