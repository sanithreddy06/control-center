import { auth } from "@/auth";
import { ClockWidget } from "@/components/dashboard/ClockWidget";
import { WeatherWidget } from "@/components/dashboard/WeatherWidget";
import { ModuleCards } from "@/components/dashboard/ModuleCards";

export default async function DashboardPage() {
  const session = await auth();
  const firstName = session?.user?.name?.split(" ")[0] || "Sanith";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          Hi, {firstName} 👋
        </h1>
        <p className="mt-1 text-neutral-500">Welcome back to Control Center</p>
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <ClockWidget />
        <WeatherWidget />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-medium">Quick Access</h2>
        <ModuleCards />
      </div>
    </div>
  );
}
