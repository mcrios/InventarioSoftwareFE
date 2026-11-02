import { StatCard } from "@/components/dashboard/StatCard";
import { fleetStats } from "@/lib/inventory";

export function FleetStats() {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {fleetStats.map((stat) => (
        <StatCard key={stat.id} stat={stat} />
      ))}
    </div>
  );
}
