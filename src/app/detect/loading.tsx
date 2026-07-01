import SkeletonBlock from "@/components/SkeletonBlock";

export default function DetectLoading() {
  return (
    <div className="min-h-screen bg-bg pt-20 pb-12">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        {/* Header skeleton */}
        <div className="mb-6">
          <SkeletonBlock className="h-8 w-48 mb-3" />
          <SkeletonBlock className="h-5 w-72" />
        </div>
        {/* Camera + Panel grid skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <SkeletonBlock className="aspect-[4/3] w-full rounded-2xl" />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <SkeletonBlock className="h-20 w-full rounded-2xl" />
            <SkeletonBlock className="h-40 w-full rounded-2xl" />
            <SkeletonBlock className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
