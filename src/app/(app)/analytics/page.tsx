import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AnalyticsPage } from "@/components/analytics/AnalyticsPage";

export default async function Analytics() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/dashboard");
  }
  return <AnalyticsPage />;
}
