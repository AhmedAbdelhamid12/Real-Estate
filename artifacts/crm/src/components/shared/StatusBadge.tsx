import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { LeadStatus } from "@workspace/api-client-react";

interface StatusBadgeProps {
  status: LeadStatus | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusColor = (s: string) => {
    switch (s.toLowerCase()) {
      case "new":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      case "called":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
      case "qualified":
        return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800";
      case "proposal":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800";
      case "negotiation":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800";
      case "won":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800";
      case "lost":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700";
    }
  };

  const getLabel = (s: string) => {
    return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ");
  };

  return (
    <Badge variant="outline" className={cn("font-medium", getStatusColor(status), className)}>
      {getLabel(status)}
    </Badge>
  );
}
