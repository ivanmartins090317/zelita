import type { SupabaseClient } from "@supabase/supabase-js";

export const DATA_SUBJECT_REQUEST_TYPE = {
  export: "export",
  delete: "delete",
} as const;

export type DataSubjectRequestType =
  (typeof DATA_SUBJECT_REQUEST_TYPE)[keyof typeof DATA_SUBJECT_REQUEST_TYPE];

export const DATA_SUBJECT_REQUEST_STATUS = {
  pending: "pending",
} as const;

export async function insertDataSubjectRequest(
  supabase: SupabaseClient,
  input: {
    accountId: string;
    requesterProfileId: string;
    requestType: DataSubjectRequestType;
  },
): Promise<void> {
  const { error } = await supabase.from("data_subject_requests").insert({
    account_id: input.accountId,
    requester_profile_id: input.requesterProfileId,
    request_type: input.requestType,
    status: DATA_SUBJECT_REQUEST_STATUS.pending,
  });

  if (error) {
    throw new Error(
      "Não foi possível registrar a solicitação agora. Tente de novo em instantes.",
    );
  }
}

export function logDataSubjectRequestCreated(payload: Record<string, string>) {
  if (process.env.NODE_ENV === "development") {
    console.info("[care-recipients] data_subject_request_created", payload);
  }
}
