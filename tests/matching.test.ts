import assert from "node:assert/strict";
import { computeMatch, rankByMatch, aggregateSkillGaps } from "../lib/matching";

let passed = 0;
function test(name: string, fn: () => void) {
  try {
    fn();
    passed++;
    console.log("PASS", name);
  } catch (e) {
    console.error("FAIL", name, e);
    process.exitCode = 1;
  }
}

const seeker = { city: "Pontianak", years_experience: 2, skill_ids: [1, 2, 3] };

test("kecocokan sempurna = 100", () => {
  const r = computeMatch(seeker, { city: "pontianak", work_type: "full_time", min_experience: 1, skill_ids: [1, 2] });
  assert.equal(r.score, 100);
  assert.deepEqual(r.missingSkillIds, []);
});

test("keterampilan sebagian: 1 dari 2, lokasi dan pengalaman penuh = 65", () => {
  const r = computeMatch(seeker, { city: "Pontianak", work_type: "full_time", min_experience: 0, skill_ids: [1, 9] });
  assert.equal(r.score, 65); // 0.7*0.5 + 0.15 + 0.15 = 0.65
  assert.deepEqual(r.missingSkillIds, [9]);
  assert.deepEqual(r.matchedSkillIds, [1]);
});

test("tanpa keterampilan cocok, kota berbeda, pengalaman kurang = 4", () => {
  const r = computeMatch({ city: "Bengkayang", years_experience: 1, skill_ids: [] }, {
    city: "Pontianak", work_type: "full_time", min_experience: 4, skill_ids: [5, 6],
  });
  assert.equal(r.score, 4); // 0.15 * (1/4) = 0.0375 -> 4
});

test("lowongan remote mengabaikan kota", () => {
  const r = computeMatch({ city: null, years_experience: 0, skill_ids: [1] }, {
    city: "Jakarta", work_type: "remote", min_experience: 0, skill_ids: [1],
  });
  assert.equal(r.score, 100);
});

test("lowongan tanpa daftar keterampilan: skor keterampilan penuh", () => {
  const r = computeMatch({ city: "A", years_experience: 0, skill_ids: [] }, {
    city: "B", work_type: "part_time", min_experience: 0, skill_ids: [],
  });
  assert.equal(r.skillScore, 1);
  assert.equal(r.score, 85); // 70 + 0 + 15
});

test("skor selalu 0-100 dan pengalaman negatif tidak merusak", () => {
  const r = computeMatch({ city: null, years_experience: -5, skill_ids: [] }, {
    city: null, work_type: "full_time", min_experience: 3, skill_ids: [1],
  });
  assert.ok(r.score >= 0 && r.score <= 100);
  assert.equal(r.score, 0);
});

test("keterampilan duplikat pada lowongan dihitung sekali", () => {
  const r = computeMatch(seeker, { city: "X", work_type: "full_time", min_experience: 0, skill_ids: [1, 1, 9] });
  assert.equal(r.matchedSkillIds.length, 1);
  assert.equal(r.missingSkillIds.length, 1);
});

test("rankByMatch mengurutkan dari skor tertinggi", () => {
  const items = [
    { id: "a", v: { city: "Z", work_type: "full_time", min_experience: 5, skill_ids: [8] } },
    { id: "b", v: { city: "Pontianak", work_type: "full_time", min_experience: 0, skill_ids: [1] } },
  ];
  const ranked = rankByMatch(seeker, items, (i) => i.v);
  assert.equal(ranked[0].item.id, "b");
});

test("aggregateSkillGaps mengurutkan berdasarkan frekuensi", () => {
  const g = aggregateSkillGaps([[5, 6], [5], [7, 5, 6]]);
  assert.deepEqual(g[0], { skillId: 5, count: 3 });
  assert.deepEqual(g[1], { skillId: 6, count: 2 });
});

console.log(`\n${passed} tes lulus`);
