import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { familyContent } from "@/content/family";

function LocationLimitationsCard() {
  const copy = familyContent.localizacao.limitations;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.title}</CardTitle>
      </CardHeader>
      <CardBody className="space-y-3 text-secondary text-muted">
        {copy.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </CardBody>
    </Card>
  );
}

export { LocationLimitationsCard };
