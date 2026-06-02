import { ComingSoon } from "@/components/squad/coming-soon";

export const metadata = { title: "Operações — Squad Five" };

export default function OperacoesPage() {
  return (
    <ComingSoon
      title="Operações"
      subtitle="Projetos ativos vinculados a recrutas e produtos."
      sprint="Sprint 3"
      description="Lista e detalhe das operações com etapas, ordens, briefings, gaps e histórico completo."
    />
  );
}
