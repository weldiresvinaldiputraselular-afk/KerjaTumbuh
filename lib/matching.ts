// Smart Job Matching - aturan transparan (sesuai Bab III proposal):
// Skor = 70% keterampilan + 15% lokasi + 15% pengalaman (skala 0-100).

export interface SeekerForMatch {
  city: string | null;
  years_experience: number;
  skill_ids: number[];
}

export interface VacancyForMatch {
  city: string | null;
  work_type: string;
  min_experience: number;
  skill_ids: number[];
}

export interface MatchResult {
  score: number; // 0-100
  skillScore: number; // 0-1
  locationScore: number; // 0 atau 1
  experienceScore: number; // 0-1
  matchedSkillIds: number[];
  missingSkillIds: number[];
}

export const WEIGHTS = { skills: 0.7, location: 0.15, experience: 0.15 } as const;

function norm(s: string | null | undefined): string {
  return (s ?? "").trim().toLowerCase();
}

export function computeMatch(seeker: SeekerForMatch, vacancy: VacancyForMatch): MatchResult {
  const owned = new Set(seeker.skill_ids);
  const required = Array.from(new Set(vacancy.skill_ids));
  const matchedSkillIds = required.filter((id) => owned.has(id));
  const missingSkillIds = required.filter((id) => !owned.has(id));

  // Lowongan tanpa daftar keterampilan dianggap tidak menuntut keterampilan khusus.
  const skillScore = required.length === 0 ? 1 : matchedSkillIds.length / required.length;

  const sameCity = norm(vacancy.city) !== "" && norm(vacancy.city) === norm(seeker.city);
  const locationScore = vacancy.work_type === "remote" || sameCity ? 1 : 0;

  const years = Math.max(seeker.years_experience, 0);
  const experienceScore = vacancy.min_experience <= 0 ? 1 : Math.min(years / vacancy.min_experience, 1);

  const raw = WEIGHTS.skills * skillScore + WEIGHTS.location * locationScore + WEIGHTS.experience * experienceScore;
  const score = Math.min(100, Math.max(0, Math.round(raw * 100)));

  return { score, skillScore, locationScore, experienceScore, matchedSkillIds, missingSkillIds };
}

export function rankByMatch<T>(
  seeker: SeekerForMatch,
  items: T[],
  toVacancy: (item: T) => VacancyForMatch,
): { item: T; match: MatchResult }[] {
  return items
    .map((item) => ({ item, match: computeMatch(seeker, toVacancy(item)) }))
    .sort((a, b) => b.match.score - a.match.score);
}

// Menghitung keterampilan yang paling sering dibutuhkan tetapi belum dimiliki.
export function aggregateSkillGaps(missingLists: number[][]): { skillId: number; count: number }[] {
  const counts = new Map<number, number>();
  for (const list of missingLists) for (const id of list) counts.set(id, (counts.get(id) ?? 0) + 1);
  return Array.from(counts.entries())
    .map(([skillId, count]) => ({ skillId, count }))
    .sort((a, b) => b.count - a.count || a.skillId - b.skillId);
}
