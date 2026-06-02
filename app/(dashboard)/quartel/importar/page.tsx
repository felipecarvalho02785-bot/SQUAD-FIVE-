import { redirect } from "next/navigation";
import { IconUpload } from "@tabler/icons-react";
import { auth } from "@/lib/auth";
import { PageHeader } from "@/components/squad/page-header";
import { ImportForm } from "@/components/quartel/import-form";

export const metadata = { title: "Importar recrutas — Squad Five" };
export const dynamic = "force-dynamic";

export default async function ImportarPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/comando");

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto w-full">
      <PageHeader
        title="Importar recrutas"
        subtitle="Migração da base antiga via CSV. Valide antes de importar."
      />

      <section className="surface-jungle px-5 py-4 flex items-start gap-3">
        <IconUpload
          size={20}
          className="text-bronze shrink-0 mt-0.5"
          stroke={1.5}
          aria-hidden
        />
        <div className="flex flex-col gap-1">
          <h2 className="label-display text-[10px] text-text-primary">
            Fluxo recomendado
          </h2>
          <ol className="text-text-secondary text-[12px] leading-relaxed list-decimal list-inside">
            <li>Exporte do CRM antigo como CSV (Excel: Salvar como → CSV UTF-8).</li>
            <li>Cole abaixo e clique <b>Validar</b>. Confira a tabela.</li>
            <li>Se aparecer erro em alguma linha, edite e cole de novo.</li>
            <li>Clique <b>Importar agora</b> — só as linhas válidas vão pro banco.</li>
          </ol>
        </div>
      </section>

      <ImportForm />
    </div>
  );
}
