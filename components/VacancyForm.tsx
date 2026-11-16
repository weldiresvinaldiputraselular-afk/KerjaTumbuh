import SubmitButton from "@/components/SubmitButton";
import { WORK_TYPE_LABEL } from "@/lib/format";
import type { Skill } from "@/lib/types";

interface Defaults {
  id?: string;
  title?: string;
  description?: string;
  city?: string | null;
  work_type?: string;
  min_experience?: number;
  positions?: number;
  salary_note?: string | null;
  skillIds?: number[];
  status?: string;
}

export default function VacancyForm({ action, skills, defaults = {}, submitLabel }: {
  action: (formData: FormData) => void | Promise<void>;
  skills: Skill[];
  defaults?: Defaults;
  submitLabel: string;
}) {
  const chosen = new Set(defaults.skillIds ?? []);
  const categories = Array.from(new Set(skills.map((s) => s.category)));
  const canSubmitReview = !defaults.status || ["draft", "rejected"].includes(defaults.status);
  return (
    <form action={action} className="card space-y-4">
      {defaults.id && <input type="hidden" name="id" value={defaults.id} />}
      <div><label htmlFor="title" className="label">Judul lowongan</label><input id="title" name="title" required minLength={3} maxLength={120} defaultValue={defaults.title ?? ""} className="input" /></div>
      <div><label htmlFor="description" className="label">Deskripsi pekerjaan (minimal 20 karakter)</label><textarea id="description" name="description" required minLength={20} maxLength={3000} rows={6} defaultValue={defaults.description ?? ""} className="input" /></div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div><label htmlFor="city" className="label">Kota</label><input id="city" name="city" defaultValue={defaults.city ?? ""} className="input" /></div>
        <div><label htmlFor="work_type" className="label">Jenis pekerjaan</label>
          <select id="work_type" name="work_type" defaultValue={defaults.work_type ?? "full_time"} className="input">
            {Object.entries(WORK_TYPE_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select></div>
        <div><label htmlFor="salary_note" className="label">Catatan gaji (opsional)</label><input id="salary_note" name="salary_note" maxLength={120} defaultValue={defaults.salary_note ?? ""} className="input" placeholder="Contoh: Sesuai UMK" /></div>
        <div><label htmlFor="min_experience" className="label">Pengalaman minimal (tahun)</label><input id="min_experience" name="min_experience" type="number" min={0} max={40} defaultValue={defaults.min_experience ?? 0} className="input" /></div>
        <div><label htmlFor="positions" className="label">Jumlah posisi</label><input id="positions" name="positions" type="number" min={1} max={1000} defaultValue={defaults.positions ?? 1} className="input" /></div>
      </div>
      <fieldset>
        <legend className="label">Keterampilan yang dibutuhkan</legend>
        {categories.map((cat) => (
          <div key={cat} className="mb-2">
            <p className="text-xs font-semibold uppercase text-slate-500">{cat}</p>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {skills.filter((s) => s.category === cat).map((s) => (
                <label key={s.id} className="flex items-center gap-1.5"><input type="checkbox" name="skills" value={s.id} defaultChecked={chosen.has(s.id)} /> {s.name}</label>
              ))}
            </div>
          </div>
        ))}
      </fieldset>
      {canSubmitReview && (
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="submit_for_review" /> Kirim untuk diverifikasi administrator sekarang</label>
      )}
      <SubmitButton>{submitLabel}</SubmitButton>
    </form>
  );
}
