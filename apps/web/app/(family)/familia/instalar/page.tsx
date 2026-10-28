import { EmptyState } from "@/components/ui/empty-state";
import { familyContent } from "@/content/family";
import { getInstallDevicePage } from "@/modules/elder-access/application/get-install-page";
import { InstallDevicePanel } from "@/modules/elder-access/presentation/install-device-panel";

export const dynamic = "force-dynamic";

export default async function InstalarPage() {
  const result = await getInstallDevicePage();
  const copy = familyContent.install;

  if (!result.ok) {
    return (
      <EmptyState
        icon="📱"
        title={
          result.reason === "forbidden"
            ? familyContent.ajustes.errors.accessDenied
            : familyContent.ajustes.errors.loadTitle
        }
        description={result.message}
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <header>
        <h1 className="font-head text-2xl font-extrabold text-brand-900">{copy.title}</h1>
        <p className="mt-2 text-secondary">{copy.lead}</p>
      </header>
      <InstallDevicePanel
        canManage={result.data.canManage}
        maskedWhatsapp={result.data.maskedWhatsapp}
        devices={result.data.devices}
      />
    </div>
  );
}
