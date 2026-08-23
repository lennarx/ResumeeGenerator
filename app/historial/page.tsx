import ApplicationCard from "@/components/ApplicationCard";
import { mockApplications } from "@/lib/mock-data";

export default function HistorialPage() {
  return (
    <div className="flex flex-col gap-4 px-4 pt-6 pb-4">
      <h1 className="text-2xl font-bold text-foreground">Historial</h1>

      <div className="flex flex-col gap-3">
        {mockApplications.map((application) => (
          <ApplicationCard key={application.id} application={application} />
        ))}
      </div>
    </div>
  );
}
