import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Note } from "@/components/ui/note";
import { Tag } from "@/components/ui/tag";
import { familyContent } from "@/content/family";
import type { PlanoPageViewModel } from "@/modules/billing/application/get-plano-page";
import { PlanoBillingActions } from "@/modules/billing/presentation/plano-billing-actions";

interface PlanoCurrentCardProps {
  data: PlanoPageViewModel;
}

function PlanoCurrentCard({ data }: PlanoCurrentCardProps) {
  const copy = familyContent.plano.currentCard;

  return (
    <Card>
      <CardHeader className="justify-between">
        <CardTitle>{copy.title}</CardTitle>
        <Tag tone={data.statusTagTone}>{data.statusTagLabel}</Tag>
      </CardHeader>
      <CardBody>
        {data.trialBadge && data.trialRemainingDays != null ? (
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-note border-[1.5px] border-brand-200 bg-brand-50 px-4 py-3.5 text-body text-brand-800">
            <Tag tone="info" className="font-extrabold">
              {data.trialBadge}
            </Tag>
            <p className="min-w-[200px] flex-1 text-[15px] leading-snug">
              {copy.trial.bodyPrefix}
              <strong>{copy.trial.bodyBold}</strong>
              {copy.trial.bodySuffix.replace(
                "{days}",
                String(data.trialRemainingDays),
              )}
            </p>
          </div>
        ) : null}

        <p className="font-head text-[26px] font-extrabold text-brand-800">
          {data.planPriceLine}
        </p>

        <p className="mt-1.5 text-secondary text-muted">
          {data.billingParagraph}
          {data.billingParagraphEmphasis ? (
            <>
              {" "}
              <strong>{data.billingParagraphEmphasis}</strong>
            </>
          ) : null}
        </p>

        {data.showUnknownPlanNote ? (
          <Note tone="warning" icon="⚠️" className="mt-4">
            {copy.billing.unknownPlan}
          </Note>
        ) : null}

        <Note tone="info" icon="💡" className="mt-4">
          {data.elderNote}
        </Note>

        <PlanoBillingActions
          showReactivateCta={data.showReactivateCta}
          supportMailto={data.supportMailto}
        />
      </CardBody>
    </Card>
  );
}

export { PlanoCurrentCard };
