import SkeletonBlock from "@/components/SkeletonBlock";

export default function AchievementsLoading() {
  return (
    <div className="min-h-screen bg-bg pt-20 pb-12">
      <div className="max-w-[1100px] mx-auto px-4 md:px-6">
        <div className="mb-6">
          <SkeletonBlock className="h-8 w-40 mb-3" />
          <SkeletonBlock className="h-5 w-56" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <div className="space-y-4">
          <SkeletonBlock className="h-48 w-full rounded-2xl" />
          <SkeletonBlock className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
