import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circle" | "rect" | "card";
}

export const Skeleton = ({ className, variant = "rect" }: SkeletonProps) => {
  const baseClasses = "bg-muted animate-pulse";
  
  const variantClasses = {
    text: "h-4 rounded",
    circle: "rounded-full",
    rect: "rounded-lg",
    card: "rounded-2xl",
  };

  return (
    <div className={cn(baseClasses, variantClasses[variant], className)} />
  );
};

export const HeroSkeleton = () => (
  <div className="min-h-screen flex items-center justify-center px-6">
    <div className="max-w-6xl w-full mx-auto">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Left content */}
        <div className="space-y-6">
          <Skeleton className="h-4 w-24" variant="text" />
          <Skeleton className="h-16 w-3/4" variant="text" />
          <Skeleton className="h-12 w-1/2" variant="text" />
          <Skeleton className="h-6 w-2/3" variant="text" />
          <Skeleton className="h-20 w-full" variant="text" />
          <div className="flex gap-4">
            <Skeleton className="h-12 w-36" variant="rect" />
            <Skeleton className="h-12 w-36" variant="rect" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-12 w-12" variant="circle" />
            <Skeleton className="h-12 w-12" variant="circle" />
            <Skeleton className="h-12 w-12" variant="circle" />
          </div>
        </div>
        
        {/* Right - Photo skeleton */}
        <div className="flex justify-center">
          <Skeleton className="w-52 h-52 md:w-64 md:h-64" variant="rect" />
        </div>
      </div>
    </div>
  </div>
);

export const SectionSkeleton = ({ title = true }: { title?: boolean }) => (
  <div className="py-24 px-6">
    <div className="max-w-6xl mx-auto">
      {title && (
        <div className="text-center mb-16 space-y-4">
          <Skeleton className="h-8 w-48 mx-auto" variant="text" />
          <Skeleton className="h-4 w-16 mx-auto" variant="text" />
        </div>
      )}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-48" variant="card" />
        ))}
      </div>
    </div>
  </div>
);

export const CardSkeleton = () => (
  <motion.div
    className="bg-card rounded-2xl border border-border p-6 space-y-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex items-center gap-4">
      <Skeleton className="w-12 h-12" variant="circle" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" variant="text" />
        <Skeleton className="h-4 w-1/2" variant="text" />
      </div>
    </div>
    <Skeleton className="h-20 w-full" variant="rect" />
    <div className="flex gap-2">
      <Skeleton className="h-6 w-16" variant="rect" />
      <Skeleton className="h-6 w-16" variant="rect" />
      <Skeleton className="h-6 w-16" variant="rect" />
    </div>
  </motion.div>
);

export default Skeleton;
