import { ComingSoon } from "@/components/squad/coming-soon";

export const metadata = { title: "Painel de Pelotão — Squad Five" };

export default function PelotaoPage() {
  return (
    <ComingSoon
      title="Painel de Pelotão"
      subtitle="Kanban de todas as operações por etapa."
      sprint="Sprint 5"
      description="Visualização em colunas com drag & drop entre etapas, filtros por responsável, produto e saúde."
    />
  );
}
