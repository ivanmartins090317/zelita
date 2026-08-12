import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-card border border-line bg-white shadow-card",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 border-b border-line-2 px-5 py-4",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-body font-bold text-ink", className)} {...props} />
  );
}

function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...props} />;
}

export { Card, CardHeader, CardTitle, CardBody };
