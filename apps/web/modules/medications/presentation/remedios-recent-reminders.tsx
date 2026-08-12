import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { ListRow } from "@/components/ui/list-row";
import { familyContent } from "@/content/family";
import type { RemediosRecentReminderItem } from "@/modules/medications/application/get-remedios-page";

interface RemediosRecentRemindersProps {
  items: RemediosRecentReminderItem[];
}

function RemediosRecentReminders({ items }: RemediosRecentRemindersProps) {
  const copy = familyContent.remedios.recentReminders;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.title}</CardTitle>
      </CardHeader>
      <CardBody className="p-0">
        {items.length === 0 ? (
          <p className="px-5 py-4 text-sm text-muted">{copy.empty}</p>
        ) : (
          items.map((item) => (
            <ListRow
              key={item.id}
              icon="✓"
              title={item.timeLabel}
              subtitle={item.detail}
            />
          ))
        )}
      </CardBody>
    </Card>
  );
}

export { RemediosRecentReminders };
