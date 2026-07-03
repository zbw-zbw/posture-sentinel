import SkeletonBlock from "@/components/SkeletonBlock";

export default function DataLoading() {
  return (
    <div className="min-h-screen bg-bg pt-20 pb-12">
      <div className="max-w-[1100px] mx-auto px-4 md:px-6">
        <div className="mb-6">
          <SkeletonBlock className="h-8 w-32 mb-3" />
          <SkeletonBlock className="h-5 w-48" />
        </div>
        <div className="space-y-6">
          <SkeletonBlock className="h-32 w-full rounded-2xl" />
          <SkeletonBlock className="h-48 w-full rounded-2xl" />
          <SkeletonBlock className="h-40 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
