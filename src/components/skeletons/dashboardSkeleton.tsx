export function DashboardSkeletonLoader() {
  return (
    <div className="md:w-5xl w-full mx-auto gap-4 mb-4 px-4 animate-pulse">
      <div className="flex flex-1 flex-col gap-6 h-full mb-4">
        <div className="flex flex-col gap-4 p-4 md:p-6 bg-white dark:bg-dark-bg border border-gray-500/[0.1] rounded-[10px]">
          <div className="space-y-2">
            <div className="h-7 w-64 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-72 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
          <div className="grid grid-cols-3 gap-1 p-1 bg-gray-100 dark:bg-dark-bg rounded-lg">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={`dashboard-stat-skeleton-${index}`} className="text-center p-4 bg-white dark:bg-dark rounded-md border border-gray-500/[0.1] space-y-2">
                <div className="h-3 w-12 mx-auto rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-6 w-10 mx-auto rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col bg-white dark:bg-dark-bg border border-gray-500/[0.1] rounded-[10px]">
          <div className="flex justify-between items-center border-b border-gray-500/[0.1] md:px-6 p-4">
            <div className="h-5 w-32 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-9 w-24 rounded bg-gray-200 dark:bg-gray-700" />
          </div>

          <div className="flex flex-col gap-3 p-4 md:p-6">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={`dashboard-task-skeleton-${index}`} className="md:grid md:grid-cols-12 flex flex-col gap-4 px-4 py-3 border border-gray-500/[0.1] rounded-lg bg-white dark:bg-dark-bg">
                <div className="md:col-span-6 flex flex-col gap-2">
                  <div className="h-4 w-40 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700" />
                </div>
                <div className="md:col-span-2 hidden md:block h-6 w-20 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="md:col-span-2 hidden md:block h-6 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="md:col-span-2 h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardSkeletonLoader;
