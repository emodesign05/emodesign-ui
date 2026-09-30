import { HelpCircle, Settings, Info } from 'lucide-react';
import { Tooltip, Popover } from '../components/FloatingTooltipAndPopover';
import { definePlayground } from '../playground/types';

type V = { duration: number; offset: number; popDuration: number; popOffset: number };

export default definePlayground<V>({
  note: 'ボタンにホバーでツールチップ、クリックでポップオーバーが開きます。',
  controls: [
    { key: 'duration', label: 'ツールチップの時間', type: 'range', min: 0.05, max: 1, step: 0.05, default: 0.15, unit: 's' },
    { key: 'offset', label: 'ツールチップの移動量', type: 'range', min: 0, max: 30, step: 1, default: 5, unit: 'px' },
    { key: 'popDuration', label: 'ポップオーバーの時間', type: 'range', min: 0.05, max: 1.2, step: 0.05, default: 0.2, unit: 's' },
    { key: 'popOffset', label: 'ポップオーバーの移動量', type: 'range', min: 0, max: 40, step: 1, default: 8, unit: 'px' },
  ],
  render: (v) => (
    <div className="flex min-h-screen flex-col items-center justify-center gap-16 bg-slate-50 p-6">
      <div className="flex items-center gap-4">
        <Tooltip text="ヘルプ情報を表示中" duration={v.duration} offset={v.offset}>
          <button className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200">
            <HelpCircle className="h-4 w-4" />
            <span>ヘルプ</span>
          </button>
        </Tooltip>
        <Tooltip text="詳細な設定" duration={v.duration} offset={v.offset}>
          <button className="rounded-xl bg-slate-100 p-2 text-slate-700 hover:bg-slate-200">
            <Settings className="h-4 w-4" />
          </button>
        </Tooltip>
      </div>
      <Popover title="クイックメニュー" duration={v.popDuration} offset={v.popOffset}>
        <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-indigo-700">
          <Info className="h-4 w-4" />
          <span>メニューを開く</span>
        </button>
      </Popover>
    </div>
  ),
});
