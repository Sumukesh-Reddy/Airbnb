interface LoadingSkeletonProps {
  count?: number;
}

function ListingCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 rounded-2xl aspect-square mb-3" />
      <div className="space-y-2">
        <div className="flex justify-between">
          <div className="bg-gray-200 h-4 rounded w-2/3" />
          <div className="bg-gray-200 h-4 rounded w-12" />
        </div>
        <div className="bg-gray-200 h-3 rounded w-1/2" />
        <div className="bg-gray-200 h-3 rounded w-1/3" />
        <div className="bg-gray-200 h-4 rounded w-1/4" />
      </div>
    </div>
  );
}

export function ListingGridSkeleton({ count = 12 }: LoadingSkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function DetailsPageSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8 animate-pulse">
      <div className="bg-gray-200 h-8 rounded w-2/3 mb-4" />
      <div className="bg-gray-200 h-4 rounded w-1/3 mb-6" />
      <div className="bg-gray-200 rounded-2xl h-96 mb-8" />
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-4">
          <div className="bg-gray-200 h-6 rounded w-1/2" />
          <div className="bg-gray-200 h-4 rounded" />
          <div className="bg-gray-200 h-4 rounded w-5/6" />
          <div className="bg-gray-200 h-4 rounded w-4/6" />
        </div>
        <div className="bg-gray-200 rounded-2xl h-64" />
      </div>
    </div>
  );
}
