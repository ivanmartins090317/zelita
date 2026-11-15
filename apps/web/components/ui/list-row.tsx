import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface ListRowProps {
  icon?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  trailing?: ReactNode;
  className?: string;
  /** No celular, subtítulo e ações ocupam a largura do card. A partir de `sm`, volta à linha. */
  stackOnMobile?: boolean;
}

const ROW_FRAME =
  "border-b border-line-2 px-5 py-4 last:border-b-0 hover:bg-sand";

const ICON_FRAME =
  "flex size-icon flex-none items-center justify-center rounded-field bg-brand-50 text-base";

/**
 * Linha de lista do painel: 64 px de altura mínima, divisor entre irmãs e
 * a última sem divisor. Com `stackOnMobile`, o celular empilha título,
 * subtítulo e ações para o texto não ficar espremido pelo bloco da direita.
 */
function ListRow({
  icon,
  title,
  subtitle,
  trailing,
  className,
  stackOnMobile = false,
}: ListRowProps) {
  if (!stackOnMobile) {
    return (
      <div className={cn("flex min-h-row items-center gap-3", ROW_FRAME, className)}>
        {icon ? (
          <span aria-hidden className={ICON_FRAME}>
            {icon}
          </span>
        ) : null}
        <div className="min-w-0">
          <div className="truncate text-body font-bold text-ink">{title}</div>
          {subtitle ? (
            <div className="text-secondary text-muted">{subtitle}</div>
          ) : null}
        </div>
        {trailing ? (
          <div className="ml-auto flex flex-none items-center gap-2">{trailing}</div>
        ) : null}
      </div>
    );
  }

  const trailingRow = subtitle
    ? "row-start-3 sm:row-start-1 sm:row-span-2"
    : "row-start-2 sm:row-start-1";

  return (
    <div
      className={cn(
        "grid items-center gap-x-3 gap-y-2 sm:min-h-row sm:gap-y-1",
        icon
          ? "grid-cols-[auto_minmax(0,1fr)] sm:grid-cols-[auto_minmax(0,1fr)_auto]"
          : "grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto]",
        ROW_FRAME,
        className,
      )}
    >
      {icon ? (
        <span
          aria-hidden
          className={cn(
            ICON_FRAME,
            "col-start-1 row-start-1 self-center",
            subtitle && "sm:row-span-2",
          )}
        >
          {icon}
        </span>
      ) : null}
      <div
        className={cn(
          "min-w-0 self-center",
          icon ? "col-start-2 row-start-1" : "col-start-1 row-start-1",
        )}
      >
        <div className="truncate text-body font-bold text-ink">{title}</div>
      </div>
      {subtitle ? (
        <div
          className={cn(
            "min-w-0 text-secondary text-muted",
            icon
              ? "col-span-2 col-start-1 row-start-2 sm:col-span-1 sm:col-start-2"
              : "col-start-1 row-start-2",
          )}
        >
          {subtitle}
        </div>
      ) : null}
      {trailing ? (
        <div
          className={cn(
            "flex flex-wrap items-center gap-2",
            icon ? "col-span-2 col-start-1" : "col-start-1",
            trailingRow,
            icon
              ? "sm:col-span-1 sm:col-start-3"
              : "sm:col-start-2",
            "sm:w-auto sm:flex-none sm:flex-nowrap sm:justify-self-end",
          )}
        >
          {trailing}
        </div>
      ) : null}
    </div>
  );
}

export { ListRow };
