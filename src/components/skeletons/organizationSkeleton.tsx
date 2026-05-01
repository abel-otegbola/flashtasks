export function OrganizationSkeletonLoader() {
  return (
    <div className="md:p-0 px-4 animate-pulse">
      <div className="flex items-center justify-between mb-4 bg-white dark:bg-dark-bg p-4 rounded-lg border border-gray-500/[0.1] dark:border-gray-500/[0.2]">
        <div className="h-7 w-40 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-9 w-40 rounded bg-gray-200 dark:bg-gray-700" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 h-full bg-white dark:bg-dark-bg border border-gray-500/[0.1] dark:border-gray-500/[0.2] rounded-lg">
        <div className="col-span-1 md:p-6 p-4 space-y-4">
          <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`organization-skeleton-item-${index}`} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-700" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-2 md:border-l border-gray-500/[0.1] dark:border-gray-500/[0.2] md:p-6 p-4 space-y-6">
          <div className="py-8 max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-5 w-40 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-3 w-56 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
              <div className="h-9 w-9 rounded bg-gray-200 dark:bg-gray-700" />
            </div>

            <div className="border border-gray-500/[0.1] rounded-lg">
              <div className="flex justify-between items-center gap-2 p-4 border-b border-gray-500/[0.1]">
                <div className="h-4 w-14 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
              <div className="flex flex-col gap-2 p-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={`organization-team-skeleton-${index}`} className="flex items-center justify-between p-2 border border-gray-500/[0.2] rounded">
                    <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-4 w-10 rounded bg-gray-200 dark:bg-gray-700" />
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-gray-500/[0.1] rounded-lg">
              <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700 m-4" />
              <div className="flex flex-col gap-2 p-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={`organization-member-skeleton-${index}`} className="flex items-center justify-between p-2 border border-gray-500/[0.2] rounded">
                    <div className="space-y-2">
                      <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
                      <div className="h-3 w-16 rounded bg-gray-200 dark:bg-gray-700" />
                    </div>
                    <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrganizationSkeletonLoader;
