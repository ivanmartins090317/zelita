"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { familyContent, familyRoutes } from "@/content/family";
import { DEVICE_LINK_CHANNELS } from "@/modules/elder-access/domain/device-link";
import type { DeviceLinkActionState } from "@/modules/elder-access/application/device-link-actions";
import type { InstallDeviceRow } from "@/modules/elder-access/application/get-install-page";
import {
  issueDeviceLinkAction,
  revokeElderDeviceAction,
} from "@/modules/elder-access/application/device-link-actions";

interface InstallDevicePanelProps {
  canManage: boolean;
  maskedWhatsapp: string | null;
  devices: InstallDeviceRow[];
}

const initialState: DeviceLinkActionState = { ok: true, message: "" };

export function InstallDevicePanel({
  canManage,
  maskedWhatsapp,
  devices,
}: InstallDevicePanelProps) {
  const copy = familyContent.install;
  const [issueState, issueAction, issuePending] = useActionState(
    issueDeviceLinkAction,
    initialState,
  );
  const [revokeState, revokeAction, revokePending] = useActionState(
    revokeElderDeviceAction,
    initialState,
  );
  const hasDevice = devices.length > 0;

  return (
    <div className="space-y-4">
      {/* Situação atual: uma linha de status, não um card vazio. */}
      <div className="rounded-note border border-line bg-white px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-body font-bold text-ink">
            <span
              aria-hidden
              className={cn(
                "inline-block h-2.5 w-2.5 shrink-0 rounded-full",
                hasDevice ? "bg-brand-500" : "bg-line",
              )}
            />
            {hasDevice ? devices[0]?.statusLine : copy.none}
          </p>
          {hasDevice && canManage
            ? devices.map((device) => (
                <form key={device.id} action={revokeAction}>
                  <input type="hidden" name="deviceId" value={device.id} />
                  <Button
                    type="submit"
                    variant="secondary"
                    size="sm"
                    disabled={revokePending}
                  >
                    {copy.revoke}
                  </Button>
                </form>
              ))
            : null}
        </div>
        {!canManage ? (
          <p className="mt-2 text-secondary">{copy.caregiverNote}</p>
        ) : null}
        {revokeState.message ? (
          <p
            className={cn(
              "mt-2",
              revokeState.ok ? "text-secondary" : "text-coral-dark",
            )}
          >
            {revokeState.message}
          </p>
        ) : null}
      </div>

      {canManage && !hasDevice ? (
        <Card>
          <CardHeader>
            <CardTitle>{copy.chooseTitle}</CardTitle>
          </CardHeader>
          <CardBody className="space-y-5">
            <section>
              <h4 className="text-body font-bold text-ink">
                {copy.remoteTitle}
              </h4>
              <p className="mt-1 text-secondary">
                {copy.remoteHint}
                {maskedWhatsapp
                  ? ` ${copy.whatsappLine.replace("{mascara}", maskedWhatsapp)}`
                  : null}
              </p>
              <form action={issueAction} className="mt-3">
                <input
                  type="hidden"
                  name="channel"
                  value={DEVICE_LINK_CHANNELS.whatsapp}
                />
                <Button
                  type="submit"
                  disabled={issuePending}
                  className="w-full sm:w-auto"
                >
                  {copy.remoteButton}
                </Button>
              </form>
            </section>

            <div aria-hidden className="h-px bg-line-2" />

            <section>
              <h4 className="text-body font-bold text-ink">
                {copy.inPersonTitle}
              </h4>
              <p className="mt-1 text-secondary">{copy.inPersonHint}</p>
              <form action={issueAction} className="mt-3">
                <input
                  type="hidden"
                  name="channel"
                  value={DEVICE_LINK_CHANNELS.inPerson}
                />
                <Button
                  type="submit"
                  variant="secondary"
                  disabled={issuePending}
                  className="w-full sm:w-auto"
                >
                  {copy.inPersonButton}
                </Button>
              </form>
            </section>
          </CardBody>
        </Card>
      ) : null}

      {issueState.message ? (
        <Card>
          <CardBody className="space-y-3">
            <p
              className={
                issueState.ok
                  ? "font-bold text-ink"
                  : "font-bold text-coral-dark"
              }
            >
              {issueState.message}
            </p>
            {issueState.url ? (
              <>
                <p className="text-[1.75rem] leading-snug font-bold break-all text-brand-800">
                  {issueState.url}
                </p>
                <p className="text-secondary">{copy.onceNote}</p>
                <p className="text-secondary">
                  <a
                    className="text-brand-700 underline"
                    href={familyRoutes.ajustes}
                  >
                    {familyContent.ajustes.privacy.devicesTitle}
                  </a>
                </p>
              </>
            ) : null}
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}
