"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ListRow } from "@/components/ui/list-row";
import { Note } from "@/components/ui/note";
import { Select } from "@/components/ui/select";
import { Tag } from "@/components/ui/tag";
import { signupContent } from "@/content/signup";
import { onlyDigits } from "@/lib/format";
import type { SignupInviteRoleSlug } from "@/modules/care-recipients/domain/signup-options";
import {
  SignupStepShell,
  SignupStepTitle,
} from "@/modules/care-recipients/presentation/signup-step-shell";
import type {
  SignupLocalInvite,
} from "@/modules/care-recipients/presentation/signup-types";

interface SignupInvitesStepProps {
  managerName: string;
  userEmail: string | null;
  localInvites: SignupLocalInvite[];
  onAddInvite: (invite: SignupLocalInvite) => void;
  onBack: () => void;
  onSkip: () => void;
  onContinue: () => void;
}

function buildInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

function isValidInviteContact(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.includes("@")) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  }
  return onlyDigits(trimmed).length >= 10;
}

export function SignupInvitesStep({
  managerName,
  userEmail,
  localInvites,
  onAddInvite,
  onBack,
  onSkip,
  onContinue,
}: SignupInvitesStepProps) {
  const copy = signupContent.invites;
  const [contact, setContact] = useState("");
  const [role, setRole] = useState<SignupInviteRoleSlug>("caregiver");
  const [contactError, setContactError] = useState<string | undefined>();

  function handleInvite() {
    if (!isValidInviteContact(contact)) {
      setContactError(signupContent.validation.inviteContactInvalid);
      return;
    }
    setContactError(undefined);
    onAddInvite({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      contact: contact.trim(),
      role,
    });
    setContact("");
  }

  return (
    <SignupStepShell
      onBack={onBack}
      onContinue={onContinue}
      extraActions={
        <Button type="button" variant="secondary" size="md" onClick={onSkip}>
          {copy.skipLabel}
        </Button>
      }
    >
      <SignupStepTitle title={copy.title} subtitle={copy.subtitle} />

      <div className="mb-4 overflow-hidden rounded-note border border-line">
        <ListRow
          icon={buildInitials(managerName)}
          title={`${managerName || "Você"}${copy.adminSuffix}`}
          subtitle={userEmail ?? ""}
          trailing={<Tag tone="info">{copy.adminRoleLabel}</Tag>}
          className="border-b-0"
        />
      </div>

      {localInvites.length > 0 ? (
        <div className="mb-4 space-y-2">
          {localInvites.map((invite) => (
            <div
              key={invite.id}
              className="flex items-center justify-between rounded-note border border-line px-4 py-3"
            >
              <div>
                <p className="font-bold text-ink">{invite.contact}</p>
                <p className="text-compact text-muted">
                  {
                    copy.roles.find((item) => item.slug === invite.role)
                      ?.label
                  }
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <Field label={copy.contactLabel} htmlFor="invite-contact">
        <div className="flex flex-wrap gap-2">
          <Input
            id="invite-contact"
            value={contact}
            onChange={(event) => setContact(event.target.value)}
            placeholder={copy.contactPlaceholder}
            className="min-w-[220px] flex-1 text-[17px]"
          />
          <Select
            value={role}
            onChange={(event) =>
              setRole(event.target.value as SignupInviteRoleSlug)
            }
            className="max-w-[210px]"
          >
            {copy.roles.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.label}
              </option>
            ))}
          </Select>
          <Button type="button" variant="secondary" size="md" onClick={handleInvite}>
            {copy.inviteLabel}
          </Button>
        </div>
        <p className="mt-2 text-compact text-muted">{copy.rolesHint}</p>
      </Field>
      {contactError ? (
        <Note tone="warning" icon="⚠️" className="mt-3">
          {contactError}
        </Note>
      ) : null}
    </SignupStepShell>
  );
}
