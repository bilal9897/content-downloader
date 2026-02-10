import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Skeleton({ className, ...props }: SkeletonProps) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-white/10", className)}
            {...props}
        />
    );
}

export function VideoInfoSkeleton() {
    return (
        <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
                {/* Thumbnail Skeleton */}
                <Skeleton className="w-full md:w-48 aspect-video rounded-xl" />

                <div className="space-y-3 flex-1">
                    <Skeleton className="h-7 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-8 w-40 rounded-full" />
                </div>
            </div>

            {/* Clip Creator Skeleton */}
            <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-12 w-full" />
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
                <Skeleton className="h-10 w-full md:w-48" />
                <Skeleton className="h-12 w-full md:w-40" />
            </div>
        </div>
    );
}
