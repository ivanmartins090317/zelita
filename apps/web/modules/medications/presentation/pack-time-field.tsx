"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Chip, Chips } from "@/components/ui/chips";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { familyContent } from "@/content/family";

const TIME_OPTIONS = ["08:00", "12:00", "18:00", "22:00"] as const;

function isPresetTime(time: string): boolean {
  return (TIME_OPTIONS as readonly string[]).includes(time);
}

function normalizeHm(raw: string): string | null {
  const match = /^(\d{1,2}):(\d{2})/.exec(raw.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function sortTimes(times: string[]): string[] {
  return [...times].sort((left, right) => left.localeCompare(right));
}

function selectNextTimes(
  current: string[],
  time: string,
  limit: number,
): string[] {
  if (current.includes(time)) return current;
  if (current.length >= limit) {
    return sortTimes([...current.slice(1), time]);
  }
  return sortTimes([...current, time]);
}

interface PackTimeFieldProps {
  dosesPerDay: number;
  selectedTimes: string[];
  readOnly: boolean;
  onChange: (times: string[]) => void;
}

function PackTimeField({
  dosesPerDay,
  selectedTimes,
  readOnly,
  onChange,
}: PackTimeFieldProps) {
  const copy = familyContent.remedios.modal;
  const [extraTimes, setExtraTimes] = useState<string[]>(() =>
    selectedTimes.filter((time) => !isPresetTime(time)),
  );
  const [customTime, setCustomTime] = useState("");
  const [customTimeInvalid, setCustomTimeInvalid] = useState(false);

  const chipTimes = sortTimes([
    ...TIME_OPTIONS,
    ...extraTimes.filter((time) => !isPresetTime(time)),
  ]);
  const timesValid = selectedTimes.length === dosesPerDay;

  function toggleTime(time: string) {
    if (selectedTimes.includes(time)) {
      onChange(selectedTimes.filter((value) => value !== time));
      return;
    }
    onChange(selectNextTimes(selectedTimes, time, dosesPerDay));
  }

  function addCustomTime() {
    const normalized = normalizeHm(customTime);
    if (!normalized) {
      setCustomTimeInvalid(true);
      return;
    }
    setCustomTimeInvalid(false);
    if (!isPresetTime(normalized)) {
      setExtraTimes((current) =>
        current.includes(normalized)
          ? current
          : sortTimes([...current, normalized]),
      );
    }
    onChange(selectNextTimes(selectedTimes, normalized, dosesPerDay));
    setCustomTime("");
  }

  return (
    <Field label={copy.fields.times}>
      <Chips>
        {chipTimes.map((time) => (
          <Chip
            key={time}
            type="button"
            selected={selectedTimes.includes(time)}
            disabled={readOnly}
            onClick={() => toggleTime(time)}
          >
            {time}
          </Chip>
        ))}
      </Chips>
      {readOnly ? null : (
        <div className="mt-3">
          <p
            id="pack-custom-time-label"
            className="mb-1.5 text-compact font-bold text-muted"
          >
            {copy.customTimeLabel}
          </p>
          <div className="flex items-center gap-2">
            <Input
              id="pack-custom-time"
              type="time"
              aria-labelledby="pack-custom-time-label"
              value={customTime}
              className="max-w-40"
              onChange={(event) => {
                setCustomTime(event.target.value);
                setCustomTimeInvalid(false);
              }}
              onKeyDown={(event) => {
                if (event.key !== "Enter") return;
                event.preventDefault();
                addCustomTime();
              }}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={addCustomTime}
            >
              {copy.customTimeAdd}
            </Button>
          </div>
          {customTimeInvalid ? (
            <p className="mt-2 text-sm text-red-700">{copy.customTimeInvalid}</p>
          ) : null}
        </div>
      )}
      <input type="hidden" name="times" value={selectedTimes.join(",")} />
      {timesValid ? null : (
        <p className="mt-2 text-sm text-red-700">
          {copy.timesMismatch.replace("{count}", String(dosesPerDay))}
        </p>
      )}
    </Field>
  );
}

export { PackTimeField, sortTimes };
