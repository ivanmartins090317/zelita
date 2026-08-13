"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Note } from "@/components/ui/note";
import { familyContent } from "@/content/family";
import {
  acceptInviteAction,
  type AcceptInviteActionResult,
} from "@/modules/accounts/application/accept-invite-action";
import { getRoleDisplayLabel } from "@/modules/accounts/domain/roles";
import type { AccountRole } from "@/modules/accounts/domain/roles";

interface AcceptInviteViewProps {
  token: string;
  state: "ready" | "expired" | "already_accepted" | "not_found";
  inviterName: string | null;
  role: AccountRole | null;
  careRecipientDisplayName: string | null;
  invitedEmail: string | null;
  isAuthenticated: boolean;
  emailMatches: boolean;
}

const initialState: AcceptInviteActionResult = { ok: false };

function AcceptInviteView({
  token,
  state,
  inviterName,
  role,
  careRecipientDisplayName,
  invitedEmail,
  isAuthenticated,
  emailMatches,
}: AcceptInviteViewProps) {
  const copy = familyContent.participantes.accept;
  const [actionState, formAction, isPending] = useActionState(
    acceptInviteAction,
    initialState,
  );

  if (state === "expired") {
    return (
      <Card>
        <CardBody className="p-6">
          <h1 className="font-head text-2xl font-extrabold text-brand-900">
            {copy.expiredTitle}
          </h1>
          <p className="mt-3 text-body text-muted">{copy.expiredBody}</p>
        </CardBody>
      </Card>
    );
  }

  if (state === "already_accepted") {
    return (
      <Card>
        <CardBody className="p-6">
          <h1 className="font-head text-2xl font-extrabold text-brand-900">
            {copy.alreadyAcceptedTitle}
          </h1>
          <p className="mt-3 text-body text-muted">{copy.alreadyAcceptedBody}</p>
          <Button className="mt-5" asChild>
            <Link href="/entrar">{copy.enterPanelCta}</Link>
          </Button>
        </CardBody>
      </Card>
    );
  }

  if (state === "not_found") {
    return (
      <Card>
        <CardBody className="p-6">
          <h1 className="font-head text-2xl font-extrabold text-brand-900">
            {copy.notFoundTitle}
          </h1>
          <p className="mt-3 text-body text-muted">{copy.notFoundBody}</p>
        </CardBody>
      </Card>
    );
  }

  const loginHref = `/entrar?retorno=${encodeURIComponent(`/convite/${token}`)}`;

  return (
    <Card>
      <CardBody className="p-6">
        <h1 className="font-head text-2xl font-extrabold text-brand-900">
          {copy.title}
        </h1>

        {inviterName ? (
          <p className="mt-3 text-body text-muted">
            {copy.invitedByTemplate.replace("{nome}", inviterName)}
          </p>
        ) : null}

        {role ? (
          <p className="mt-1 text-body text-muted">
            {copy.roleTemplate.replace("{papel}", getRoleDisplayLabel(role))}
          </p>
        ) : null}

        {careRecipientDisplayName ? (
          <p className="mt-1 text-body text-muted">
            {copy.recipientTemplate.replace("{apelido}", careRecipientDisplayName)}
          </p>
        ) : null}

        {invitedEmail ? (
          <p className="mt-4 text-secondary text-muted">
            E-mail convidado: <strong className="text-ink">{invitedEmail}</strong>
          </p>
        ) : null}

        {!isAuthenticated ? (
          <Button className="mt-6" asChild>
            <Link href={loginHref}>{copy.loginCta}</Link>
          </Button>
        ) : null}

        {isAuthenticated && !emailMatches ? (
          <>
            <Note tone="warning" icon="⚠️" className="mt-5">
              {copy.emailMismatchBody}
            </Note>
            <Button className="mt-4" variant="secondary" asChild>
              <Link href={loginHref}>{copy.loginCta}</Link>
            </Button>
          </>
        ) : null}

        {isAuthenticated && emailMatches ? (
          <form action={formAction} className="mt-6">
            <input type="hidden" name="token" value={token} />
            {actionState.ok === false && actionState.message ? (
              <Note tone="warning" icon="⚠️" className="mb-4">
                {actionState.message}
              </Note>
            ) : null}
            <Button type="submit" disabled={isPending}>
              {isPending ? copy.accepting : copy.acceptCta}
            </Button>
          </form>
        ) : null}
      </CardBody>
    </Card>
  );
}

export { AcceptInviteView };
