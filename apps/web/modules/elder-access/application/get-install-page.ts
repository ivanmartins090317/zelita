import { familyContent } from "@/content/family";
import { getFamilyContext } from "@/modules/accounts";
import { readCareChannelForDeviceLink } from "@/modules/care-recipients";
import {
  canManageElderDevice,
  canViewElderDevices,
  deviceStatusLine,
  maskWhatsapp,
} from "@/modules/elder-access/domain/device-link";
import {
  createFamilyDeviceClient,
  listActiveDeviceSummaries,
} from "@/modules/elder-access/infrastructure/device-link-store";

export interface InstallDeviceRow {
  id: string;
  statusLine: string;
}

export interface InstallDevicePageData {
  canManage: boolean;
  maskedWhatsapp: string | null;
  devices: InstallDeviceRow[];
}

export type InstallDevicePageResult =
  | { ok: true; data: InstallDevicePageData }
  | { ok: false; reason: "forbidden" | "load_failed"; message: string };

export async function getInstallDevicePage(): Promise<InstallDevicePageResult> {
  const copy = familyContent.ajustes.errors;
  try {
    const ctx = await getFamilyContext();
    if (!ctx.accountId || !ctx.role || !ctx.careRecipientId) {
      return { ok: false, reason: "forbidden", message: copy.incomplete };
    }
    if (!canViewElderDevices(ctx.role)) {
      return { ok: false, reason: "forbidden", message: copy.accessDenied };
    }

    const supabase = await createFamilyDeviceClient();
    const devices = await listActiveDeviceSummaries(
      supabase,
      ctx.accountId,
      ctx.careRecipientId,
    );
    const canManage = canManageElderDevice(ctx.role);
    const channel = canManage ? await readCareChannelForDeviceLink() : null;

    return {
      ok: true,
      data: {
        canManage,
        maskedWhatsapp: channel ? maskWhatsapp(channel.whatsapp) : null,
        devices: devices.map((device) => ({
          id: device.id,
          statusLine: deviceStatusLine({
            label: device.label,
            linkedAt: new Date(device.linkedAt),
          }),
        })),
      },
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : familyContent.install.loadFailed;
    return { ok: false, reason: "load_failed", message };
  }
}

export async function readElderDeviceSubtitle(): Promise<string | null> {
  const page = await getInstallDevicePage();
  if (!page.ok) return null;
  return page.data.devices[0]?.statusLine ?? familyContent.install.none;
}
