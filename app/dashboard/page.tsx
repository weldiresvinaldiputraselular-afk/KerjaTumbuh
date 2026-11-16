import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";

export default async function DashboardRedirect() {
  const { profile } = await getSessionProfile();
  if (!profile) redirect("/login");
  redirect(`/dashboard/${profile.role}`);
}
