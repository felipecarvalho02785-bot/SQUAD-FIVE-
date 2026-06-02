import { ComingSoon } from "@/components/squad/coming-soon";

export const metadata = { title: "Minhas Ordens — Squad Five" };

export default function OrdensPage() {
  return (
    <ComingSoon
      title="Minhas Ordens"
      subtitle="Suas ordens do dia em todas as operações."
      sprint="Sprint 5"
      description="Lista pessoal de tarefas ordenadas por D-day, com status e ações rápidas."
    />
  );
}
