import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name: string;
  avatarUrl?: string | null;
  className?: string;
}

export function UserAvatar({ name, avatarUrl, className }: UserAvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Avatar className={cn("h-8 w-8", className)}>
      {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
      <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
