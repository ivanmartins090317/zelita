import { Button } from "@/components/ui/button";
import { familyContent } from "@/content/family";
import { signOut } from "@/modules/accounts/application/auth-actions";

function AjustesSignOutFooter() {
  const copy = familyContent.ajustes;

  return (
    <div className="mx-auto mt-6 max-w-5xl space-y-3 text-center">
      <form action={signOut}>
        <Button type="submit" variant="outline" size="sm">
          {copy.signOut.button}
        </Button>
      </form>
      <p className="text-secondary text-muted">{copy.signOutDescription}</p>
    </div>
  );
}

export { AjustesSignOutFooter };
