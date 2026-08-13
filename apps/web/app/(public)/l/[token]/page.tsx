import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { familyContent } from "@/content/family";
import { getExamSharePage } from "@/modules/exams/application/get-exam-share-page";

interface ExamSharePublicPageProps {
  params: Promise<{ token: string }>;
}

export default async function ExamSharePublicPage({
  params,
}: ExamSharePublicPageProps) {
  const { token } = await params;
  const data = await getExamSharePage(token);
  const copy = familyContent.exames.sharePublic;

  if (data.state !== "ready") {
    return (
      <main className="mx-auto flex min-h-full w-full max-w-[520px] flex-1 flex-col justify-center px-6 py-12">
        <EmptyState
          icon="🔗"
          title={copy.expiredTitle}
          description={copy.expiredBody}
        />
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-[720px] flex-1 flex-col justify-center px-6 py-12">
      <Card>
        <CardHeader>
          <CardTitle>
            {data.title} · {data.examDateLabel}
          </CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex min-h-[240px] items-center justify-center rounded-card border-2 border-dashed border-sand-3 bg-sand/40 p-4">
            {data.downloadUrl && data.isImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.downloadUrl}
                alt={data.title ?? "Exame"}
                className="max-h-[360px] w-full object-contain"
              />
            ) : data.downloadUrl && data.isPdf ? (
              <iframe
                src={data.downloadUrl}
                title={data.title ?? "Exame"}
                className="h-[360px] w-full rounded-card bg-white"
              />
            ) : null}
          </div>
          {data.downloadUrl ? (
            <Button asChild className="min-h-11 w-full">
              <a href={data.downloadUrl} target="_blank" rel="noreferrer">
                {copy.download}
              </a>
            </Button>
          ) : null}
        </CardBody>
      </Card>
    </main>
  );
}
