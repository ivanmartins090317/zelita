import {
  Bell,
  Circle,
  ClipboardList,
  CreditCard,
  FileText,
  GraduationCap,
  MapPin,
  Pill,
  Settings,
  Siren,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { FamilyNavAreaId } from "@/modules/accounts/presentation/family/family-nav";

/** Ícones de traço único — o menu não usa emoji como controle. */
export const familyNavIcons: Record<FamilyNavAreaId, LucideIcon> = {
  hoje: Circle,
  remedios: Pill,
  consultas: ClipboardList,
  avisos: Bell,
  "pedidos-de-ajuda": Siren,
  localizacao: MapPin,
  exames: FileText,
  guia: GraduationCap,
  participantes: Users,
  plano: CreditCard,
  ajustes: Settings,
};

export const FAMILY_NAV_ICON_STROKE = 1.75;
