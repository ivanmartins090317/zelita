import type { SelectHTMLAttributes } from "react";

import { cn } from "@/lib/utils";
import { controlClassName } from "@/components/ui/input";

function Select({
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(controlClassName, className)} {...props} />;
}

export { Select };
