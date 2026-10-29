import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { familyContent, familyRoutes } from "@/content/family";

export interface HojeDeviceCardStatus {
  visible: boolean;
  canManage: boolean;
  hasDevice: boolean;
  statusLine: string;
}

interface HojeDeviceCardProps {
  status: HojeDeviceCardStatus;
}

function HojeDeviceCard({ status }: HojeDeviceCardProps) {
  if (!status.visible) return null;

  const copy = familyContent.hoje.deviceCard;

  return (
    <Card className={status.hasDevice ? "mb-5" : "mb-5 border-brand-400"}>
      <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h3 className="font-head text-lg font-extrabold text-brand-900">
            {copy.title}
          </h3>
          <p className="mt-1 font-semibold text-ink">{status.statusLine}</p>
          <p className="mt-1 text-secondary text-muted">
            {status.hasDevice ? copy.linkedLead : copy.emptyLead}
          </p>
        </div>
        {status.canManage ? (
          <Button
            className="shrink-0"
            variant={status.hasDevice ? "secondary" : "primary"}
            asChild
          >
            <Link href={familyRoutes.instalar}>
              {status.hasDevice ? copy.viewButton : copy.installButton}
            </Link>
          </Button>
        ) : null}
      </CardBody>
    </Card>
  );
}

export { HojeDeviceCard };
