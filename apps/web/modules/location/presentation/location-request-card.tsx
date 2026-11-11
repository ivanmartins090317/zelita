"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import type { LocationRequestCardViewModel } from "@/modules/location/application/get-localizacao-page";
import { createLocationRequestAction } from "@/modules/location/application/request-device-location";

interface LocationRequestCardProps {
  card: LocationRequestCardViewModel;
}

const POLL_MS = 12_000;

export function LocationRequestCard({ card }: LocationRequestCardProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!card.pollWhileOpen) return undefined;
    const id = window.setInterval(() => router.refresh(), POLL_MS);
    return () => window.clearInterval(id);
  }, [card.pollWhileOpen, router]);

  function handleRequest() {
    setFeedback(null);
    startTransition(() => {
      void createLocationRequestAction().then((result) => {
        if (result.message) setFeedback(result.message);
        if (result.ok) router.refresh();
      });
    });
  }

  const statusText = feedback ?? card.statusMessage;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{card.title}</CardTitle>
      </CardHeader>
      <CardBody className="space-y-3">
        <p className="text-secondary text-muted">{card.hint}</p>
        {statusText ? (
          <p className="rounded-lg border border-line-2 bg-sand px-3 py-2 text-secondary font-medium text-ink">
            {statusText}
          </p>
        ) : null}
        {card.canSubmit ? (
          <Button
            type="button"
            variant="default"
            disabled={pending}
            onClick={handleRequest}
          >
            {pending ? card.buttonPendingLabel : card.buttonLabel}
          </Button>
        ) : null}
      </CardBody>
    </Card>
  );
}
