import { notFound } from "next/navigation";
import { PageHeader } from "@/components/squad/page-header";
import { RecruitForm } from "@/components/recruta/recruit-form";
import { updateRecruitAction } from "@/lib/actions/recruit";
import { getRecruitById } from "@/lib/queries/recruit";

export const metadata = {
  title: "Editar recruta — Squad Five",
};

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export default async function EditarRecrutaPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const recruit = await getRecruitById(id);
  if (!recruit) notFound();

  const action = updateRecruitAction.bind(null, recruit.id);

  return (
    <div className="flex flex-col gap-5 max-w-3xl mx-auto w-full">
      <PageHeader
        title={`Editar ${recruit.name}`}
        subtitle="Atualize a ficha. Campos vazios são permitidos exceto nome."
      />
      <RecruitForm
        action={action}
        submitLabel="Salvar alterações"
        cancelHref={`/recrutas/${recruit.id}`}
        defaults={{
          name: recruit.name,
          contactName: recruit.contactName,
          contactEmail: recruit.contactEmail,
          contactPhone: recruit.contactPhone,
          segment: recruit.segment,
          campaignBudget: recruit.campaignBudget
            ? Number(recruit.campaignBudget)
            : null,
          theses: recruit.theses,
          notes: recruit.notes,
          status: recruit.status,
        }}
      />
    </div>
  );
}
