import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ComingSoon } from "@/components/squad/coming-soon";

export const metadata = { title: "Quartel General — Squad Five" };

export default async function QuartelPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/comando");
  }

  return (
    <ComingSoon
      title="Quartel General"
      subtitle="Configurações do sistema (admin only)."
      sprint="Sprint 7"
      description="Gestão de membros do squad, templates de etapas por produto, regras de notificação e calibrações."
    />
  );
}
