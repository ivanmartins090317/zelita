"use client";

import { Chip, Chips } from "@/components/ui/chips";
import { familyContent } from "@/content/family";
import type { AlertFeedFilter } from "@/modules/alerts/domain/alert-feed-types";
import { ALERT_FEED_FILTER } from "@/modules/alerts/domain/alert-feed-types";

interface AlertFeedFiltersProps {
  activeFilter: AlertFeedFilter;
  onFilterChange: (filter: AlertFeedFilter) => void;
}

const FILTER_ORDER: AlertFeedFilter[] = [
  ALERT_FEED_FILTER.all,
  ALERT_FEED_FILTER.emergency,
  ALERT_FEED_FILTER.medications,
  ALERT_FEED_FILTER.location,
];

function AlertFeedFilters({
  activeFilter,
  onFilterChange,
}: AlertFeedFiltersProps) {
  const labels = familyContent.avisos.feed.filters;

  return (
    <Chips aria-label={familyContent.avisos.feed.filtersAriaLabel}>
      {FILTER_ORDER.map((filter) => (
        <Chip
          key={filter}
          selected={activeFilter === filter}
          onClick={() => onFilterChange(filter)}
        >
          {labels[filter]}
        </Chip>
      ))}
    </Chips>
  );
}

export { AlertFeedFilters };
