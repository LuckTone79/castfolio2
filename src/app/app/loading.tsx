import { Skeleton } from "@/components/ui/skeleton";

export default function AppLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-4 h-8 w-20" />
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
        <Skeleton className="h-5 w-28" />
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
            <Skeleton className="h-5 w-40" />
            <div className="mt-5 space-y-4">
              {Array.from({ length: 3 }).map((__, rowIndex) => (
                <div key={rowIndex} className="flex items-center justify-between gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
