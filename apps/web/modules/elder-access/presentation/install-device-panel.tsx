"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
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
      {maskedWhatsapp ? (
        <p className="text-secondary">
          {copy.whatsappLine.replace("{mascara}", maskedWhatsapp)}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{hasDevice ? devices[0]?.statusLine : copy.none}</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3">
          {hasDevice && canManage
            ? devices.map((device) => (
                <form key={device.id} action={revokeAction}>
                  <input type="hidden" name="deviceId" value={device.id} />
                  <Button type="submit" variant="secondary" disabled={revokePending}>
                    {copy.revoke}
                  </Button>
                </form>
              ))
            : null}
          {!canManage ? <p className="text-secondary">{copy.caregiverNote}</p> : null}
          {revokeState.message ? (
            <p className={revokeState.ok ? "text-secondary" : "text-coral-dark"}>
              {revokeState.message}
            </p>
          ) : null}
        </CardBody>
      </Card>

      {canManage && !hasDevice ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{copy.remoteTitle}</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              <p className="text-secondary">{copy.remoteHint}</p>
              <form action={issueAction}>
                <input type="hidden" name="channel" value={DEVICE_LINK_CHANNELS.whatsapp} />
                <Button type="submit" disabled={issuePending}>
                  {copy.remoteButton}
                </Button>
              </form>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{copy.inPersonTitle}</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              <p className="text-secondary">{copy.inPersonHint}</p>
              <form action={issueAction}>
                <input type="hidden" name="channel" value={DEVICE_LINK_CHANNELS.inPerson} />
                <Button type="submit" variant="secondary" disabled={issuePending}>
                  {copy.inPersonButton}
                </Button>
              </form>
            </CardBody>
          </Card>
        </div>
      ) : null}

      {issueState.message ? (
        <Card>
          <CardBody className="space-y-3">
            <p className={issueState.ok ? "font-bold text-ink" : "font-bold text-coral-dark"}>
              {issueState.message}
            </p>
            {issueState.url ? (
              <>
                <p className="text-[1.75rem] leading-snug font-bold break-all text-brand-800">
                  {issueState.url}
                </p>
                <p className="text-secondary">{copy.onceNote}</p>
                <p className="text-secondary">
                  <a className="text-brand-700 underline" href={familyRoutes.ajustes}>
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
