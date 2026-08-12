import { ListRow } from "@/components/ui/list-row";
import { Tag } from "@/components/ui/tag";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { familyContent } from "@/content/family";
import type { ActivityFeedItem } from "@/modules/medications/domain/hoje-timeline";

interface HojeActivityFeedProps {
  items: ActivityFeedItem[];
}

function HojeActivityFeed({ items }: HojeActivityFeedProps) {
  const copy = familyContent.hoje.maduro;

  if (items.length === 0) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>{copy.activityTitle}</CardTitle>
        </CardHeader>
        <CardBody>
          <p className="text-secondary text-muted">{copy.activityEmpty}</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>{copy.activityTitle}</CardTitle>
      </CardHeader>
      <div>
        {items.map((item) => (
          <ListRow
            key={item.id}
            icon={item.initials}
            title={item.title}
            subtitle={item.subtitle}
            trailing={
              item.roleLabel ? (
                <Tag tone="info">{item.roleLabel}</Tag>
              ) : undefined
            }
          />
        ))}
      </div>
    </Card>
  );
}

export { HojeActivityFeed };
