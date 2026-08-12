import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ListRow } from "@/components/ui/list-row";
import { Tag } from "@/components/ui/tag";
import { familyContent, familyRoutes } from "@/content/family";
import type { HojeDashboardViewModel } from "@/modules/accounts/application/get-hoje-dashboard";
import { HojeChecklistCard } from "@/modules/accounts/presentation/family/hoje-checklist-card";
import { WelcomeModal } from "@/modules/accounts/presentation/family/welcome-modal";

interface PrimeiroAcessoViewProps {
  data: HojeDashboardViewModel;
}

function resolveEmptyStatus(
  statusKey: "medications" | "members" | "geo" | "exams",
  data: HojeDashboardViewModel,
): string {
  switch (statusKey) {
    case "medications":
      return "Nenhum anotado";
    case "members":
      return data.activeMemberCount <= 1
        ? "Só você seria avisada"
        : `${data.activeMemberCount} pessoas na conta`;
    case "geo":
      return "Aguardando ele autorizar";
    case "exams":
      return "Nenhum guardado";
  }
}

function PrimeiroAcessoView({ data }: PrimeiroAcessoViewProps) {
  const copy = familyContent.hoje;
  const apelido = data.careRecipientDisplayName;
  const showMedCta = data.canManageMedications && !data.isPaused;

  return (
    <>
      <header className="mb-5">
        <h2 className="font-head text-[25px] font-extrabold text-brand-900">
          {data.greeting.headline}
        </h2>
        <p className="mt-1 text-[15.5px] text-muted">{data.greeting.contextLine}</p>
      </header>

      {data.whatsAppDryRun ? (
        <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          WhatsApp em modo seco (sem token). Lembretes ficam registrados; envio
          real quando WHATSAPP_* estiver no .env.local.
        </p>
      ) : null}

      {!data.canManageMedications ? (
        <p className="mb-4 rounded-note border border-line bg-white px-4 py-3 text-secondary text-muted">
          {copy.primeiroAcesso.viewerHint}
        </p>
      ) : null}

      {data.isPaused ? (
        <p className="mb-4 rounded-note border border-amber-line bg-amber-bg px-4 py-3 text-secondary text-amber-ink">
          {copy.primeiroAcesso.pausedHint}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <HojeChecklistCard
            variant="primeiro_acesso"
            checklist={data.checklist}
            canManageMedications={data.canManageMedications}
            isPaused={data.isPaused}
            medicationCount={0}
          />

          <Card>
            <CardHeader>
              <CardTitle>
                {copy.primeiroAcesso.dayCardTitle.replace("{apelido}", apelido)}
              </CardTitle>
            </CardHeader>
            <CardBody>
              <EmptyState
                icon={copy.emptyDay.icon}
                title={copy.emptyDay.title}
                description={copy.emptyDay.description}
                action={
                  showMedCta ? (
                    <Button asChild>
                      <Link href={familyRoutes.remedios}>{copy.emptyDay.cta}</Link>
                    </Button>
                  ) : undefined
                }
              />
            </CardBody>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-2 border-brand-400">
            <CardBody className="space-y-3 text-center">
              <div className="text-[34px]">🎓</div>
              <h3 className="font-head text-lg font-extrabold text-ink">
                {copy.primeiroAcesso.tourTitle}
              </h3>
              <p className="text-secondary text-muted">
                {copy.primeiroAcesso.tourBody}
              </p>
              <Button className="w-full" asChild>
                <Link href={familyRoutes.guia}>
                  {copy.primeiroAcesso.tourPrimary}
                </Link>
              </Button>
              <Button variant="secondary" className="w-full" asChild>
                <Link href={familyRoutes.guia}>
                  {copy.primeiroAcesso.tourSecondary}
                </Link>
              </Button>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{copy.primeiroAcesso.emptyPanelTitle}</CardTitle>
            </CardHeader>
            <div>
              {copy.primeiroAcesso.emptyPanelItems.map((item) => (
                <ListRow
                  key={item.id}
                  icon={item.icon}
                  title={item.title}
                  subtitle={resolveEmptyStatus(item.getStatus, data)}
                  trailing={
                    item.tag ? (
                      <Tag tone="warning">{item.tag}</Tag>
                    ) : item.href && showMedCta && item.id === "medications" ? (
                      <Button variant="secondary" size="xs" asChild>
                        <Link href={item.href}>{item.ctaLabel}</Link>
                      </Button>
                    ) : item.href && item.id !== "medications" ? (
                      <Button variant="secondary" size="xs" asChild>
                        <Link href={item.href}>{item.ctaLabel}</Link>
                      </Button>
                    ) : undefined
                  }
                />
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {copy.primeiroAcesso.whatsAppCardTitle.replace(
                  "{apelido}",
                  apelido,
                )}
              </CardTitle>
            </CardHeader>
            <CardBody className="space-y-3 text-secondary text-muted">
              <p>
                {copy.primeiroAcesso.whatsAppIntro}{" "}
                <strong className="text-ink">
                  {copy.primeiroAcesso.whatsAppNote}
                </strong>
              </p>
              <div className="rounded-xl bg-[#DCF8C6] px-3.5 py-3 text-body text-ink">
                {copy.primeiroAcesso.whatsAppBubble.replace("{apelido}", apelido)}
              </div>
              <Button variant="secondary" size="xs" disabled>
                {copy.primeiroAcesso.whatsAppCta}
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>

      <WelcomeModal
        accountId={data.accountId}
        profileName={data.profileName}
        trialDays={data.trialDays}
        enabled
      />
    </>
  );
}

export { PrimeiroAcessoView };
