/** API pública do módulo `exams` — F4.6 Exames e receitas. */
export const examsModule = { id: "exams" } as const;

export { getExamesPage } from "./application/get-exames-page";
export { getHojeExamsSnapshot } from "./application/get-hoje-exams-snapshot";
export { getExamSharePage } from "./application/get-exam-share-page";
export {
  saveExamAction,
  updateExamAction,
  deleteExamAction,
  createExamShareAction,
  getExamDownloadUrlAction,
} from "./application/exam-actions";
export { canManageExams } from "./application/can-manage-exams";
export { canViewExam } from "./application/can-view-exam";
