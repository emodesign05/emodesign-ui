import { useState } from 'react';
import { InteractivePagination } from '../components/PaginationProps';
import { definePlayground } from '../playground/types';

type V = { totalPages: number };

function Stage({ totalPages }: V) {
  const [page, setPage] = useState(1);
  const current = Math.min(page, totalPages);
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4 sm:p-6 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <p className="mb-4 text-center text-xs text-slate-400">
          全 {totalPages} ページ中 {current} ページ目
        </p>
        <InteractivePagination totalPages={totalPages} currentPage={current} onPageChange={setPage} />
      </div>
    </main>
  );
}

export default definePlayground<V>({
  note: 'ページ番号をクリックして動きを確認できます。',
  controls: [{ key: 'totalPages', label: '総ページ数', hint: '多いと「…」で省略表示されます', type: 'range', min: 1, max: 50, step: 1, default: 12 }],
  render: (v) => <Stage totalPages={v.totalPages} />,
});
