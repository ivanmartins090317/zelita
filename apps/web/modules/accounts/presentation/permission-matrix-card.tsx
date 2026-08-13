import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { familyContent } from "@/content/family";
import {
  PERMISSION_MATRIX_ROLES,
  PERMISSION_MATRIX_ROWS,
  permissionCellAriaLabel,
  permissionCellSymbol,
} from "@/modules/accounts/domain/permission-matrix";
import type { AccountRole } from "@/modules/accounts/domain/roles";

function PermissionMatrixCard() {
  const copy = familyContent.participantes.matrix;

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>{copy.title}</CardTitle>
      </CardHeader>
      <CardBody className="overflow-x-auto">
        <p className="mb-4 text-compact text-muted">{copy.legend}</p>
        <table className="w-full min-w-[640px] border-collapse text-left text-secondary">
          <thead>
            <tr className="border-b border-line-2">
              <th className="pb-3 pr-4 font-bold text-muted">Permissão</th>
              {PERMISSION_MATRIX_ROLES.map((role) => (
                <th
                  key={role}
                  className="pb-3 px-2 text-center text-compact font-bold uppercase tracking-wide text-muted"
                >
                  {copy.roleHeaders[role as AccountRole]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMISSION_MATRIX_ROWS.map((row) => (
              <tr key={row.id} className="border-b border-line-2 last:border-b-0">
                <td className="py-3 pr-4 font-medium text-ink">{row.label}</td>
                {PERMISSION_MATRIX_ROLES.map((role) => {
                  const value = row.cells[role];
                  const note = row.conditionalNote?.[role];
                  return (
                    <td
                      key={`${row.id}-${role}`}
                      className="py-3 px-2 text-center"
                    >
                      <span
                        title={permissionCellAriaLabel(value, note)}
                        aria-label={permissionCellAriaLabel(value, note)}
                        className={
                          value === "conditional"
                            ? "font-bold text-amber-ink"
                            : value === "allowed"
                              ? "font-bold text-brand-700"
                              : "text-muted"
                        }
                      >
                        {value === "conditional" && note
                          ? note
                          : permissionCellSymbol(value)}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
}

export { PermissionMatrixCard };
