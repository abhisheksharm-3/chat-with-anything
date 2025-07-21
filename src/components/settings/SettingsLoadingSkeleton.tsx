import { Skeleton } from "@/components/ui/skeleton";

/**
 * Reusable skeleton loader component for settings pages and dialogs
 *
 * @param isMobile - If true, renders mobile-optimized skeleton layout
 */
export const SettingsLoadingSkeleton = ({ isMobile = false }) => {
  if (isMobile) {
    return (
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md space-y-8 text-center">
          {/* Render 3 setting sections for mobile */}
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={`mobile-section-${index}`} className="space-y-3">
              <Skeleton className="h-4 w-24 mx-auto bg-gray-700" />
              <Skeleton className="h-6 w-40 mx-auto bg-gray-600" />
            </div>
          ))}
          {/* Upgrade button skeleton */}
          <div className="mt-10">
            <Skeleton className="h-12 w-32 mx-auto bg-primary/20 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // Desktop version
  return (
    <div className="px-6 pb-6 space-y-6">
      {/* Render 2 main setting sections for desktop */}
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={`desktop-section-${index}`} className="space-y-2">
          <Skeleton className="h-4 w-24 bg-gray-700" />
          <Skeleton className="h-6 w-48 bg-gray-600" />
        </div>
      ))}

      {/* Current plan section with upgrade button */}
      <div className="flex justify-between items-center pt-2">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20 bg-gray-700" />
          <Skeleton className="h-6 w-16 bg-gray-600" />
        </div>
        <Skeleton className="h-10 w-32 bg-primary/20 rounded-xl" />
      </div>
    </div>
  );
};
