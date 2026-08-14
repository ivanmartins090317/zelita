import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { ListRow } from "@/components/ui/list-row";
import { Tag } from "@/components/ui/tag";
import { familyContent } from "@/content/family";
import type { PlanoUsageLineViewModel } from "@/modules/billing/application/get-plano-page";

interface PlanoUsageCardProps {
  usageLines: PlanoUsageLineViewModel[];
}

function PlanoUsageCard({ usageLines }: PlanoUsageCardProps) {
  const copy = familyContent.plano.usageCard;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.title}</CardTitle>
      </CardHeader>
      <CardBody className="p-0">
        {usageLines.map((line) => (
          <ListRow
            key={line.label}
            icon={line.icon}
            title={line.label}
            subtitle={line.subtitle}
            trailing={
              line.isOverQuota ? (
                <Tag tone="warning">{copy.storage.overQuotaTag}</Tag>
              ) : null
            }
          />
        ))}
      </CardBody>
    </Card>
  );
}

export { PlanoUsageCard };
