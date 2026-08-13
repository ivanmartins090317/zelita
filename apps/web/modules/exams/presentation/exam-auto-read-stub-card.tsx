import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Note } from "@/components/ui/note";
import { Tag } from "@/components/ui/tag";
import { familyContent } from "@/content/family";

function ExamAutoReadStubCard() {
  const copy = familyContent.exames.autoRead;

  return (
    <Card>
      <CardHeader className="justify-between">
        <CardTitle>{copy.title}</CardTitle>
        <Tag tone="muted">{copy.tag}</Tag>
      </CardHeader>
      <CardBody className="space-y-4">
        <p className="text-secondary text-muted">{copy.body}</p>
        <Note icon="⛔" tone="critical">
          <strong>{copy.neverTitle}</strong> {copy.neverBody}
        </Note>
      </CardBody>
    </Card>
  );
}

export { ExamAutoReadStubCard };
