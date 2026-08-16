import { useState } from "react";
import { monthKey, shiftMonthKey } from "../utils/date";

export function useMonthSelector(initial: Date = new Date()) {
  const [selected, setSelected] = useState(() => monthKey(initial));

  const goToPrevious = () => setSelected((k) => shiftMonthKey(k, -1));
  const goToNext = () => setSelected((k) => shiftMonthKey(k, 1));
  const goToCurrent = () => setSelected(monthKey(new Date()));

  return { selectedMonth: selected, goToPrevious, goToNext, goToCurrent };
}
