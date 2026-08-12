import type { TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";
import { controlClassName } from "@/components/ui/input";

function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(controlClassName, "resize-y py-3 leading-relaxed", className)}
      {...props}
    />
  );
}

export { Textarea };
