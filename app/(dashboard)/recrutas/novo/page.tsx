import { PageHeader } from "@/components/squad/page-header";
import { RecruitForm } from "@/components/recruta/recruit-form";
import { createRecruitAction } from "@/lib/actions/recruit";

export const metadata = {
  title: "Recrutar novo — Squad Five",
};

export const dynamic = "force-dynamic";

export default function NovoRecrutaPage() {
  return (
    <div className="flex flex-col gap-5 max-w-3xl mx-auto w-full">
      <PageHeader
        title="Recrutar novo"
        subtitle="Cadastre a ficha do novo recruta. Operações ficam pra depois."
      />
      <RecruitForm
        action={createRecruitAction}
        submitLabel="Recrutar"
        cancelHref="/recrutas"
      />
    </div>
  );
}
