import { TypeSkeletonConfig } from "@/types/ui";
import { Skeleton } from "../ui/skeleton";
import { HistoryPageSkeletonConfigs } from "@/constants/HistoryPage";

/**
 * Reusable skeleton element component
 */
const SkeletonElement = ({
  height,
  width,
  className = "",
}: TypeSkeletonConfig) => (
  <Skeleton className={`${height} ${width} bg-[#333] rounded ${className}`} />
);

/**
 * Mobile skeleton metadata component
 */
const MobileSkeletonMeta = () => {
  const mobileItems: TypeSkeletonConfig[] = [
    HistoryPageSkeletonConfigs.mobileSize,
    HistoryPageSkeletonConfigs.mobileTime,
  ];

  return (
    <div className="flex flex-col items-end gap-0.5 sm:hidden">
      {mobileItems.map((config, index) => (
        <SkeletonElement key={index} {...config} />
      ))}
    </div>
  );
};

/**
 * Desktop skeleton metadata component
 */
const DesktopSkeletonMeta = () => {
  const desktopItems: TypeSkeletonConfig[] = [
    HistoryPageSkeletonConfigs.desktopSize,
    HistoryPageSkeletonConfigs.desktopTime,
  ];

  return (
    <div className="hidden sm:flex items-center gap-4">
      {desktopItems.map((config, index) => (
        <SkeletonElement key={index} {...config} />
      ))}
    </div>
  );
};

/**
 * Main skeleton item component
 */
export const HistoryChatlistSkeletonItem = () => {
  const mainSkeletonItems: TypeSkeletonConfig[] = [
    HistoryPageSkeletonConfigs.title,
    HistoryPageSkeletonConfigs.badge,
  ];

  return (
    <div className="w-full bg-[#1a1a1a] p-3 sm:p-4 rounded-lg border border-[#333]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3 flex-1">
          {mainSkeletonItems.map((config, index) => (
            <SkeletonElement key={index} {...config} />
          ))}
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <MobileSkeletonMeta />
          <DesktopSkeletonMeta />
        </div>
      </div>
    </div>
  );
};
