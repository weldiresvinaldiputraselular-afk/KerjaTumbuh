import Shell from "@/components/Shell";
import Flash from "@/components/Flash";
import VacancyForm from "@/components/VacancyForm";
import { requireUmkm } from "@/lib/auth";
import { loadSkills } from "@/lib/queries";
import { createVacancy } from "@/app/actions/umkm";

export const dynamic = "force-dynamic";

export default async function NewVacancy({ searchParams }: { searchParams: Promise<{ msg?: string; error?: string }> }) {
  const sp = await searchParams;
  const { supabase } = await requireUmkm();
  const skills = await loadSkills(supabase);
  return (
    <Shell>
      <h1 className="h1 mb-4">Buat Lowongan</h1>
      <Flash msg={sp.msg} error={sp.error} />
      <VacancyForm action={createVacancy} skills={skills} submitLabel="Simpan lowongan" />
    </Shell>
  );
}
