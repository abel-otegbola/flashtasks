export function TaskSkeletonLoader() {
  return (
    <div className="flex flex-col gap-6 bg-white dark:bg-dark-bg md:rounded-[10px] p-6 h-full mb-4 animate-pulse">
      <div className="flex justify-between gap-6 items-start flex-wrap">
        <div className="space-y-3">
          <div className="h-7 w-40 rounded bg-gray-100 dark:bg-gray-700/[0.4]" />
          <div className="h-4 w-24 rounded bg-gray-100 dark:bg-gray-700/[0.4]" />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-dark-bg-secondary p-1 rounded-lg border border-gray-500/[0.2]">
            <div className="h-6 w-6 rounded bg-gray-100 dark:bg-gray-700/[0.4]" />
            <div className="h-6 w-6 rounded bg-gray-100 dark:bg-gray-700/[0.4]" />
            <div className="h-6 w-6 rounded bg-gray-100 dark:bg-gray-700/[0.4]" />
            <div className="h-6 w-6 rounded bg-gray-100 dark:bg-gray-700/[0.4]" />
          </div>
          <div className="h-9 w-28 rounded-md bg-gray-100 dark:bg-gray-700/[0.4]" />
        </div>
      </div>

      <div className="grid lg:grid-cols-5 sm:grid-cols-2 grid-cols-1 gap-4 items-start">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={`task-skeleton-summary-${index}`}
            className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg-secondary/50 space-y-3"
          >
            <div className="h-3 w-14 rounded bg-gray-100 dark:bg-gray-700/[0.4]" />
            <div className="h-8 w-10 rounded bg-gray-100 dark:bg-gray-700/[0.4]" />
          </div>
        ))}

        {Array.from({ length: 5 }).map((_, columnIndex) => (
          <div key={`task-skeleton-column-${columnIndex}`} className="flex flex-col gap-2">
            <div className="flex flex-col gap-4 overflow-hidden transition-all duration-300 max-h-none">
              {Array.from({ length: 3 }).map((__, cardIndex) => (
                <div
                  key={`task-skeleton-card-${columnIndex}-${cardIndex}`}
                  className="relative flex flex-col gap-3 p-4 rounded-[10px] border border-gray-100/10 bg-white dark:bg-[#101010] overflow-hidden"
                >
                  <div className="h-4 w-20 rounded-full bg-gray-100 dark:bg-gray-700/[0.4]" />
                  <div className="h-4 w-4/5 rounded bg-gray-100 dark:bg-gray-700/[0.4]" />
                  <div className="h-3 w-full rounded bg-gray-100 dark:bg-gray-700/[0.4]" />
                  <div className="flex justify-between gap-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex gap-2">
                      <div className="h-6 w-6 rounded-full bg-gray-100 dark:bg-gray-700/[0.4]" />
                      <div className="h-6 w-6 rounded-full bg-gray-100 dark:bg-gray-700/[0.4]" />
                    </div>
                    <div className="h-4 w-10 rounded bg-gray-100 dark:bg-gray-700/[0.4]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TaskSkeletonLoader;
