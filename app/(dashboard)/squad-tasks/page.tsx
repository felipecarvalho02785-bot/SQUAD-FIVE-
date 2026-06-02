import { ComingSoon } from "@/components/squad/coming-soon";

export const metadata = { title: "Tarefas do Squad — Squad Five" };

export default function SquadTasksPage() {
  return (
    <ComingSoon
      title="Tarefas do Squad"
      subtitle="Ordens internas que não pertencem a nenhuma operação."
      sprint="Sprint 6"
      description="Área separada para rotinas e processos internos do squad. Recorrentes semanais, quinzenais e mensais."
    />
  );
}
