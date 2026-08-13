import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ListRow } from "@/components/ui/list-row";
import { Note } from "@/components/ui/note";
import { Tag } from "@/components/ui/tag";
import { Timeline } from "@/components/ui/timeline";
import { familyContent, familyRoutes } from "@/content/family";
import type { HojeDashboardViewModel } from "@/modules/accounts/application/get-hoje-dashboard";
import { HojeActivityFeed } from "@/modules/accounts/presentation/family/hoje-activity-feed";
import { HojeChecklistCard } from "@/modules/accounts/presentation/family/hoje-checklist-card";
import { HojeStats } from "@/modules/accounts/presentation/family/hoje-stats";

interface HojeMaduroViewProps {
  data: HojeDashboardViewModel;
}

function HojeMaduroView({ data }: HojeMaduroViewProps) {
  const copy = familyContent.hoje;
  const apelido = data.careRecipientDisplayName;
  const stats = data.stats;

  const timelineItems = data.timeline.map((item, index) => ({
    id: `${item.timeLabel}-${index}`,
    timeLabel: item.timeLabel,
    title: item.title,
    subtitle: item.subtitle,
    variant: item.variant,
    href: item.href,
    linkLabel: item.linkLabel,
  }));

  return (
    <>
      <header className="mb-5">
        <h2 className="font-head text-[23px] font-extrabold text-brand-900">
          {data.greeting.headline}
        </h2>
        <p className="mt-1 capitalize text-muted">{data.greeting.contextLine}</p>
      </header>

      {data.whatsAppDryRun ? (
        <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          WhatsApp em modo seco (sem token). Lembretes ficam registrados; envio
          real quando WHATSAPP_* estiver no .env.local.
        </p>
      ) : null}

      {stats ? (
        <HojeStats
          nextMedication={stats.nextMedication}
          refillSummary={stats.refillSummary}
          locationStat={stats.locationStat}
          noticesStat={stats.noticesStat}
        />
      ) : null}

      <Note icon="🛡" tone="info" className="mb-5">
        {copy.maduro.reminderNote}
      </Note>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader className="justify-between">
            <CardTitle>
              {copy.maduro.timelineCardTitle.replace("{apelido}", apelido)}
            </CardTitle>
            <Button variant="secondary" size="xs" asChild>
              <Link href={familyRoutes.consultas}>{copy.maduro.weekButton}</Link>
            </Button>
          </CardHeader>
          <CardBody>
            {timelineItems.length > 0 ? (
              <Timeline items={timelineItems} />
            ) : (
              <EmptyState
                icon={copy.emptyDay.icon}
                title={copy.emptyDay.title}
                description={copy.emptyDay.description}
              />
            )}
          </CardBody>
        </Card>

        <div className="space-y-4">
          <HojeChecklistCard
            variant="central"
            checklist={data.checklist}
            canManageMedications={data.canManageMedications}
            isPaused={data.isPaused}
            medicationCount={data.activeMedicationCount}
            examCount={data.activeExamCount}
            activeMemberCount={data.activeMemberCount}
            trailing={
              <Button variant="secondary" size="xs" asChild>
                <Link href={familyRoutes.guia}>{copy.maduro.centralTour}</Link>
              </Button>
            }
          />

          <Card>
            <CardHeader>
              <CardTitle>{copy.maduro.needsTitle}</CardTitle>
            </CardHeader>
            {data.needsAttention.length > 0 ? (
              <div>
                {data.needsAttention.map((item) => (
                  <ListRow
                    key={item.id}
                    icon={item.icon}
                    title={item.title}
                    subtitle={item.subtitle}
                    className={
                      item.id.startsWith("sos-open-")
                        ? "bg-coral-bg/40"
                        : "bg-amber-bg/30"
                    }
                    trailing={
                      item.href ? (
                        <Button variant="secondary" size="xs" asChild>
                          <Link href={item.href}>
                            {item.id.startsWith("sos-open-")
                              ? "Ver pedido"
                              : copy.maduro.weekButton}
                          </Link>
                        </Button>
                      ) : null
                    }
                  />
                ))}
              </div>
            ) : (
              <CardBody>
                <p className="text-secondary text-muted">{copy.maduro.needsEmpty}</p>
              </CardBody>
            )}
          </Card>

          <Card>
            <CardHeader className="justify-between">
              <CardTitle>{copy.maduro.weeklyTitle}</CardTitle>
              <Tag tone="muted">{copy.maduro.weeklyTag}</Tag>
            </CardHeader>
            <CardBody className="space-y-3 text-secondary text-muted">
              <p>{copy.maduro.weeklyBody}</p>
              <p className="text-compact">{copy.maduro.weeklyExtra}</p>
            </CardBody>
          </Card>
        </div>
      </div>

      <HojeActivityFeed items={data.activityFeed} />
    </>
  );
}

export { HojeMaduroView };
