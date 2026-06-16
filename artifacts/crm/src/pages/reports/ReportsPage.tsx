import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useGetSalesReport, useGetLeadsReport, apiFetch } from "@workspace/api-client-react";
import { format, subDays, startOfYear } from "date-fns";
import { ar } from "date-fns/locale";
import { DateRange } from "react-day-picker";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import {
  CalendarIcon, TrendingUp, Download, FileDown, Home, Building,
  Target, Trophy, Users, BarChart3, ArrowUpRight, ArrowDownRight, Flame
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/contexts/i18nContext";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";

// ── TIL Brand Palette ──────────────────────────────────────────────────
const TIL = {
  gold:       "#C9A84C",
  goldLight:  "#E8D5A3",
  navy:       "#0A1E38",
  navyLight:  "#1E4976",
  blue:       "#4A8FD4",
  green:      "#22C59A",
  red:        "#E05555",
  amber:      "#D4900A",
};

// Pie/multi-series chart colors — TIL-branded
const CHART_COLORS = [
  TIL.gold,
  TIL.blue,
  TIL.green,
  TIL.red,
  TIL.navyLight,
];

// Pipeline funnel — progresses from navy → gold → green
const FUNNEL_COLORS = [
  TIL.navyLight,
  "#2B5C8A",
  "#3B78B0",
  TIL.gold,
  "#D4900A",
  TIL.green,
];

const STATUS_LABELS_AR: Record<string, string> = {
  new: "جديد", called: "تم الاتصال", qualified: "مؤهل",
  proposal: "عرض سعر", negotiation: "تفاوض", won: "فائز", lost: "خسارة",
};
const SOURCE_LABELS_AR: Record<string, string> = {
  manual: "يدوي", import: "استيراد", campaign: "حملة", referral: "توصية",
  website: "موقع إلكتروني", social: "تواصل اجتماعي",
};

const MEDALS = ["🥇", "🥈", "🥉"];

function downloadCsv(rows: string[][], filename: string) {
  const csvContent = rows
    .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = filename;
  document.body.appendChild(link); link.click();
  document.body.removeChild(link); URL.revokeObjectURL(url);
}

function formatPrice(val: number) {
  return new Intl.NumberFormat("ar-EG", { style: "currency", currency: "EGP", maximumFractionDigits: 0 }).format(val);
}

const tooltipStyle: React.CSSProperties = {
  borderRadius: "10px",
  border: "1px solid hsl(var(--border))",
  background: "hsl(var(--card))",
  color: "hsl(var(--card-foreground))",
  fontSize: 12,
  boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
  padding: "8px 12px",
};

// Subtle TIL-gold tinted cursor — replaces the ugly dark default
const chartCursor = { fill: TIL.gold, opacity: 0.07, radius: 6 };

const PRESETS = [
  { label: "٧ أيام", days: 7 },
  { label: "٣٠ يوم", days: 30 },
  { label: "٩٠ يوم", days: 90 },
  { label: "هذا العام", days: -1 },
];

export function ReportsPage() {
  const { t } = useI18n();
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [activePreset, setActivePreset] = useState(1);

  const fromDate = date?.from ? format(date.from, "yyyy-MM-dd") : undefined;
  const toDate = date?.to ? format(date.to, "yyyy-MM-dd") : undefined;

  const { data: salesReport, isLoading: isSalesLoading } = useGetSalesReport({ from: fromDate, to: toDate });
  const { data: leadsReport, isLoading: isLeadsLoading } = useGetLeadsReport({ from: fromDate, to: toDate });

  const { data: resaleReport, isLoading: isResaleLoading } = useQuery({
    queryKey: ["reports", "resale", fromDate, toDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);
      const res = await apiFetch(`/api/reports/resale?${params}`);
      if (!res.ok) throw new Error("Failed");
      return res.json() as Promise<{ total: number; activeCount: number; inactiveCount: number; totalValue: number; byType: { type: string; count: number }[]; byProject: { project: string; count: number; totalValue: number }[] }>;
    },
  });

  const { data: trendsData, isLoading: isTrendsLoading } = useQuery({
    queryKey: ["reports", "trends", fromDate, toDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);
      const res = await apiFetch(`/api/reports/trends?${params}`);
      if (!res.ok) throw new Error("Failed");
      return res.json() as Promise<{ days: { date: string; total: number; won: number; lost: number; inProgress: number }[] }>;
    },
  });

  const { data: projectsReport, isLoading: isProjectsLoading } = useQuery({
    queryKey: ["reports", "projects", fromDate, toDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);
      const res = await apiFetch(`/api/reports/projects?${params}`);
      if (!res.ok) throw new Error("Failed");
      return res.json() as Promise<{ projects: { id: string; name: string; imageUrl?: string; total: number; won: number; lost: number; inProgress: number; convRate: number }[] }>;
    },
  });

  function applyPreset(idx: number) {
    setActivePreset(idx);
    const p = PRESETS[idx];
    if (p.days === -1) {
      setDate({ from: startOfYear(new Date()), to: new Date() });
    } else {
      setDate({ from: subDays(new Date(), p.days), to: new Date() });
    }
  }

  const sortedPerformers = useMemo(() =>
    [...(salesReport?.byUser ?? [])].sort((a, b) =>
      ((b.won ?? 0) / Math.max(b.total ?? 0, 1)) - ((a.won ?? 0) / Math.max(a.total ?? 0, 1))
    ), [salesReport]);

  const pipelineFunnel = useMemo(() => {
    const order = ["new", "called", "qualified", "proposal", "negotiation", "won"];
    return order.map(s => ({
      name: STATUS_LABELS_AR[s] ?? s,
      value: (leadsReport?.byStatus ?? []).find((x: any) => x.status === s)?.count ?? 0,
    })).filter(x => x.value > 0);
  }, [leadsReport]);

  const trendDays = trendsData?.days ?? [];
  const showWeekly = trendDays.length > 60;
  const trendChart = useMemo(() => {
    if (!showWeekly) return trendDays.map(d => ({
      ...d,
      label: format(new Date(d.date), "d MMM"),
    }));
    const weeks: Record<string, { label: string; total: number; won: number; lost: number }> = {};
    for (const d of trendDays) {
      const dt = new Date(d.date);
      const weekStart = new Date(dt);
      weekStart.setDate(dt.getDate() - dt.getDay());
      const key = weekStart.toISOString().slice(0, 10);
      if (!weeks[key]) weeks[key] = { label: format(weekStart, "d MMM"), total: 0, won: 0, lost: 0 };
      weeks[key].total += d.total;
      weeks[key].won += d.won;
      weeks[key].lost += d.lost;
    }
    return Object.values(weeks);
  }, [trendDays, showWeekly]);

  function exportSalesReport() {
    if (!salesReport?.byUser) return;
    const rows: string[][] = [
      ["الموظف", "إجمالي", "فائز", "خسارة", "جاري", "معدل التحويل (%)"],
      ...(salesReport.byUser as any[]).map((p: any) => [
        p.userName, String(p.total ?? 0), String(p.won ?? 0), String(p.lost ?? 0), String(p.inProgress ?? 0),
        ((p.total ?? 0) > 0 ? (((p.won ?? 0) / (p.total ?? 1)) * 100).toFixed(1) : "0.0"),
      ]),
    ];
    downloadCsv(rows, `sales-report-${fromDate}-to-${toDate}.csv`);
  }

  function exportFullReport() {
    const rows: string[][] = [
      [`TIL Real Estate Group — تقرير شامل (${fromDate} → ${toDate})`],
      [],
      ["=== أداء المبيعات ==="],
      ["الموظف", "إجمالي", "فائز", "خسارة", "جاري", "معدل التحويل (%)"],
      ...(salesReport?.byUser ?? []).map((p: any) => [
        p.userName, String(p.total ?? 0), String(p.won ?? 0), String(p.lost ?? 0), String(p.inProgress ?? 0),
        ((p.total ?? 0) > 0 ? (((p.won ?? 0) / (p.total ?? 1)) * 100).toFixed(1) : "0.0"),
      ]),
      [],
      ["=== مصادر العملاء ==="],
      ["المصدر", "العدد"],
      ...(leadsReport?.bySource ?? []).map((s: any) => [SOURCE_LABELS_AR[s.source] ?? s.source, String(s.count)]),
      [],
      ["=== وحدات إعادة البيع ==="],
      ["المشروع", "الوحدات", "القيمة الإجمالية (ج.م)"],
      ...(resaleReport?.byProject ?? []).map((p) => [p.project, String(p.count), String(p.totalValue)]),
    ];
    downloadCsv(rows, `full-report-${fromDate}-to-${toDate}.csv`);
  }

  const DateRangePicker = () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("justify-start text-start font-normal min-w-[200px]", !date && "text-muted-foreground")}>
          <CalendarIcon className="me-2 h-4 w-4 shrink-0" />
          {date?.from ? (
            date.to ? <>{format(date.from, "d MMM")} – {format(date.to, "d MMM yyyy")}</> : format(date.from, "d MMM yyyy")
          ) : <span>اختر فترة</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar initialFocus mode="range" defaultMonth={date?.from} selected={date}
          onSelect={(v) => { setDate(v); setActivePreset(-1); }} numberOfMonths={2} />
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("reports.title")}</h2>
          <p className="text-muted-foreground text-sm">بيانات حية — آخر تحديث الآن</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {PRESETS.map((p, idx) => (
              <button
                key={p.label}
                onClick={() => applyPreset(idx)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-semibold transition-all",
                  activePreset === idx
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          <DateRangePicker />
          <Button variant="outline" onClick={exportFullReport} disabled={isSalesLoading || isLeadsLoading} className="gap-2">
            <FileDown className="h-4 w-4" /> تصدير
          </Button>
        </div>
      </div>

      <Tabs defaultValue="sales">
        <TabsList className="mb-4 flex-wrap h-auto gap-1">
          <TabsTrigger value="sales" className="gap-1.5"><Trophy className="h-3.5 w-3.5" /> أداء المبيعات</TabsTrigger>
          <TabsTrigger value="trends" className="gap-1.5"><TrendingUp className="h-3.5 w-3.5" /> الاتجاهات</TabsTrigger>
          <TabsTrigger value="leads" className="gap-1.5"><Users className="h-3.5 w-3.5" /> العملاء المحتملون</TabsTrigger>
          <TabsTrigger value="projects" className="gap-1.5"><Building className="h-3.5 w-3.5" /> المشاريع</TabsTrigger>
          <TabsTrigger value="resale" className="gap-1.5"><Home className="h-3.5 w-3.5" /> إعادة البيع</TabsTrigger>
        </TabsList>

        {/* ── SALES TAB ── */}
        <TabsContent value="sales" className="space-y-6">
          {/* KPI row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: "إجمالي العملاء",
                value: salesReport?.totalLeads ?? 0,
                icon: Users,
                color: "text-[#4A8FD4]",
                bg: "bg-[#4A8FD4]/10",
              },
              {
                label: "صفقات رابحة",
                value: salesReport?.totalWon ?? 0,
                icon: Trophy,
                color: "text-[#22C59A]",
                bg: "bg-[#22C59A]/10",
              },
              {
                label: "صفقات خاسرة",
                value: salesReport?.totalLost ?? 0,
                icon: Target,
                color: "text-[#E05555]",
                bg: "bg-[#E05555]/10",
              },
              {
                label: "معدل التحويل",
                value: (salesReport?.totalLeads ?? 0) > 0
                  ? `${(((salesReport?.totalWon ?? 0) / (salesReport?.totalLeads ?? 1)) * 100).toFixed(1)}%`
                  : "0%",
                icon: BarChart3,
                color: "text-[#C9A84C]",
                bg: "bg-[#C9A84C]/10",
              },
            ].map((kpi) => (
              <Card key={kpi.label} className="border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center shrink-0`}>
                    <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                  </div>
                  <div>
                    {isSalesLoading
                      ? <Skeleton className="h-7 w-12 mb-0.5" />
                      : <p className="text-2xl font-bold">{kpi.value}</p>
                    }
                    <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bar chart */}
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>أداء الفريق</CardTitle>
                <CardDescription>الصفقات الرابحة / الخاسرة / الجارية لكل مندوب</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={exportSalesReport} disabled={isSalesLoading} className="h-8 px-2 gap-1.5 text-muted-foreground">
                <Download className="h-4 w-4" /> CSV
              </Button>
            </CardHeader>
            <CardContent className="h-[320px]">
              {isSalesLoading ? <Skeleton className="h-full w-full" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesReport?.byUser ?? []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="userName" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} cursor={chartCursor} />
                    <Legend wrapperStyle={{ fontSize: 12 }} formatter={(v) => v === "won" ? "رابح" : v === "lost" ? "خاسر" : "جاري"} />
                    <Bar dataKey="won" name="won" stackId="a" fill={TIL.green} radius={[0, 0, 4, 4]} />
                    <Bar dataKey="lost" name="lost" stackId="a" fill={TIL.red} />
                    <Bar dataKey="inProgress" name="inProgress" stackId="a" fill={TIL.gold} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Leaderboard */}
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>لوحة الشرف 🏆</CardTitle>
                <CardDescription>مرتبون حسب معدل التحويل</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={exportSalesReport} disabled={isSalesLoading || !salesReport?.byUser?.length} className="gap-1.5">
                <Download className="h-3.5 w-3.5" /> تصدير
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>المندوب</TableHead>
                    <TableHead className="text-center">إجمالي</TableHead>
                    <TableHead className="text-center">رابح</TableHead>
                    <TableHead className="text-center">خاسر</TableHead>
                    <TableHead className="text-center">جاري</TableHead>
                    <TableHead className="text-end">معدل التحويل</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isSalesLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <TableRow key={i}><TableCell colSpan={7}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                    ))
                  ) : sortedPerformers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                        لا توجد بيانات للفترة المختارة
                      </TableCell>
                    </TableRow>
                  ) : sortedPerformers.map((perf, idx) => {
                    const rate = (perf.total ?? 0) > 0 ? (((perf.won ?? 0) / (perf.total ?? 1)) * 100).toFixed(1) : "0.0";
                    const pct = Math.min(parseFloat(rate), 100);
                    return (
                      <TableRow key={perf.userId} className={cn(idx === 0 ? "bg-[#C9A84C]/5 dark:bg-[#C9A84C]/5" : "")}>
                        <TableCell className="font-bold text-base w-12">
                          {MEDALS[idx] ?? <span className="text-muted-foreground text-sm font-medium">#{idx + 1}</span>}
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <UserAvatar name={perf.userName} />
                            <span>{perf.userName}</span>
                            {idx === 0 && <Flame className="w-4 h-4 text-[#C9A84C]" title="الأفضل" />}
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-semibold">{perf.total ?? 0}</TableCell>
                        <TableCell className="text-center font-bold" style={{ color: TIL.green }}>{perf.won ?? 0}</TableCell>
                        <TableCell className="text-center font-medium" style={{ color: TIL.red }}>{perf.lost ?? 0}</TableCell>
                        <TableCell className="text-center font-medium" style={{ color: TIL.amber }}>{perf.inProgress ?? 0}</TableCell>
                        <TableCell className="text-end">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden hidden sm:block">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${pct}%`,
                                  background: pct >= 50 ? TIL.green : pct >= 25 ? TIL.gold : TIL.red,
                                }}
                              />
                            </div>
                            <span
                              className="font-bold text-sm tabular-nums"
                              style={{ color: pct >= 50 ? TIL.green : pct >= 25 ? TIL.gold : TIL.red }}
                            >
                              {rate}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TRENDS TAB ── */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>اتجاه العملاء المحتملين {showWeekly ? "(أسبوعي)" : "(يومي)"}</CardTitle>
              <CardDescription>إجمالي العملاء الجدد خلال الفترة المختارة</CardDescription>
            </CardHeader>
            <CardContent className="h-[360px]">
              {isTrendsLoading ? <Skeleton className="h-full w-full" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={TIL.blue} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={TIL.blue} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradWon" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={TIL.green} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={TIL.green} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      cursor={{ stroke: TIL.gold, strokeWidth: 1.5, strokeDasharray: "4 2" }}
                      formatter={(v: any, name: string) =>
                        [v, name === "total" ? "إجمالي" : name === "won" ? "رابح" : name === "lost" ? "خاسر" : name]
                      }
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} formatter={(v) => v === "total" ? "إجمالي" : v === "won" ? "رابح" : "خاسر"} />
                    <Area type="monotone" dataKey="total" name="total" stroke={TIL.blue} strokeWidth={2} fill="url(#gradTotal)" dot={false} />
                    <Area type="monotone" dataKey="won" name="won" stroke={TIL.green} strokeWidth={2} fill="url(#gradWon)" dot={false} />
                    <Area type="monotone" dataKey="lost" name="lost" stroke={TIL.red} strokeWidth={1.5} fill="none" strokeDasharray="4 2" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Pipeline funnel */}
          <Card>
            <CardHeader>
              <CardTitle>مسار التحويل (Funnel)</CardTitle>
              <CardDescription>مراحل العملاء المحتملين من البداية حتى الإغلاق</CardDescription>
            </CardHeader>
            <CardContent>
              {isLeadsLoading ? <Skeleton className="h-48 w-full" /> : (
                <div className="space-y-2.5">
                  {pipelineFunnel.map((stage, idx) => {
                    const maxVal = pipelineFunnel[0]?.value ?? 1;
                    const pct = Math.round((stage.value / maxVal) * 100);
                    const color = FUNNEL_COLORS[idx] ?? TIL.gold;
                    return (
                      <div key={stage.name} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{stage.name}</span>
                          <span className="text-muted-foreground tabular-nums">{stage.value} ({pct}%)</span>
                        </div>
                        <div className="h-8 bg-muted/60 rounded-lg overflow-hidden">
                          <div
                            className="h-full rounded-lg flex items-center px-3 transition-all duration-500"
                            style={{ width: `${pct}%`, minWidth: stage.value > 0 ? "2rem" : 0, backgroundColor: color }}
                          >
                            {pct > 15 && <span className="text-white text-xs font-bold drop-shadow">{stage.value}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {pipelineFunnel.length === 0 && (
                    <p className="text-center py-8 text-muted-foreground">لا توجد بيانات للفترة المختارة</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── LEADS TAB ── */}
        <TabsContent value="leads" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Card className="border shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${TIL.blue}18` }}>
                  <Users className="w-5 h-5" style={{ color: TIL.blue }} />
                </div>
                <div>
                  {isLeadsLoading ? <Skeleton className="h-7 w-12" /> : <p className="text-2xl font-bold">{leadsReport?.total ?? 0}</p>}
                  <p className="text-xs text-muted-foreground">إجمالي العملاء</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${TIL.green}18` }}>
                  <Trophy className="w-5 h-5" style={{ color: TIL.green }} />
                </div>
                <div>
                  {isLeadsLoading ? <Skeleton className="h-7 w-12" /> : (
                    <p className="text-2xl font-bold">{(leadsReport?.byStatus ?? []).find((x: any) => x.status === "won")?.count ?? 0}</p>
                  )}
                  <p className="text-xs text-muted-foreground">صفقات مغلقة</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border shadow-sm md:col-span-1 col-span-2">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${TIL.gold}18` }}>
                  <BarChart3 className="w-5 h-5" style={{ color: TIL.gold }} />
                </div>
                <div>
                  {isLeadsLoading ? <Skeleton className="h-7 w-12" /> : (
                    <p className="text-2xl font-bold">
                      {(leadsReport?.bySource ?? []).length > 0
                        ? (SOURCE_LABELS_AR[(leadsReport.bySource as any[]).sort((a, b) => b.count - a.count)[0]?.source] ?? "—")
                        : "—"}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">المصدر الأكثر</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>مصادر العملاء</CardTitle>
                <CardDescription>من أين يأتي العملاء المحتملون</CardDescription>
              </CardHeader>
              <CardContent className="h-[320px]">
                {isLeadsLoading ? <Skeleton className="h-full w-full" /> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={(leadsReport?.bySource ?? []).map((x: any) => ({ ...x, name: SOURCE_LABELS_AR[x.source] ?? x.source }))}
                        cx="50%" cy="50%" innerRadius={75} outerRadius={115} paddingAngle={3}
                        dataKey="count" nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {(leadsReport?.bySource ?? []).map((_: unknown, i: number) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${v} عميل`, "العدد"]} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>توزيع حالات العملاء</CardTitle>
                <CardDescription>نسبة كل مرحلة من المراحل</CardDescription>
              </CardHeader>
              <CardContent className="h-[320px]">
                {isLeadsLoading ? <Skeleton className="h-full w-full" /> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={(leadsReport?.byStatus ?? []).map((x: any) => ({ ...x, nameAr: STATUS_LABELS_AR[x.status] ?? x.status }))}
                      layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                      <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="nameAr" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} width={80} />
                      <Tooltip contentStyle={tooltipStyle} cursor={chartCursor} formatter={(v: any) => [`${v} عميل`, "العدد"]} />
                      <Bar dataKey="count" name="عدد العملاء" fill={TIL.navyLight} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle>جدول تفصيلي</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الحالة</TableHead>
                    <TableHead className="text-center">العدد</TableHead>
                    <TableHead className="text-end">النسبة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(leadsReport?.byStatus ?? []).map((s: any) => (
                    <TableRow key={s.status}>
                      <TableCell className="font-medium">{STATUS_LABELS_AR[s.status] ?? s.status}</TableCell>
                      <TableCell className="text-center">{s.count}</TableCell>
                      <TableCell className="text-end">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: leadsReport?.total ? `${(s.count / leadsReport.total) * 100}%` : "0",
                                backgroundColor: TIL.gold,
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium tabular-nums">
                            {leadsReport?.total ? `${((s.count / leadsReport.total) * 100).toFixed(1)}%` : "0%"}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {leadsReport?.total && (
                    <TableRow className="font-bold border-t-2">
                      <TableCell>الإجمالي</TableCell>
                      <TableCell className="text-center">{leadsReport.total}</TableCell>
                      <TableCell className="text-end">100%</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── PROJECTS TAB ── */}
        <TabsContent value="projects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>أداء المشاريع</CardTitle>
              <CardDescription>العملاء المحتملون ومعدلات التحويل حسب المشروع</CardDescription>
            </CardHeader>
            <CardContent className="h-[320px]">
              {isProjectsLoading ? <Skeleton className="h-full w-full" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={(projectsReport?.projects ?? []).filter(p => p.total > 0).slice(0, 8)}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} cursor={chartCursor} formatter={(v: any, name: string) =>
                      [v, name === "won" ? "رابح" : name === "lost" ? "خاسر" : name === "inProgress" ? "جاري" : name]
                    } />
                    <Legend wrapperStyle={{ fontSize: 12 }} formatter={(v) => v === "won" ? "رابح" : v === "lost" ? "خاسر" : "جاري"} />
                    <Bar dataKey="won" name="won" stackId="a" fill={TIL.green} radius={[0, 0, 4, 4]} />
                    <Bar dataKey="lost" name="lost" stackId="a" fill={TIL.red} />
                    <Bar dataKey="inProgress" name="inProgress" stackId="a" fill={TIL.gold} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>تفاصيل المشاريع</CardTitle>
            </CardHeader>
            <CardContent>
              {isProjectsLoading ? <Skeleton className="h-48 w-full" /> : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>المشروع</TableHead>
                      <TableHead className="text-center">إجمالي</TableHead>
                      <TableHead className="text-center">رابح</TableHead>
                      <TableHead className="text-center">خاسر</TableHead>
                      <TableHead className="text-end">معدل التحويل</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(projectsReport?.projects ?? []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">لا توجد بيانات</TableCell>
                      </TableRow>
                    ) : (projectsReport?.projects ?? []).map((p, idx) => (
                      <TableRow key={p.id}>
                        <TableCell className="text-muted-foreground text-sm">#{idx + 1}</TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {p.imageUrl
                              ? <img src={p.imageUrl} alt={p.name} className="w-7 h-7 rounded object-cover shrink-0" />
                              : <div className="w-7 h-7 rounded bg-muted flex items-center justify-center shrink-0"><Building className="w-3.5 h-3.5 text-muted-foreground" /></div>
                            }
                            {p.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-semibold">{p.total}</TableCell>
                        <TableCell className="text-center font-bold" style={{ color: TIL.green }}>{p.won}</TableCell>
                        <TableCell className="text-center font-medium" style={{ color: TIL.red }}>{p.lost}</TableCell>
                        <TableCell className="text-end">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${p.convRate}%`, backgroundColor: TIL.green }} />
                            </div>
                            <span className="font-bold text-sm tabular-nums">{p.convRate}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── RESALE TAB ── */}
        <TabsContent value="resale" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "إجمالي الوحدات",    value: resaleReport?.total ?? 0,  icon: Home,          color: TIL.blue },
              { label: "وحدات متاحة",       value: resaleReport?.activeCount ?? 0, icon: ArrowUpRight, color: TIL.green },
              { label: "وحدات غير نشطة",   value: resaleReport?.inactiveCount ?? 0, icon: ArrowDownRight, color: TIL.amber },
              { label: "قيمة المحفظة",     value: resaleReport?.totalValue ? formatPrice(resaleReport.totalValue) : "ج.م ٠", icon: Target, color: TIL.gold },
            ].map((kpi) => (
              <Card key={kpi.label} className="border shadow-sm">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${kpi.color}18` }}>
                    <kpi.icon className="w-5 h-5" style={{ color: kpi.color }} />
                  </div>
                  <div>
                    {isResaleLoading ? <Skeleton className="h-7 w-16 mb-0.5" /> : <p className="text-lg font-bold">{kpi.value}</p>}
                    <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>الوحدات حسب النوع</CardTitle>
                <CardDescription>توزيع أنواع العقارات</CardDescription>
              </CardHeader>
              <CardContent className="h-[280px]">
                {isResaleLoading ? <Skeleton className="h-full w-full" /> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={resaleReport?.byType ?? []}
                        cx="50%" cy="50%" innerRadius={65} outerRadius={105} paddingAngle={3}
                        dataKey="count" nameKey="type"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {(resaleReport?.byType ?? []).map((_: unknown, i: number) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>أبرز المشاريع (إعادة البيع)</CardTitle>
                <CardDescription>المشاريع الأكثر وحدات</CardDescription>
              </CardHeader>
              <CardContent className="h-[280px]">
                {isResaleLoading ? <Skeleton className="h-full w-full" /> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={resaleReport?.byProject?.slice(0, 6) ?? []} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                      <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="project" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} width={110} />
                      <Tooltip contentStyle={tooltipStyle} cursor={chartCursor} formatter={(v: any) => [`${v} وحدة`, "العدد"]} />
                      <Bar dataKey="count" name="الوحدات" fill={TIL.gold} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>إعادة البيع حسب المشروع</CardTitle>
              <CardDescription>عدد الوحدات والقيمة الإجمالية</CardDescription>
            </CardHeader>
            <CardContent>
              {isResaleLoading ? <Skeleton className="h-48 w-full" /> : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">#</TableHead>
                      <TableHead>المشروع</TableHead>
                      <TableHead className="text-center">الوحدات</TableHead>
                      <TableHead className="text-end">قيمة المحفظة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(resaleReport?.byProject ?? []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">لا توجد وحدات إعادة بيع للفترة المختارة</TableCell>
                      </TableRow>
                    ) : (resaleReport?.byProject ?? []).map((p, idx) => (
                      <TableRow key={p.project}>
                        <TableCell className="text-muted-foreground">#{idx + 1}</TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 text-muted-foreground shrink-0" />{p.project}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{p.count}</Badge>
                        </TableCell>
                        <TableCell className="text-end font-medium">
                          {p.totalValue > 0 ? formatPrice(p.totalValue) : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
