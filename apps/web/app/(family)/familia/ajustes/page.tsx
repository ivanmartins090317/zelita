import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { familyContent } from "@/content/family";
import { signOut } from "@/modules/accounts/application/auth-actions";

export default function AjustesPage() {
  const placeholder = familyContent.placeholders.ajustes;

  return (
    <div className="mx-auto mt-4 max-w-lg space-y-4">
      <EmptyState
        icon={placeholder.icon}
        title={placeholder.title}
        description={placeholder.description}
        className="bg-white"
        action={
          <form action={signOut}>
            <Button type="submit" variant="outline" size="sm">
              {familyContent.topbar.signOutLabel}
            </Button>
          </form>
        }
      />
      <p className="text-center text-secondary text-muted">
        {familyContent.ajustes.signOutDescription}
      </p>
    </div>
  );
}
