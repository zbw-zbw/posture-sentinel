import SkeletonBlock from "@/components/SkeletonBlock";

export default function ReportLoading() {
  return (
    <div className="min-h-screen bg-bg pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <div className="mb-6">
          <SkeletonBlock className="h-8 w-48 mb-3" />
          <SkeletonBlock className="h-5 w-64" />
        </div>
        {/* Date picker + content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SkeletonBlock className="h-64 rounded-2xl" />
          <div className="lg:col-span-2 space-y-6">
            <SkeletonBlock className="h-32 rounded-2xl" />
            <SkeletonBlock className="h-48 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
