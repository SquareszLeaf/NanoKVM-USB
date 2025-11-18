import { useEffect, useRef } from 'react';
import { useAtomValue } from 'jotai';

import { isGameModeAtom } from '@/jotai/keyboard.ts';
import { device } from '@/libs/device';
import { Modifiers } from '@/libs/device/keyboard.ts';
import { KeyboardCodes } from '@/libs/keyboard';

export const Keyboard = () => {
  const controlKeys = new Set(['Control', 'Shift', 'Alt', 'AltGraph', 'Meta']);

  const isGameModeEnabled = useAtomValue(isGameModeAtom);

  const lastKeyRef = useRef<KeyboardEvent>();
  const pressedKeysRef = useRef<Set<string>>(new Set());
  const activeKeysRef = useRef<string[]>([]);
  const altGraphActiveRef = useRef(false);
  const isGameModeRef = useRef(isGameModeEnabled);

  // listen keyboard events
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      resetGameModeState();
      void sendKeyUp();
    };
  }, []);

  useEffect(() => {
    function handleWindowBlur() {
      if (
        activeKeysRef.current.length === 0 &&
        pressedKeysRef.current.size === 0 &&
        !altGraphActiveRef.current
      ) {
        return;
      }

      resetGameModeState();
      void sendKeyUp();
    }

    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, []);

  useEffect(() => {
    isGameModeRef.current = isGameModeEnabled;

    if (
      activeKeysRef.current.length === 0 &&
      pressedKeysRef.current.size === 0 &&
      !altGraphActiveRef.current
    ) {
      return;
    }

    resetGameModeState();
    void sendKeyUp();
  }, [isGameModeEnabled]);

  // press button
  async function handleKeyDown(event: KeyboardEvent) {
    event.preventDefault();
    event.stopPropagation();

    lastKeyRef.current = event;

    if (controlKeys.has(event.key)) {
      pressedKeysRef.current.add(event.code);
      if (event.key === 'AltGraph' || event.code === 'AltRight') {
        altGraphActiveRef.current = event.getModifierState('AltGraph');
      }

      if (isGameModeEnabled) {
        await sendGameModeReport();
      }
      return;
    }

    if (isGameModeRef.current) {
      if (event.repeat && activeKeysRef.current.includes(event.code)) {
        return;
      }

      if (!KeyboardCodes.has(event.code)) {
        return;
      }

      if (!activeKeysRef.current.includes(event.code)) {
        activeKeysRef.current.push(event.code);
      }

      await sendGameModeReport();
      return;
    }

    await sendKeyDown(event);
  }

  // release button
  async function handleKeyUp(event: KeyboardEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (controlKeys.has(event.key)) {
      pressedKeysRef.current.delete(event.code);
      if (event.key === 'AltGraph' || event.code === 'AltRight') {
        altGraphActiveRef.current = false;
      }

      if (isGameModeRef.current) {
        await sendGameModeReport();
        return;
      }

      if (lastKeyRef.current?.code === event.code) {
        await sendKeyDown(lastKeyRef.current);
        lastKeyRef.current = undefined;
      }

      await sendKeyUp();
      return;
    }

    if (isGameModeRef.current) {
      const index = activeKeysRef.current.indexOf(event.code);
      if (index !== -1) {
        activeKeysRef.current.splice(index, 1);
      }
      await sendGameModeReport();
      return;
    }

    await sendKeyUp();
  }

  async function sendKeyDown(event: KeyboardEvent) {
    const code = KeyboardCodes.get(event.code);
    if (!code) return;

    const ctrl = getCtrl(event);
    const keys = [0x00, 0x00, code, 0x00, 0x00, 0x00];

    await device.sendKeyboardData(ctrl, keys);
  }

  async function sendGameModeReport() {
    const modifiers = getGameModeModifiers();
    const keys = buildGameModeKeys();
    await device.sendKeyboardData(modifiers, keys);
  }

  function buildGameModeKeys() {
    const keys = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
    let index = 0;

    for (const keyCode of activeKeysRef.current) {
      if (index >= keys.length) {
        break;
      }

      const hidCode = KeyboardCodes.get(keyCode);
      if (!hidCode) {
        continue;
      }

      keys[index] = hidCode;
      index += 1;
    }

    return keys;
  }

  function getGameModeModifiers() {
    const modifiers = new Modifiers();

    modifiers.leftCtrl = pressedKeysRef.current.has('ControlLeft') || altGraphActiveRef.current;
    modifiers.rightCtrl = pressedKeysRef.current.has('ControlRight');
    modifiers.leftShift = pressedKeysRef.current.has('ShiftLeft');
    modifiers.rightShift = pressedKeysRef.current.has('ShiftRight');
    modifiers.leftAlt = pressedKeysRef.current.has('AltLeft');
    modifiers.rightAlt = pressedKeysRef.current.has('AltRight');
    modifiers.leftWindows = pressedKeysRef.current.has('MetaLeft');
    modifiers.rightWindows = pressedKeysRef.current.has('MetaRight');

    if (altGraphActiveRef.current) {
      modifiers.leftCtrl = true;
      modifiers.rightAlt = true;
    }

    return modifiers;
  }

  async function sendKeyUp() {
    const modifiers = new Modifiers();
    const keys = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
    await device.sendKeyboardData(modifiers, keys);
  }

  function getCtrl(event: KeyboardEvent) {
    const modifiers = new Modifiers();

    if (event.ctrlKey) {
      modifiers.leftCtrl = pressedKeysRef.current.has('ControlLeft');
      modifiers.rightCtrl = pressedKeysRef.current.has('ControlRight');
    }
    if (event.shiftKey) {
      modifiers.leftShift = pressedKeysRef.current.has('ShiftLeft');
      modifiers.rightShift = pressedKeysRef.current.has('ShiftRight');
    }
    if (event.altKey) {
      modifiers.leftAlt = pressedKeysRef.current.has('AltLeft');
      modifiers.rightAlt = pressedKeysRef.current.has('AltRight');
    }
    if (event.metaKey) {
      modifiers.leftWindows = pressedKeysRef.current.has('MetaLeft');
      modifiers.rightWindows = pressedKeysRef.current.has('MetaRight');
    }
    if (event.getModifierState('AltGraph')) {
      modifiers.leftCtrl = true;
      modifiers.rightAlt = true;
    }

    return modifiers;
  }

  function resetGameModeState() {
    activeKeysRef.current = [];
    pressedKeysRef.current.clear();
    altGraphActiveRef.current = false;
    lastKeyRef.current = undefined;
  }

  return <></>;
};
