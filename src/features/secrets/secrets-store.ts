import { create } from 'zustand';

import { deleteSecret, listSecretNames, setSecret } from './secret-store';

type SecretsState = {
  /** 이름만 보관한다. 값은 기기 보안 저장소에만 둔다. */
  names: string[];
  refresh: () => Promise<void>;
  save: (name: string, value: string) => Promise<void>;
  remove: (name: string) => Promise<void>;
};

export const useSecretsStore = create<SecretsState>()((set, get) => ({
  names: [],

  refresh: async () => set({ names: await listSecretNames() }),

  save: async (name, value) => {
    await setSecret(name, value);
    await get().refresh();
  },

  remove: async (name) => {
    await deleteSecret(name);
    await get().refresh();
  },
}));
