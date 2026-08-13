import { familyContent } from "@/content/family";
import { getFamilyContext } from "@/modules/accounts/application/family-context";
import { getShellContext } from "@/modules/accounts/application/get-shell-context";
import {
  canViewCareRoutine,
  getRoleDisplayLabel,
  isAccountPaused,
} from "@/modules/accounts/domain/roles";
import { fetchParticipantRows } from "@/modules/accounts/infrastructure/member-list-repo";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { buildAlertFeedFromSources } from "./build-alert-feed";
import {
  canEditNotificationPreferences,
  canViewNotificationMatrix,
} from "./can-edit-notification-preferences";
import {
  ALERT_FEED_FILTER,
  FEED_PAGE_SIZE,
  NOTIFICATION_MATRIX_ROW_ORDER,
  type AlertFeedFilter,
  type NotificationAlertType,
  type NotificationChannel,
} from "../domain/alert-feed-types";
import {
  filterFeedItems,
  type AlertFeedItem,
} from "../domain/alert-feed-item";
import { computeAlertOpenCount } from "../domain/alert-open-count";
import {
  mergeMatrixWithDefaults,
  memberHasPanelAccess,
  hasEmergencyPhoneOnlyMembers,
} from "../domain/notification-matrix-defaults";
import { formatChannelCombinationLabel } from "../domain/notification-channels";
import { fetchAlertFeedSources } from "../infrastructure/alert-feed-sources-repo";
import { fetchNotificationPreferences } from "../infrastructure/notification-prefs-repo";

export interface MatrixColumnViewModel {
  memberId: string;
  displayName: string;
  roleLabel: string;
}

export interface MatrixCellViewModel {
  memberId: string;
  alertType: NotificationAlertType;
  channelLabel: string;
  channels: NotificationChannel[];
}

export interface NotificationMatrixViewModel {
  columns: MatrixColumnViewModel[];
  rows: Array<{
    alertType: NotificationAlertType;
    label: string;
    cells: MatrixCellViewModel[];
  }>;
  showEmergencyNote: boolean;
  emergencyNote: string;
  readOnlyNote: string | null;
}

export interface AvisosPageViewModel {
  feedItems: AlertFeedItem[];
  activeFilter: AlertFeedFilter;
  hasMore: boolean;
  totalCount: number;
  feedEmpty: boolean;
  filterEmptyCopy: string | null;
  matrix: NotificationMatrixViewModel | null;
  canEditMatrix: boolean;
  isPaused: boolean;
  loadError: string | null;
}

export type AvisosPageResult =
  | { ok: true; data: AvisosPageViewModel }
  | { ok: false; reason: "forbidden" | "load_failed"; message: string };

function buildMatrixViewModel(input: {
  members: Awaited<ReturnType<typeof fetchParticipantRows>>;
  savedPrefs: Awaited<ReturnType<typeof fetchNotificationPreferences>>;
  canEdit: boolean;
  role: import("@/modules/accounts/domain/roles").AccountRole;
}): NotificationMatrixViewModel {
  const copy = familyContent.avisos.matrix;
  const channelLabels = copy.channelLabels;

  const panelMembers = input.members.filter(
    (row) =>
      row.kind === "member" &&
      memberHasPanelAccess({ profileId: row.profileId, role: row.role }),
  );

  const columns: MatrixColumnViewModel[] = panelMembers.map((member) => ({
    memberId: member.id,
    displayName: member.displayName.split(" ")[0]?.toUpperCase() ?? member.displayName,
    roleLabel: getRoleDisplayLabel(member.role),
  }));

  const rows = NOTIFICATION_MATRIX_ROW_ORDER.map((alertType) => {
    const cells: MatrixCellViewModel[] = panelMembers.map((member) => {
      const saved = input.savedPrefs.filter((pref) => pref.memberId === member.id);
      const matrix = mergeMatrixWithDefaults({
        memberId: member.id,
        role: member.role,
        saved,
      });
      const channels = matrix[alertType];
      return {
        memberId: member.id,
        alertType,
        channels,
        channelLabel: formatChannelCombinationLabel(channels, channelLabels),
      };
    });

    return {
      alertType,
      label: copy.rowLabels[alertType],
      cells,
    };
  });

  return {
    columns,
    rows,
    showEmergencyNote: hasEmergencyPhoneOnlyMembers(
      input.members
        .filter((row) => row.kind === "member")
        .map((row) => ({ profileId: row.profileId, role: row.role })),
    ),
    emergencyNote: copy.emergencyPhoneNote,
    readOnlyNote: input.canEdit ? null : copy.readOnlyNote,
  };
}

export async function getAvisosPage(input: {
  filter?: string | null;
  offset?: number;
  now?: Date;
}): Promise<AvisosPageResult> {
  const copy = familyContent.avisos;

  try {
    const shell = await getShellContext();
    if (!shell) {
      return { ok: false, reason: "forbidden", message: copy.errors.incomplete };
    }

    const ctx = await getFamilyContext();
    if (!ctx.accountId || !ctx.role || !ctx.careRecipientId) {
      return { ok: false, reason: "forbidden", message: copy.errors.incomplete };
    }
    if (!canViewCareRoutine(ctx.role)) {
      return { ok: false, reason: "forbidden", message: copy.errors.forbidden };
    }

    const now = input.now ?? new Date();
    const activeFilter = Object.values(ALERT_FEED_FILTER).includes(
      input.filter as AlertFeedFilter,
    )
      ? (input.filter as AlertFeedFilter)
      : ALERT_FEED_FILTER.all;

    const supabase = await createSupabaseServerClient();
    const sources = await fetchAlertFeedSources(supabase, {
      careRecipientId: ctx.careRecipientId,
      accountId: ctx.accountId,
      now,
    });

    const allItems = buildAlertFeedFromSources({
      sources,
      copy: copy.feed,
      now,
    });

    const filtered = filterFeedItems({
      items: allItems,
      filter: activeFilter,
      role: ctx.role,
    });

    const offset = input.offset ?? 0;
    const endIndex = offset + FEED_PAGE_SIZE;
    const pageItems = filtered.slice(0, endIndex);
    const hasMore = endIndex < filtered.length;

    const members = await fetchParticipantRows(supabase, ctx.accountId, now);
    const savedPrefs = await fetchNotificationPreferences(supabase, ctx.accountId);
    const canEdit = canEditNotificationPreferences(ctx.role);

    const matrix = canViewNotificationMatrix(ctx.role)
      ? buildMatrixViewModel({
          members,
          savedPrefs,
          canEdit,
          role: ctx.role,
        })
      : null;

    return {
      ok: true,
      data: {
        feedItems: pageItems,
        activeFilter,
        hasMore,
        totalCount: filtered.length,
        feedEmpty: allItems.length === 0,
        filterEmptyCopy:
          filtered.length === 0 && allItems.length > 0
            ? (copy.feed.filterEmpty[activeFilter] ?? copy.feed.emptyDescription)
            : null,
        matrix,
        canEditMatrix: canEdit && !isAccountPaused(ctx.accountStatus ?? "active"),
        isPaused: isAccountPaused(ctx.accountStatus ?? "active"),
        loadError: null,
      },
    };
  } catch {
    return {
      ok: false,
      reason: "load_failed",
      message: copy.errors.loadFailed,
    };
  }
}

export async function getAvisosOpenCount(now = new Date()): Promise<number> {
  try {
    const ctx = await getFamilyContext();
    if (!ctx.accountId || !ctx.careRecipientId) return 0;

    const supabase = await createSupabaseServerClient();
    const sources = await fetchAlertFeedSources(supabase, {
      careRecipientId: ctx.careRecipientId,
      accountId: ctx.accountId,
      now,
    });

    const items = buildAlertFeedFromSources({
      sources,
      copy: familyContent.avisos.feed,
      now,
    });

    return computeAlertOpenCount(items).totalOpen;
  } catch {
    return 0;
  }
}
