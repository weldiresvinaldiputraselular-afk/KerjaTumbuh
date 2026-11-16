import Shell from "@/components/Shell";
import Flash from "@/components/Flash";
import SubmitButton from "@/components/SubmitButton";
import { requireSeeker, seekerSkillIds } from "@/lib/auth";
import { loadSkills } from "@/lib/queries";
import { EDUCATION_LEVELS } from "@/lib/format";
import { addExperience, addPortfolio, deleteExperience, deletePortfolio, saveSeekerProfile } from "@/app/actions/seeker";

export const dynamic = "force-dynamic";

export default async function SeekerProfilePage({ searchParams }: { searchParams: Promise<{ msg?: string; error?: string }> }) {
  const sp = await searchParams;
  const { supabase, profile, seeker } = await requireSeeker();
  const skills = await loadSkills(supabase);
  const owned = new Set(seekerSkillIds(seeker));
  const [{ data: exps }, { data: ports }] = await Promise.all([
    supabase.from("seeker_experiences").select("id, title, organization, description").eq("seeker_id", seeker.id),
    supabase.from("seeker_portfolios").select("id, title, description, url").eq("seeker_id", seeker.id),
  ]);
  const categories = Array.from(new Set(skills.map((s) => s.category)));

  return (
    <Shell>
      <h1 className="h1">Profil Pencari Kerja</h1>
      <p className="muted mb-4">Profil dan keterampilan yang lengkap membuat pencocokan lowongan lebih akurat.</p>
      <Flash msg={sp.msg} error={sp.error} />
      <form action={saveSeekerProfile} className="card space-y-4">
        <h2 className="h2">Data diri dan keterampilan</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label htmlFor="full_name" className="label">Nama lengkap</label><input id="full_name" name="full_name" required defaultValue={profile.full_name} className="input" /></div>
          <div><label htmlFor="headline" className="label">Headline</label><input id="headline" name="headline" defaultValue={seeker.headline ?? ""} maxLength={120} className="input" placeholder="Contoh: Lulusan baru, minat admin media sosial" /></div>
          <div><label htmlFor="city" className="label">Kota domisili</label><input id="city" name="city" defaultValue={seeker.city ?? ""} className="input" /></div>
          <div><label htmlFor="education_level" className="label">Pendidikan terakhir</label>
            <select id="education_level" name="education_level" defaultValue={seeker.education_level ?? ""} className="input">
              <option value="">Pilih</option>{EDUCATION_LEVELS.map((e) => <option key={e} value={e}>{e}</option>)}
            </select></div>
          <div><label htmlFor="years_experience" className="label">Pengalaman kerja (tahun)</label><input id="years_experience" name="years_experience" type="number" min={0} max={60} defaultValue={seeker.years_experience} className="input" /></div>
        </div>
        <div><label htmlFor="bio" className="label">Ringkasan diri</label><textarea id="bio" name="bio" rows={4} maxLength={1000} defaultValue={seeker.bio ?? ""} className="input" /></div>
        <fieldset>
          <legend className="label">Keterampilan</legend>
          {categories.map((cat) => (
            <div key={cat} className="mb-2">
              <p className="text-xs font-semibold uppercase text-slate-500">{cat}</p>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                {skills.filter((s) => s.category === cat).map((s) => (
                  <label key={s.id} className="flex items-center gap-1.5"><input type="checkbox" name="skills" value={s.id} defaultChecked={owned.has(s.id)} /> {s.name}</label>
                ))}
              </div>
            </div>
          ))}
        </fieldset>
        <SubmitButton>Simpan profil</SubmitButton>
      </form>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="card" aria-labelledby="exp">
          <h2 id="exp" className="h2">Pengalaman</h2>
          <ul className="mt-2 space-y-2 text-sm">
            {(exps ?? []).map((e: { id: string; title: string; organization: string | null; description: string | null }) => (
              <li key={e.id} className="flex items-start justify-between gap-2 rounded-lg bg-slate-50 p-3">
                <div><p className="font-semibold">{e.title}</p><p className="text-slate-600">{e.organization}</p><p className="text-slate-600">{e.description}</p></div>
                <form action={deleteExperience}><input type="hidden" name="id" value={e.id} /><button className="btn-danger btn-sm" type="submit">Hapus</button></form>
              </li>
            ))}
            {(exps ?? []).length === 0 && <li className="muted">Belum ada pengalaman.</li>}
          </ul>
          <form action={addExperience} className="mt-3 space-y-2">
            <div><label htmlFor="exp_title" className="label">Jabatan / peran</label><input id="exp_title" name="title" required className="input" /></div>
            <div><label htmlFor="exp_org" className="label">Organisasi / tempat</label><input id="exp_org" name="organization" className="input" /></div>
            <div><label htmlFor="exp_desc" className="label">Deskripsi singkat</label><textarea id="exp_desc" name="description" rows={2} maxLength={500} className="input" /></div>
            <SubmitButton className="btn-outline">Tambah pengalaman</SubmitButton>
          </form>
        </section>
        <section className="card" aria-labelledby="port">
          <h2 id="port" className="h2">Portofolio</h2>
          <ul className="mt-2 space-y-2 text-sm">
            {(ports ?? []).map((p: { id: string; title: string; description: string | null; url: string | null }) => (
              <li key={p.id} className="flex items-start justify-between gap-2 rounded-lg bg-slate-50 p-3">
                <div><p className="font-semibold">{p.title}</p><p className="text-slate-600">{p.description}</p>
                  {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-brand-dark underline">{p.url}</a>}</div>
                <form action={deletePortfolio}><input type="hidden" name="id" value={p.id} /><button className="btn-danger btn-sm" type="submit">Hapus</button></form>
              </li>
            ))}
            {(ports ?? []).length === 0 && <li className="muted">Belum ada portofolio.</li>}
          </ul>
          <form action={addPortfolio} className="mt-3 space-y-2">
            <div><label htmlFor="p_title" className="label">Judul karya</label><input id="p_title" name="title" required className="input" /></div>
            <div><label htmlFor="p_desc" className="label">Deskripsi singkat</label><textarea id="p_desc" name="description" rows={2} maxLength={500} className="input" /></div>
            <div><label htmlFor="p_url" className="label">Tautan (https://...)</label><input id="p_url" name="url" type="url" className="input" /></div>
            <SubmitButton className="btn-outline">Tambah portofolio</SubmitButton>
          </form>
        </section>
      </div>
    </Shell>
  );
}
