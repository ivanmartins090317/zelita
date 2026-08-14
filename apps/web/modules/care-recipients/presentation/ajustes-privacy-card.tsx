"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { ListRow } from "@/components/ui/list-row";
import { Modal } from "@/components/ui/modal";
import { Tag } from "@/components/ui/tag";
import { familyContent } from "@/content/family";
import type { AjustesPrivacyViewModel } from "@/modules/care-recipients/application/ajustes-view-models";
import {
  LOCATION_CONSENT_STATUS,
  WA_OPT_IN_STATUS,
} from "@/modules/care-recipients/domain/care-settings-labels";
import { DevicesStubNote } from "@/modules/elder-access/presentation/devices-stub-note";
import { AjustesLgpdModal } from "@/modules/care-recipients/presentation/ajustes-lgpd-modal";

interface AjustesPrivacyCardProps {
  privacy: AjustesPrivacyViewModel;
  careDisplayName: string;
  canEdit: boolean;
  isPaused: boolean;
}

function resolveMessagesSubtitle(
  privacy: AjustesPrivacyViewModel,
  careDisplayName: string,
): string {
  const copy = familyContent.ajustes.privacy;
  if (
    privacy.waOptInStatus === WA_OPT_IN_STATUS.active &&
    privacy.waOptInDateLabel
  ) {
    return copy.messagesSubtitleActive
      .replace("{apelido}", careDisplayName)
      .replace("{data}", privacy.waOptInDateLabel);
  }
  return copy.messagesSubtitlePending;
}

function resolveGeoSubtitle(privacy: AjustesPrivacyViewModel): string {
  const copy = familyContent.ajustes.privacy;
  if (privacy.geoStatus === LOCATION_CONSENT_STATUS.active && privacy.geoConsentDateLabel) {
    return copy.geoSubtitleActive.replace("{data}", privacy.geoConsentDateLabel);
  }
  if (privacy.geoStatus === LOCATION_CONSENT_STATUS.revoked) {
    return copy.geoSubtitleRevoked;
  }
  return copy.geoSubtitlePending;
}

function AjustesPrivacyCard({
  privacy,
  careDisplayName,
  canEdit,
  isPaused,
}: AjustesPrivacyCardProps) {
  const copy = familyContent.ajustes.privacy;
  const [lgpdOpen, setLgpdOpen] = useState(false);
  const [accessLogOpen, setAccessLogOpen] = useState(false);
  const [devicesNoteOpen, setDevicesNoteOpen] = useState(false);

  const messagesTag =
    privacy.waOptInStatus === WA_OPT_IN_STATUS.active
      ? copy.tags.current
      : copy.tags.pending;
  const messagesTone =
    privacy.waOptInStatus === WA_OPT_IN_STATUS.active ? "ok" : "warning";

  const geoTag =
    privacy.geoStatus === LOCATION_CONSENT_STATUS.active
      ? copy.tags.current
      : privacy.geoStatus === LOCATION_CONSENT_STATUS.revoked
        ? copy.tags.revoked
        : copy.tags.pending;
  const geoTone =
    privacy.geoStatus === LOCATION_CONSENT_STATUS.active
      ? "ok"
      : privacy.geoStatus === LOCATION_CONSENT_STATUS.revoked
        ? "warning"
        : "muted";

  return (
    <>
      <Card>
        <CardHeader>
          <span aria-hidden>{copy.cardIcon}</span>
          <CardTitle>{copy.cardTitle}</CardTitle>
        </CardHeader>
        <CardBody className="p-0">
          <ListRow
            icon="💬"
            title={copy.messagesTitle}
            subtitle={resolveMessagesSubtitle(privacy, careDisplayName)}
            trailing={<Tag tone={messagesTone}>{messagesTag}</Tag>}
          />
          <ListRow
            icon="📍"
            title={copy.geoTitle}
            subtitle={resolveGeoSubtitle(privacy)}
            trailing={<Tag tone={geoTone}>{geoTag}</Tag>}
          />
          <ListRow
            icon="🩺"
            title={copy.healthTitle}
            subtitle={copy.healthSubtitle}
          />
          <ListRow
            icon="📋"
            title={copy.lgpdTitle}
            subtitle={copy.lgpdSubtitle}
            trailing={
              canEdit ? (
                <Button
                  variant="secondary"
                  size="xs"
                  onClick={() => setLgpdOpen(true)}
                  disabled={isPaused}
                >
                  {copy.lgpdButton}
                </Button>
              ) : null
            }
          />
          <ListRow
            icon="🔑"
            title={copy.loginTitle}
            subtitle={copy.loginSubtitle}
            trailing={<Tag tone="ok">{copy.tags.active}</Tag>}
          />
          <ListRow
            icon="📱"
            title={copy.devicesTitle}
            subtitle={copy.devicesSubtitle}
            trailing={
              <Button
                variant="secondary"
                size="xs"
                onClick={() => setDevicesNoteOpen(true)}
              >
                {copy.devicesManageButton}
              </Button>
            }
          />
          <ListRow
            icon="🕘"
            title={copy.accessLogTitle}
            trailing={
              <Button
                variant="secondary"
                size="xs"
                onClick={() => setAccessLogOpen(true)}
              >
                {copy.accessLogButton}
              </Button>
            }
          />
        </CardBody>
      </Card>

      <AjustesLgpdModal
        open={lgpdOpen}
        onClose={() => setLgpdOpen(false)}
        canSubmit={canEdit && !isPaused}
      />

      <Modal
        open={accessLogOpen}
        onClose={() => setAccessLogOpen(false)}
        title={familyContent.ajustes.accessLogModal.title}
        footer={
          <Button variant="secondary" size="sm" onClick={() => setAccessLogOpen(false)}>
            {familyContent.ajustes.accessLogModal.closeButton}
          </Button>
        }
      >
        <p className="text-secondary text-muted">
          {familyContent.ajustes.accessLogModal.body}
        </p>
      </Modal>

      <Modal
        open={devicesNoteOpen}
        onClose={() => setDevicesNoteOpen(false)}
        title={copy.devicesTitle}
        footer={
          <Button variant="secondary" size="sm" onClick={() => setDevicesNoteOpen(false)}>
            {familyContent.ajustes.accessLogModal.closeButton}
          </Button>
        }
      >
        <DevicesStubNote
          title={copy.devicesSubtitle}
          body="Disponível quando você instalar no celular dele."
          guideLinkLabel={familyContent.ajustes.channels.howItWorks}
        />
      </Modal>
    </>
  );
}

export { AjustesPrivacyCard };
