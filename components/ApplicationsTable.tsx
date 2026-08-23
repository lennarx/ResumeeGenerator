import Link from "next/link";
import type { Application } from "@/lib/types";

export default function ApplicationsTable({
  applications,
}: {
  applications: Application[];
}) {
  return (
    <div className="hidden overflow-hidden rounded-2xl border border-border bg-surface md:block">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-muted">
            <th className="px-4 py-3 font-medium">Empresa</th>
            <th className="px-4 py-3 font-medium">CV usado</th>
            <th className="px-4 py-3 font-medium">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((application) => (
            <tr key={application.id} className="border-b border-border last:border-b-0">
              <td className="px-4 py-3 font-semibold text-foreground">
                {application.hasGeneratedCv ? (
                  <Link
                    href={`/historial/${application.id}`}
                    className="text-accent hover:underline"
                  >
                    {application.company}
                  </Link>
                ) : (
                  application.company
                )}
              </td>
              <td className="px-4 py-3 text-muted">{application.cvUsed}</td>
              <td className="px-4 py-3 text-muted">{application.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
