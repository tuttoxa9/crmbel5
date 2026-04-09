"use client";

import { useDateStore } from "@/lib/store/date-store";
import { format, addDays, subDays, isToday } from "date-fns";
import { ru } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const { selectedDate, setSelectedDate } = useDateStore();

  const handlePrevDay = () => setSelectedDate(subDays(selectedDate, 1));
  const handleNextDay = () => setSelectedDate(addDays(selectedDate, 1));
  const handleToday = () => setSelectedDate(new Date());

  const formattedDate = isToday(selectedDate)
    ? "Сегодня"
    : format(selectedDate, "d MMMM yyyy", { locale: ru });

  const dateValue = format(selectedDate, "yyyy-MM-dd");

  return (
    <header className="h-64 border-b border-border bg-surface flex items-center justify-between px-16 md:px-32 sticky top-0 z-10">
      <div className="flex items-center gap-16">
        <h2 className="text-[20px] font-bold text-textPrimary capitalize w-32 md:w-auto">
          {formattedDate}
        </h2>

        <div className="flex items-center bg-surfaceSecondary rounded-md border border-border p-4">
          <Button variant="ghost" size="icon" className="h-32 w-32 rounded-sm" onClick={handlePrevDay}>
            <ChevronLeft className="w-16 h-16 text-textMuted" />
          </Button>

          <div className="relative flex items-center justify-center px-8 cursor-pointer hover:bg-hover rounded-sm h-32 w-32 group">
             <CalendarIcon className="w-16 h-16 text-textMuted group-hover:text-textPrimary transition-colors" />
             <input
                type="date"
                value={dateValue}
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedDate(new Date(e.target.value));
                  }
                }}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
             />
          </div>

          <Button variant="ghost" size="icon" className="h-32 w-32 rounded-sm" onClick={handleNextDay}>
            <ChevronRight className="w-16 h-16 text-textMuted" />
          </Button>
        </div>

        {!isToday(selectedDate) && (
          <Button variant="outline" className="h-32 text-caption px-12" onClick={handleToday}>
            Сегодня
          </Button>
        )}
      </div>

      <div className="flex items-center gap-16">
        {/* User profile or other top right items can go here */}
      </div>
    </header>
  );
}
