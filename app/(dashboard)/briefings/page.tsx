import { ComingSoon } from "@/components/squad/coming-soon";

export const metadata = { title: "Briefings — Squad Five" };

export default function BriefingsPage() {
  return (
    <ComingSoon
      title="Briefings"
      subtitle="Registro de reuniões com recrutas + NPS."
      sprint="Sprint 6"
      description="Histórico completo de briefings, criação rápida pós-reunião, NPS mensal por recruta e produto."
    />
  );
}
