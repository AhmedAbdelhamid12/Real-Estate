import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/i18nContext";
import { useLogout, useListNotifications, useMarkNotificationRead, useMarkAllNotificationsRead, getListNotificationsQueryKey } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Bell, User, LogOut, Sun, Moon, Check, CheckCircle2, Languages } from "lucide-react";
import { UserAvatar } from "@/components/shared/UserAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";

export function TopBar() {
  const { currentUser } = useAuth();
  const { locale, setLocale, t } = useI18n();
  const [, setLocation] = useLocation();
  const { setTheme, theme } = useTheme();
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useListNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const logout = useLogout();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.clear();
        setLocation("/login");
      }
    });
  };

  const handleMarkRead = (id: string) => {
    markRead.mutate({ notificationId: id }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() })
    });
  };

  const handleMarkAllRead = () => {
    markAllRead.mutate(undefined, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() })
    });
  };

  return (
    <header className="h-16 shrink-0 bg-card flex items-center justify-between px-6 z-10 sticky top-0 md:static ml-12 md:ml-0" style={{ borderBottom: "1px solid rgba(200,168,75,0.14)" }}>
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold hidden sm:block tracking-tight text-foreground">
          TIL Real Estate Group
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <h3 className="font-semibold text-sm">{t("topbar.notifications")}</h3>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="h-auto py-1 px-2 text-xs">
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> {t("topbar.mark_all_read")}
                </Button>
              )}
            </div>
            <ScrollArea className="h-[300px]">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  {t("topbar.no_notifications")}
                </div>
              ) : (
                <div className="flex flex-col">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex flex-col gap-1 p-4 border-b last:border-b-0 hover:bg-muted/50 transition-colors ${
                        !notification.isRead ? "bg-primary/5" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-medium leading-none">
                          {locale === "ar" ? (notification.titleAr || notification.titleEn) : notification.titleEn}
                        </span>
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 -mt-1 -mr-1"
                            onClick={() => handleMarkRead(notification.id)}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {locale === "ar" ? (notification.bodyAr || notification.bodyEn) : notification.bodyEn}
                      </span>
                      <span className="text-[10px] text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocale(locale === "en" ? "ar" : "en")}
          title={locale === "en" ? "Switch to Arabic" : "Switch to English"}
        >
          <Languages className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <UserAvatar name={currentUser?.name || ""} avatarUrl={currentUser?.avatarUrl} className="h-8 w-8" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{currentUser?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {currentUser?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/profile" className="w-full flex items-center cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>{t("topbar.profile")}</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>{t("topbar.logout")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
