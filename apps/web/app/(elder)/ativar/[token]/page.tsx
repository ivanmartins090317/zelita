import { z } from "zod";

import { DEVICE_LINK_TOKEN_PATTERN } from "@/modules/elder-access/domain/device-link";
import { inspectDeviceLink } from "@/modules/elder-access/application/confirm-device-link";
import {
  ActivateDeviceScreen,
  DeviceLinkClosedScreen,
} from "@/modules/elder-access/presentation/activate-device-screen";

export const dynamic = "force-dynamic";

const tokenSchema = z.string().regex(DEVICE_LINK_TOKEN_PATTERN);

interface ActivatePageProps {
  params: Promise<{ token: string }>;
}

export default async function ActivatePage({ params }: ActivatePageProps) {
  const { token } = await params;
  const parsed = tokenSchema.safeParse(token);
  if (!parsed.success) return <DeviceLinkClosedScreen />;

  const state = await inspectDeviceLink(parsed.data);
  if (state !== "open") return <DeviceLinkClosedScreen />;

  return <ActivateDeviceScreen token={parsed.data} />;
}
