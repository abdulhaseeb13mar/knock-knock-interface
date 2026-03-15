import { cn } from "@/utils/cn";
import { Loader2 } from "lucide-react";

export interface SpinnerProps extends React.SVGProps<SVGSVGElement> {
  size?: "default" | "sm" | "lg" | "icon";
}

export function Spinner({ className, size = "default", ...props }: SpinnerProps) {
  return (
    <Loader2
      className={cn(
        "animate-spin text-muted-foreground",
        {
          "h-4 w-4": size === "default",
          "h-3 w-3": size === "sm",
          "h-6 w-6": size === "lg",
          "h-10 w-10": size === "icon",
        },
        className,
      )}
      {...props}
    />
  );
}
