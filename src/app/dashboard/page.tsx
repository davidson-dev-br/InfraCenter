import { ItemPalette } from "@/components/dashboard/item-palette";
import { FloorPlan } from "@/components/dashboard/floor-plan";
import { FloorPlanProvider } from "@/components/dashboard/floor-plan-context";

export default function DashboardPage() {
  return (
    <FloorPlanProvider>
      <div className="container grid flex-1 gap-8 px-4 py-8 mx-auto md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr]">
        <aside className="h-full">
          <ItemPalette />
        </aside>
        <section>
          <FloorPlan />
        </section>
      </div>
    </FloorPlanProvider>
  );
}
