import { useParams } from "wouter";
import { useGetClient, useListLeads } from "@workspace/api-client-react";
import { useI18n } from "@/contexts/i18nContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { ArrowLeft, Phone, Mail, Building, Calendar } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { format } from "date-fns";

export function ClientDetailPage() {
  const { t } = useI18n();
  const { id } = useParams<{ id: string }>();
  const { data: client, isLoading } = useGetClient(id!);
  const { data: leads = [] } = useListLeads();
  const clientLeads = leads.filter((l) => l.email === client?.email || l.phone === client?.phone);

  if (isLoading) return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );

  if (!client) return (
    <div className="text-center py-16 text-muted-foreground">{t("clients.not_found")}</div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/clients">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="w-4 h-4" /> {t("clients.back")}
          </Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="pt-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
              {client.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold">{client.name}</h2>
              {client.company && <p className="text-muted-foreground text-sm flex items-center gap-1"><Building className="w-3 h-3" /> {client.company}</p>}
            </div>
            <div className="space-y-2 text-sm">
              {client.phone && (
                <a href={`tel:${client.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                  <Phone className="w-4 h-4" /> {client.phone}
                </a>
              )}
              {client.email && (
                <a href={`mailto:${client.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                  <Mail className="w-4 h-4" /> {client.email}
                </a>
              )}
            </div>
            {client.createdAt && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {t("clients.added")} {format(new Date(client.createdAt), "MMM yyyy")}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">{t("clients.leads_section")} ({clientLeads.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {clientLeads.length === 0
              ? <p className="text-sm text-muted-foreground text-center py-8">{t("leads.no_leads")}</p>
              : clientLeads.map((lead) => (
                <Link key={lead.id} href={`/leads/${lead.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/40 transition-colors cursor-pointer">
                    <div>
                      <p className="font-medium text-sm">{lead.name}</p>
                      <p className="text-xs text-muted-foreground">{lead.projectName ?? t("common.none")}</p>
                    </div>
                    <StatusBadge status={lead.status} />
                  </div>
                </Link>
              ))
            }
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
