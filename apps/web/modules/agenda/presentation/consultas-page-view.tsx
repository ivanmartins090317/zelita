"use client";

import { useRouter } from "next/navigation";

import { familyRoutes } from "@/content/family";
import type { ConsultasPageViewModel } from "@/modules/agenda/application/get-consultas-page";
import { shiftWeek } from "@/modules/agenda/domain/week-grid";

import { AppointmentModal } from "./appointment-modal";
import { FamilyTasksCard } from "./family-tasks-card";
import { TaskModal } from "./task-modal";
import { UpcomingAppointmentsCard } from "./upcoming-appointments-card";
import { WeekGridCard } from "./week-grid-card";

interface ConsultasPageViewProps {
  data: ConsultasPageViewModel;
}

function ConsultasPageView({ data }: ConsultasPageViewProps) {
  const router = useRouter();

  function weekQuery() {
    return `semana=${data.weekStartDateKey}`;
  }

  function navigateWeek(direction: -1 | 1) {
    const next = shiftWeek(data.weekStartDateKey, direction);
    router.push(`${familyRoutes.consultas}?semana=${next}`);
  }

  function closeModal() {
    router.replace(`${familyRoutes.consultas}?${weekQuery()}`);
  }

  function openAppointmentModal() {
    router.push(`${familyRoutes.consultas}?${weekQuery()}&modal=consulta`);
  }

  function openTaskModal() {
    router.push(`${familyRoutes.consultas}?${weekQuery()}&modal=tarefa`);
  }

  function editAppointment(id: string) {
    router.push(`${familyRoutes.consultas}?${weekQuery()}&editar=${id}`);
  }

  function editTask(id: string) {
    router.push(`${familyRoutes.consultas}?${weekQuery()}&editarTarefa=${id}`);
  }

  const showAppointmentModal =
    data.openModal === "consulta" || Boolean(data.editingAppointment);
  const showTaskModal =
    data.openModal === "tarefa" || Boolean(data.editingTask);

  return (
    <>
      <WeekGridCard
        title={data.weekTitle}
        grid={data.weekGrid}
        onPrevWeek={() => navigateWeek(-1)}
        onNextWeek={() => navigateWeek(1)}
      />

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <UpcomingAppointmentsCard
          items={data.upcomingAppointments}
          canManage={data.canManage}
          isPaused={data.isPaused}
          onAddClick={openAppointmentModal}
          onEditClick={editAppointment}
        />
        <FamilyTasksCard
          openTasks={data.openTasks}
          completedTasks={data.completedTasks}
          canManage={data.canManage}
          isPaused={data.isPaused}
          onAddClick={openTaskModal}
          onEditClick={editTask}
        />
      </div>

      {data.canManage ? (
        <>
          <AppointmentModal
            open={showAppointmentModal}
            careRecipientId={data.careRecipientId}
            members={data.members}
            editing={data.editingAppointment}
            onClose={closeModal}
          />
          <TaskModal
            open={showTaskModal}
            careRecipientId={data.careRecipientId}
            members={data.members}
            appointments={data.futureAppointmentsForLink}
            editing={data.editingTask}
            onClose={closeModal}
          />
        </>
      ) : null}
    </>
  );
}

export { ConsultasPageView };
