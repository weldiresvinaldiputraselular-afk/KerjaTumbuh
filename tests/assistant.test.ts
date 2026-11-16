import assert from "node:assert/strict";
import { generateCvSummary, profileTips, profileCompleteness, careerRecommendations, type AssistantProfile } from "../lib/assistant";

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

const empty: AssistantProfile = { name: "Budi", headline: null, bio: null, city: null, education: null, years: 0, skills: [], experiences: [], portfolioCount: 0 };
const full: AssistantProfile = {
  name: "Sari", headline: "Admin media sosial", bio: "Lulusan baru yang terbiasa mengelola konten dan melayani pelanggan dengan ramah dan teliti setiap hari.",
  city: "Pontianak", education: "S1", years: 2, skills: ["Canva", "Media Sosial", "Copywriting", "Excel"],
  experiences: [{ title: "Admin toko", organization: "Toko A" }], portfolioCount: 1,
};

test("ringkasan CV memuat nama dan keterampilan", () => {
  const s = generateCvSummary(full, "Admin Media Sosial");
  assert.ok(s.includes("Sari"));
  assert.ok(s.includes("Canva"));
  assert.ok(s.includes("Admin Media Sosial"));
});

test("ringkasan CV profil kosong tetap valid", () => {
  const s = generateCvSummary(empty);
  assert.ok(s.startsWith("Budi"));
  assert.ok(!s.includes("undefined"));
});

test("tips profil kosong menyertakan prioritas tinggi", () => {
  const t = profileTips(empty);
  assert.ok(t.some((x) => x.priority === "tinggi"));
});

test("profil lengkap = 100 persen dan tips positif", () => {
  assert.equal(profileCompleteness(full).percent, 100);
  assert.equal(profileTips(full).length, 1);
});

test("profil kosong = 0 persen", () => {
  assert.equal(profileCompleteness(empty).percent, 0);
});

test("rekomendasi karier menyebut lowongan teratas", () => {
  const r = careerRecommendations(full, [{ title: "Kasir", score: 80 }], ["Excel"]);
  assert.ok(r[0].includes("Kasir (80%)"));
});

console.log(`\n${passed} tes lulus`);
