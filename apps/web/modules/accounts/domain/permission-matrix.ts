import { ACCOUNT_ROLES, type AccountRole } from "./roles";

export const PERMISSION_MATRIX_ROLES = [
  ACCOUNT_ROLES.admin,
  ACCOUNT_ROLES.caregiver,
  ACCOUNT_ROLES.viewer,
  ACCOUNT_ROLES.emergency_contact,
] as const;

export type PermissionCellValue = "allowed" | "conditional" | "denied";

export interface PermissionMatrixRow {
  id: string;
  label: string;
  cells: Record<AccountRole, PermissionCellValue>;
  conditionalNote?: Partial<Record<AccountRole, string>>;
}

/** Matriz estática espelhando PRD §6 / protótipo — não altera RLS. */
export const PERMISSION_MATRIX_ROWS: PermissionMatrixRow[] = [
  {
    id: "view_routine",
    label: "Ver rotina e horários do dia",
    cells: {
      [ACCOUNT_ROLES.admin]: "allowed",
      [ACCOUNT_ROLES.caregiver]: "allowed",
      [ACCOUNT_ROLES.viewer]: "allowed",
      [ACCOUNT_ROLES.emergency_contact]: "denied",
    },
  },
  {
    id: "manage_medications",
    label: "Cadastrar e editar medicamentos e cartelas",
    cells: {
      [ACCOUNT_ROLES.admin]: "allowed",
      [ACCOUNT_ROLES.caregiver]: "denied",
      [ACCOUNT_ROLES.viewer]: "denied",
      [ACCOUNT_ROLES.emergency_contact]: "denied",
    },
  },
  {
    id: "register_observations",
    label: "Registrar observações do dia",
    cells: {
      [ACCOUNT_ROLES.admin]: "allowed",
      [ACCOUNT_ROLES.caregiver]: "allowed",
      [ACCOUNT_ROLES.viewer]: "denied",
      [ACCOUNT_ROLES.emergency_contact]: "denied",
    },
  },
  {
    id: "confirm_dose",
    label: "Confirmar uma tomada pontualmente",
    cells: {
      [ACCOUNT_ROLES.admin]: "allowed",
      [ACCOUNT_ROLES.caregiver]: "allowed",
      [ACCOUNT_ROLES.viewer]: "denied",
      [ACCOUNT_ROLES.emergency_contact]: "denied",
    },
  },
  {
    id: "view_exams",
    label: "Ver exames",
    cells: {
      [ACCOUNT_ROLES.admin]: "allowed",
      [ACCOUNT_ROLES.caregiver]: "conditional",
      [ACCOUNT_ROLES.viewer]: "conditional",
      [ACCOUNT_ROLES.emergency_contact]: "denied",
    },
    conditionalNote: {
      [ACCOUNT_ROLES.caregiver]: "conforme autorização",
      [ACCOUNT_ROLES.viewer]: "conforme autorização",
    },
  },
  {
    id: "manage_exams",
    label: "Enviar e excluir exames",
    cells: {
      [ACCOUNT_ROLES.admin]: "allowed",
      [ACCOUNT_ROLES.caregiver]: "denied",
      [ACCOUNT_ROLES.viewer]: "denied",
      [ACCOUNT_ROLES.emergency_contact]: "denied",
    },
  },
  {
    id: "receive_sos",
    label: "Receber alerta de SOS",
    cells: {
      [ACCOUNT_ROLES.admin]: "allowed",
      [ACCOUNT_ROLES.caregiver]: "allowed",
      [ACCOUNT_ROLES.viewer]: "conditional",
      [ACCOUNT_ROLES.emergency_contact]: "allowed",
    },
    conditionalNote: {
      [ACCOUNT_ROLES.viewer]: "opcional",
    },
  },
  {
    id: "view_location",
    label: "Ver localização",
    cells: {
      [ACCOUNT_ROLES.admin]: "allowed",
      [ACCOUNT_ROLES.caregiver]: "allowed",
      [ACCOUNT_ROLES.viewer]: "denied",
      [ACCOUNT_ROLES.emergency_contact]: "conditional",
    },
    conditionalNote: {
      [ACCOUNT_ROLES.emergency_contact]: "só durante um SOS",
    },
  },
  {
    id: "manage_safe_zones",
    label: "Definir zonas seguras",
    cells: {
      [ACCOUNT_ROLES.admin]: "allowed",
      [ACCOUNT_ROLES.caregiver]: "denied",
      [ACCOUNT_ROLES.viewer]: "denied",
      [ACCOUNT_ROLES.emergency_contact]: "denied",
    },
  },
  {
    id: "invite_members",
    label: "Convidar pessoas e mudar permissões",
    cells: {
      [ACCOUNT_ROLES.admin]: "allowed",
      [ACCOUNT_ROLES.caregiver]: "denied",
      [ACCOUNT_ROLES.viewer]: "denied",
      [ACCOUNT_ROLES.emergency_contact]: "denied",
    },
  },
  {
    id: "manage_billing",
    label: "Gerenciar assinatura e pagamento",
    cells: {
      [ACCOUNT_ROLES.admin]: "allowed",
      [ACCOUNT_ROLES.caregiver]: "denied",
      [ACCOUNT_ROLES.viewer]: "denied",
      [ACCOUNT_ROLES.emergency_contact]: "denied",
    },
  },
];

export function permissionCellSymbol(value: PermissionCellValue): string {
  if (value === "allowed") return "●";
  if (value === "conditional") return "◐";
  return "—";
}

export function permissionCellAriaLabel(
  value: PermissionCellValue,
  note?: string,
): string {
  if (value === "allowed") return "Permitido";
  if (value === "conditional") return note ?? "Depende de autorização";
  return "Sem acesso";
}
