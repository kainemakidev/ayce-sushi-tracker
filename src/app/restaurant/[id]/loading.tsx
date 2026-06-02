export default function RestaurantLoading() {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div
        className="px-5 pt-12 pb-6"
        style={{ background: 'linear-gradient(135deg, #922B21 0%, #C0392B 50%, #E74C3C 100%)' }}
      >
        <div className="h-4 w-14 rounded bg-white/20 mb-4" />
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-white/20 shrink-0" />
          <div className="space-y-2">
            <div className="h-4 w-44 rounded bg-white/25" />
            <div className="h-3 w-32 rounded bg-white/15" />
          </div>
        </div>
      </div>

      <div className="px-4 py-5 space-y-6">
        {/* Pricing section */}
        <div className="space-y-3">
          <div className="h-3 w-16 rounded bg-amber-200/60" />
          <div className="h-16 rounded-xl bg-gray-100 dark:bg-gray-800" />
          <div className="h-3 w-32 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-14 rounded-xl bg-gray-100 dark:bg-gray-800" />
          <div className="h-14 rounded-xl bg-gray-100 dark:bg-gray-800" />
        </div>

        {/* Group section */}
        <div className="space-y-3">
          <div className="h-3 w-12 rounded bg-amber-200/60" />
          <div className="h-16 rounded-xl bg-gray-100 dark:bg-gray-800" />
          <div className="h-10 rounded-lg bg-gray-100 dark:bg-gray-800" />
        </div>

        {/* Start button */}
        <div className="h-12 rounded-xl bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
}
