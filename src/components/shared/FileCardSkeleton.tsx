import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FileCardSkeletonProps {
  count?: number;
  isPrivateMode?: boolean;
}

export default function FileCardSkeleton({ count = 4, isPrivateMode }: FileCardSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card
          key={i}
          className={cn(
            isPrivateMode
              ? "bg-white/5 border-purple-500/20"
              : "dark:bg-gray-800/50",
          )}
        >
          <CardContent className="p-5">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded",
                    isPrivateMode ? "bg-purple-500/20" : "bg-indigo-100 dark:bg-indigo-900/30",
                  )}
                />
                <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="flex justify-between pt-2">
                <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
