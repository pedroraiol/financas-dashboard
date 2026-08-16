import { useState } from "react";
import { monthKey, shiftMonthKey } from "../utils/date";

export function useMonthSelector(initial: Date = new Date()) {
  const [selected, setSelected] = useState(() => monthKey(initial));

  const goToPrevious = () => setSelected((k) => shiftMonthKey(k, -1));
  const goToNext = () => setSelected((k) => shiftMonthKey(k, 1));
  const goToCurrent = () => setSelected(monthKey(new Date()));
  const goToMonth = (key: string) => setSelected(key);

  return { selectedMonth: selected, goToPrevious, goToNext, goToCurrent, goToMonth };
}
