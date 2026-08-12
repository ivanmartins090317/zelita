"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ptBR as dayPickerPtBR } from "react-day-picker/locale";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface DatePickerFieldProps {
  id?: string;
  value: string;
  onChange: (isoDate: string) => void;
  name?: string;
  required?: boolean;
  className?: string;
}

function parseLocalIsoDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

function toLocalIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function DatePickerField({
  id,
  value,
  onChange,
  name,
  required,
  className,
}: DatePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const selectedDate = value ? parseLocalIsoDate(value) : undefined;

  /**
   * `showModal` empilha o calendário na top layer acima do modal que o contém —
   * sem isso o `<dialog>` da cartela sempre cobriria o popover.
   */
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      return;
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  function handleSelect(date: Date | undefined) {
    if (!date) return;
    onChange(toLocalIsoDate(date));
    setOpen(false);
  }

  return (
    <>
      {name ? (
        <input type="hidden" name={name} value={value} required={required} />
      ) : null}

      <Button
        id={id}
        type="button"
        variant="outline"
        size="sm"
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          "h-field w-full justify-start border-line bg-white px-3 text-left font-normal text-brand-900",
          !value && "text-muted",
          className,
        )}
        onClick={() => setOpen(true)}
      >
        <CalendarIcon className="mr-2 size-4 text-muted" />
        {value
          ? format(selectedDate!, "dd/MM/yyyy", { locale: ptBR })
          : "Selecionar data"}
      </Button>

      <dialog
        ref={dialogRef}
        aria-label="Escolher data"
        className="fixed inset-0 z-50 m-auto w-fit max-w-[calc(100vw-2rem)] overflow-hidden rounded-panel border border-line bg-white p-0 shadow-card backdrop:bg-ink/40"
        onCancel={(event) => {
          event.preventDefault();
          setOpen(false);
        }}
        onClick={(event) => {
          if (event.target === dialogRef.current) {
            setOpen(false);
          }
        }}
      >
        <Calendar
          mode="single"
          locale={dayPickerPtBR}
          captionLayout="dropdown"
          selected={selectedDate}
          onSelect={handleSelect}
          defaultMonth={selectedDate}
        />
        <div className="flex items-center justify-between border-t border-line-2 px-3 py-2">
          <button
            type="button"
            className="text-sm font-bold text-brand-600 hover:text-brand-700"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
          >
            Limpar
          </button>
          <button
            type="button"
            className="text-sm font-bold text-brand-600 hover:text-brand-700"
            onClick={() => {
              onChange(toLocalIsoDate(new Date()));
              setOpen(false);
            }}
          >
            Hoje
          </button>
        </div>
      </dialog>
    </>
  );
}

export { DatePickerField, parseLocalIsoDate, toLocalIsoDate };
