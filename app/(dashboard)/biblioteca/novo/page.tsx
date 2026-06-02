import { PageHeader } from "@/components/squad/page-header";
import { LibraryForm } from "@/components/biblioteca/library-form";
import { createLibraryItemAction } from "@/lib/actions/library";

export const metadata = { title: "Novo item — Biblioteca" };
export const dynamic = "force-dynamic";

export default function NovoLibraryItemPage() {
  return (
    <div className="flex flex-col gap-5 max-w-4xl mx-auto w-full">
      <PageHeader
        title="Novo item na biblioteca"
        subtitle="Templates, roteiros, prompts e processos reutilizáveis do squad."
      />
      <LibraryForm
        action={createLibraryItemAction}
        submitLabel="Adicionar ao acervo"
        cancelHref="/biblioteca"
      />
    </div>
  );
}
