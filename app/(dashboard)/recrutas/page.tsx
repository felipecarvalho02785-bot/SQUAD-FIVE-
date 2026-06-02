import { ComingSoon } from "@/components/squad/coming-soon";

export const metadata = { title: "Recrutas — Squad Five" };

export default function RecrutasPage() {
  return (
    <ComingSoon
      title="Recrutas"
      subtitle="Cadastro e ficha única dos clientes do squad."
      sprint="Sprint 3"
      description="Lista de recrutas com filtros, ficha única com histórico de operações, criação e edição. Bora alistar o primeiro recruta?"
    />
  );
}
