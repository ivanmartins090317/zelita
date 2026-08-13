import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { familyContent } from "@/content/family";
import { getExamSharePage } from "@/modules/exams/application/get-exam-share-page";
import { getLocationSharePage } from "@/modules/location/application/get-location-share-page";
import { LocationSharePublicView } from "@/modules/location/presentation/location-share-public-view";

interface PublicSharePageProps {
  params: Promise<{ token: string }>;
}

export default async function PublicSharePage({ params }: PublicSharePageProps) {
  const { token } = await params;

  const examData = await getExamSharePage(token);
  if (examData.state === "ready") {
    const copy = familyContent.exames.sharePublic;

    return (
      <main className="mx-auto flex min-h-full w-full max-w-[720px] flex-1 flex-col justify-center px-6 py-12">
        <Card>
          <CardHeader>
            <CardTitle>
              {examData.title} · {examData.examDateLabel}
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex min-h-[240px] items-center justify-center rounded-card border-2 border-dashed border-sand-3 bg-sand/40 p-4">
              {examData.downloadUrl && examData.isImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={examData.downloadUrl}
                  alt={examData.title ?? "Exame"}
                  className="max-h-[360px] w-full object-contain"
                />
              ) : examData.downloadUrl && examData.isPdf ? (
                <iframe
                  src={examData.downloadUrl}
                  title={examData.title ?? "Exame"}
                  className="h-[360px] w-full rounded-card bg-white"
                />
              ) : null}
            </div>
            {examData.downloadUrl ? (
              <Button asChild className="min-h-11 w-full">
                <a href={examData.downloadUrl} target="_blank" rel="noreferrer">
                  {copy.download}
                </a>
              </Button>
            ) : null}
          </CardBody>
        </Card>
      </main>
    );
  }

  const locationData = await getLocationSharePage(token);
  return <LocationSharePublicView data={locationData} />;
}
