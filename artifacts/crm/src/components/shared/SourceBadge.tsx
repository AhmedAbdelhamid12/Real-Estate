import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { LeadSource } from "@workspace/api-client-react";

interface SourceBadgeProps {
  source: LeadSource | string;
  className?: string;
}

export function SourceBadge({ source, className }: SourceBadgeProps) {
  return (
    <Badge variant="secondary" className={cn("capitalize text-xs font-normal", className)}>
      {source.replace(/_/g, " ")}
    </Badge>
  );
}
