import { atom } from 'jotai';

import * as storage from '@/libs/storage';

const defaultGameMode =
  typeof window !== 'undefined' ? storage.getKeyboardGameMode() === 'enable' : false;

export const isKeyboardEnableAtom = atom(true);

export const isKeyboardOpenAtom = atom(false);

export const isGameModeAtom = atom(defaultGameMode);
