import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/squad/page-header";
import { LibraryForm } from "@/components/biblioteca/library-form";
import { updateLibraryItemAction } from "@/lib/actions/library";
import { getLibraryItemById } from "@/lib/queries/library";

export const metadata = { title: "Editar item — Biblioteca" };
export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export default async function EditarLibraryItemPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const item = await getLibraryItemById(id);
  if (!item) notFound();
  if (item.source === "DRIVE") {
    redirect(`/biblioteca/${item.id}`);
  }

  const action = updateLibraryItemAction.bind(null, item.id);

  return (
    <div className="flex flex-col gap-5 max-w-4xl mx-auto w-full">
      <PageHeader
        title={`Editar: ${item.title}`}
        subtitle="Atualize conteúdo, categoria ou tags."
      />
      <LibraryForm
        action={action}
        submitLabel="Salvar alterações"
        cancelHref={`/biblioteca/${item.id}`}
        defaults={{
          title: item.title,
          category: item.category,
          content: item.content,
          tags: item.tags,
        }}
      />
    </div>
  );
}
