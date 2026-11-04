export default function PageSkeleton() {
  return (
    <div className="w-full animate-pulse px-[5%] py-12 max-w-7xl mx-auto">
      <div className="flex items-center gap-2 mb-10">
        <div className="h-3 w-12 bg-border rounded" />
        <div className="h-3 w-3 bg-border rounded" />
        <div className="h-3 w-16 bg-border rounded" />
        <div className="h-3 w-3 bg-border rounded" />
        <div className="h-3 w-20 bg-border/60 rounded" />
      </div>

      <div className="mb-16 space-y-4">
        <div className="h-4 w-28 bg-border rounded-full" />
        <div className="h-12 w-3/5 bg-border rounded-2xl" />
        <div className="h-4 w-2/5 bg-border rounded-full" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-background border border-border rounded-2xl overflow-hidden">
            <div className="aspect-[4/5] bg-muted relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
            </div>
            <div className="p-5 space-y-3">
              <div className="h-2.5 w-16 bg-border rounded-full" />
              <div className="h-4 w-full bg-border rounded-lg" />
              <div className="h-4 w-3/4 bg-border rounded-lg" />
              <div className="pt-3">
                <div className="h-11 w-full bg-border rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="w-full animate-pulse px-[5%] py-12 max-w-7xl mx-auto">
      <div className="flex items-center gap-2 mb-10">
        <div className="h-3 w-12 bg-border rounded" />
        <div className="h-3 w-3 bg-border rounded" />
        <div className="h-3 w-16 bg-border rounded" />
        <div className="h-3 w-3 bg-border rounded" />
        <div className="h-3 w-24 bg-border/60 rounded" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-4">
          <div className="aspect-square bg-muted rounded-3xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
          </div>
          <div className="flex gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-20 h-20 bg-muted rounded-xl" />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="h-3 w-20 bg-border rounded-full" />
          <div className="h-10 w-full bg-border rounded-2xl" />
          <div className="h-10 w-2/3 bg-border rounded-2xl" />
          <div className="h-5 w-1/3 bg-border rounded-full" />
          <div className="space-y-3 pt-4">
            <div className="h-3 w-full bg-border rounded" />
            <div className="h-3 w-full bg-border rounded" />
            <div className="h-3 w-4/5 bg-border rounded" />
            <div className="h-3 w-3/5 bg-border rounded" />
          </div>
          <div className="pt-6 space-y-3">
            <div className="h-14 w-full bg-border rounded-full" />
            <div className="h-14 w-full bg-border rounded-full" />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}

export function MinimalPageSkeleton() {
  return (
    <div className="w-full min-h-[70vh] flex flex-col items-center justify-center px-6 animate-pulse">
      <div className="flex flex-col items-center space-y-6">
        <div className="w-24 h-10 bg-border rounded-lg" />
        <div className="w-20 h-[2px] bg-border rounded-full relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-8 bg-muted-foreground rounded-full animate-loading-bar" />
        </div>
        <div className="h-3 w-28 bg-border rounded-full" />
      </div>

      <style>{`
        @keyframes loadingBar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(350px); }
        }
        .animate-loading-bar {
          animation: loadingBar 1.6s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
