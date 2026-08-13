import { getConsultasPage } from "./application/get-consultas-page";
import {
  cancelAppointmentAction,
  completeTaskAction,
  reopenTaskAction,
  saveAppointmentAction,
  saveTaskAction,
} from "./application/agenda-actions";
import { getTodayAgendaSnapshot } from "./application/get-today-agenda-snapshot";
import { canManageAgenda, canCompleteTask } from "./domain/can-manage-agenda";

export const agendaModule = {
  id: "agenda",
} as const;

export {
  getConsultasPage,
  getTodayAgendaSnapshot,
  saveAppointmentAction,
  cancelAppointmentAction,
  saveTaskAction,
  completeTaskAction,
  reopenTaskAction,
  canManageAgenda,
  canCompleteTask,
};
