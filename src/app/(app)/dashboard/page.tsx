import { auth } from "@/auth";
import { DynamicGreeting } from "@/components/dashboard/DynamicGreeting";
import { ClockWidget } from "@/components/dashboard/ClockWidget";
import { WeatherWidget } from "@/components/dashboard/WeatherWidget";
import { DashboardSummary } from "@/components/dashboard/DashboardSummary";
import { ModuleCards } from "@/components/dashboard/ModuleCards";

export default async function DashboardPage() {
  const session = await auth();
  const name = session?.user?.name || "Sanith";

  return (
    <div>
      <DynamicGreeting name={name} />

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <ClockWidget />
        <WeatherWidget />
      </div>

      <DashboardSummary />

      <div>
        <h2 className="mb-4 text-lg font-medium">Quick Access</h2>
        <ModuleCards />
      </div>
    </div>
  );
}
