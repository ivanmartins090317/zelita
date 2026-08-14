"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import { familyContent, familyRoutes } from "@/content/family";
import type { NotificationMatrixViewModel } from "@/modules/alerts/application/get-avisos-page";
import {
  NOTIFICATION_ALERT_TYPE,
  type NotificationAlertType,
  type NotificationChannel,
} from "@/modules/alerts/domain/alert-feed-types";
import { NotificationMatrixEditModal } from "@/modules/alerts/presentation/notification-matrix-edit-modal";
import Link from "next/link";

interface NotificationMatrixCardProps {
  matrix: NotificationMatrixViewModel;
  canEdit: boolean;
  isPaused: boolean;
  members: Array<{ memberId: string; role: import("@/modules/accounts/domain/roles").AccountRole }>;
}

function channelTagTone(
  channel: NotificationChannel,
): "info" | "warning" | "muted" | "critical" {
  if (channel === "whatsapp") return "info";
  if (channel === "call") return "critical";
  if (channel === "email") return "warning";
  return "muted";
}

function NotificationMatrixCard({
  matrix,
  canEdit,
  isPaused,
  members,
}: NotificationMatrixCardProps) {
  const copy = familyContent.avisos.matrix;
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<{
    memberId: string;
    alertType: NotificationAlertType;
    channels: NotificationChannel[];
    role: import("@/modules/accounts/domain/roles").AccountRole;
    memberName: string;
  } | null>(null);

  function openEdit(cell: {
    memberId: string;
    alertType: NotificationAlertType;
    channels: NotificationChannel[];
  }) {
    const member = members.find((item) => item.memberId === cell.memberId);
    const column = matrix.columns.find((col) => col.memberId === cell.memberId);
    if (!member || !column) return;

    setEditTarget({
      memberId: cell.memberId,
      alertType: cell.alertType,
      channels: cell.channels,
      role: member.role,
      memberName: column.displayName,
    });
    setEditOpen(true);
  }

  return (
    <>
      <Card>
        <CardHeader className="justify-between">
          <CardTitle>{copy.cardTitle}</CardTitle>
          {canEdit ? (
            <Button
              variant="secondary"
              size="xs"
              disabled={isPaused}
              onClick={() =>
                openEdit({
                  memberId: matrix.columns[0]?.memberId ?? "",
                  alertType: NOTIFICATION_ALERT_TYPE.sos,
                  channels:
                    matrix.rows[0]?.cells.find(
                      (cell) => cell.memberId === matrix.columns[0]?.memberId,
                    )?.channels ?? [],
                })
              }
            >
              {copy.editButton}
            </Button>
          ) : null}
        </CardHeader>

        {matrix.readOnlyNote ? (
          <CardBody className="border-b border-line-2 pb-4 pt-0">
            <p className="text-secondary text-muted">{matrix.readOnlyNote}</p>
          </CardBody>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-secondary">
            <thead>
              <tr className="border-b border-line-2 text-[11px] font-bold uppercase tracking-wide text-muted">
                <th className="px-5 py-3">{copy.eventTypeHeader}</th>
                {matrix.columns.map((column) => (
                  <th key={column.memberId} className="px-3 py-3">
                    {column.displayName}
                    {column.roleLabel ? (
                      <span className="block text-[10px] font-semibold normal-case text-muted">
                        ({column.roleLabel})
                      </span>
                    ) : null}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.rows.map((row) => (
                <tr key={row.alertType} className="border-b border-line-2 last:border-b-0">
                  <td className="px-5 py-4 font-semibold text-ink">{row.label}</td>
                  {row.cells.map((cell) => (
                    <td key={`${row.alertType}-${cell.memberId}`} className="px-3 py-4">
                      {cell.channels.length === 0 ? (
                        <span className="text-muted">—</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {cell.channels.map((channel) => (
                            <Tag key={channel} tone={channelTagTone(channel)}>
                              {copy.channelLabels[channel]}
                            </Tag>
                          ))}
                        </div>
                      )}
                      {canEdit && !isPaused ? (
                        <button
                          type="button"
                          className="mt-1 text-compact font-semibold text-brand-600"
                          onClick={() => openEdit(cell)}
                        >
                          {copy.editCell}
                        </button>
                      ) : null}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {matrix.showEmergencyNote ? (
          <CardBody className="border-t border-line-2">
            <p className="text-secondary text-muted">{matrix.emergencyNote}</p>
          </CardBody>
        ) : null}

        <CardBody className="flex flex-col gap-2 border-t border-line-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-secondary text-muted">{copy.footerHint}</p>
          <Button variant="secondary" size="xs" asChild>
            <Link href={`${familyRoutes.ajustes}#tom-e-horarios`}>{copy.settingsLink}</Link>
          </Button>
        </CardBody>
      </Card>

      {editTarget ? (
        <NotificationMatrixEditModal
          open={editOpen}
          memberId={editTarget.memberId}
          memberName={editTarget.memberName}
          alertType={editTarget.alertType}
          role={editTarget.role}
          initialChannels={editTarget.channels}
          onClose={() => setEditOpen(false)}
        />
      ) : null}
    </>
  );
}

export { NotificationMatrixCard };
