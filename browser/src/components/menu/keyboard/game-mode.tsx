import { Switch } from 'antd';
import { useAtom } from 'jotai';
import { Gamepad2Icon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { isGameModeAtom } from '@/jotai/keyboard.ts';
import * as storage from '@/libs/storage';

export const GameMode = () => {
  const { t } = useTranslation();
  const [isGameModeEnabled, setIsGameModeEnabled] = useAtom(isGameModeAtom);

  function update(checked: boolean) {
    setIsGameModeEnabled(checked);
    storage.setKeyboardGameMode(checked ? 'enable' : 'disable');
  }

  return (
    <div
      className="flex h-[30px] cursor-pointer items-center justify-between space-x-3 rounded px-3 text-neutral-300 hover:bg-neutral-700/50"
      onClick={() => update(!isGameModeEnabled)}
    >
      <div className="flex items-center space-x-1">
        <Gamepad2Icon size={18} />
        <span>{t('keyboard.gameMode')}</span>
      </div>

      <Switch
        checked={isGameModeEnabled}
        onChange={(checked, event) => {
          event?.stopPropagation();
          update(checked);
        }}
        size="small"
      />
    </div>
  );
};
