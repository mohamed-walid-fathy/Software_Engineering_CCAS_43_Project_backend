import { cn } from "@/lib/utils";

interface ProgressBarProps {
  current: number;
  goal: number;
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ProgressBar({ 
  current, 
  goal, 
  className, 
  showLabel = true,
  size = "md" 
}: ProgressBarProps) {
  const percentage = Math.min((current / goal) * 100, 100);
  
  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  return (
    <div className={cn("w-full", className)}>
      <div className={cn("w-full overflow-hidden rounded-full bg-secondary", sizeClasses[size])}>
        <div
          className="h-full rounded-full bg-success transition-all duration-1000 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="font-semibold text-foreground">
            ${current.toLocaleString()} raised
          </span>
          <span className="text-muted-foreground">
            {percentage.toFixed(0)}% of ${goal.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}
