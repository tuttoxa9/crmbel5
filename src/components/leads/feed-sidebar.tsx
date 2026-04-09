"use client";

import { useDateStore } from "@/lib/store/date-store";
import { Lead } from "@/types/lead";
import { isBefore, startOfDay, isSameDay } from "date-fns";
import { FilterType } from "@/app/leads/page";
import { PhoneCall, CalendarDays, AlertCircle, Inbox, Clock, Zap, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedSidebarProps {
  leads: Lead[];
  activeFilter: FilterType;
  onSelectFilter: (filter: FilterType) => void;
}

export function FeedSidebar({ leads, activeFilter, onSelectFilter }: FeedSidebarProps) {
  const { selectedDate } = useDateStore();

  const isFilterActive = (filter: FilterType) => {
    if (filter.type !== activeFilter.type) return false;
    if (filter.type === "status" && activeFilter.type === "status") {
      return filter.status === activeFilter.status;
    }
    return true;
  };

  // Counts
  const newLeadsCount = leads.filter(l => l.status === "new").length;

  const urgentCount = leads.filter(l => {
    if (l.status === "success" || l.status === "decline" || l.status === "bank-decline" || l.status === "defect") return false;
    if (!l.nextActionDate) return false;
    return isBefore(startOfDay(new Date(l.nextActionDate)), selectedDate);
  }).length;

  const todayCallsCount = leads.filter(l => {
    if (!["in-work", "no-answer", "thinking", "callback"].includes(l.status)) return false;
    if (!l.nextActionDate) return false;
    return isSameDay(new Date(l.nextActionDate), selectedDate);
  }).length;

  const todayVisitsCount = leads.filter(l => {
    if (l.status !== "visit") return false;
    if (!l.nextActionDate) return false;
    return isSameDay(new Date(l.nextActionDate), selectedDate);
  }).length;

  const thinkingCount = leads.filter(l => l.status === "thinking").length;
  const inWorkCount = leads.filter(l => l.status === "in-work" || l.status === "no-answer" || l.status === "callback").length;


  const FilterButton = ({ filter, icon: Icon, label, count, urgent = false }: { filter: FilterType, icon: React.ElementType, label: string, count: number, urgent?: boolean }) => {
    const active = isFilterActive(filter);
    return (
      <button
        onClick={() => onSelectFilter(filter)}
        className={cn(
          "w-full flex items-center justify-between px-12 py-8 rounded-md transition-colors text-caption text-left group",
          active ? "bg-accent/10 text-accent font-medium" : "hover:bg-hover text-textPrimary",
          urgent && !active && "text-[#FF3B30] hover:bg-[#FF3B30]/10"
        )}
      >
        <div className="flex items-center gap-8 min-w-0">
          <Icon className={cn("w-14 h-14 shrink-0", active ? "text-accent" : urgent ? "text-[#FF3B30]" : "text-textMuted group-hover:text-textPrimary")} strokeWidth={1.5} />
          <span className="truncate">{label}</span>
        </div>
        {count > 0 && (
          <span className={cn(
            "text-[10px] px-6 py-2 rounded-full font-bold ml-8 shrink-0",
            active ? "bg-accent text-white" : urgent ? "bg-[#FF3B30] text-white" : "bg-surfaceSecondary text-textMuted group-hover:text-textPrimary"
          )}>
            {count}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="w-[220px] shrink-0 h-full overflow-y-auto pr-8 custom-scrollbar">
      <div className="space-y-24">

        {/* Urgent & Focus */}
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-textMuted mb-8 px-12">Фокус</h3>
          <div className="space-y-4">
            <FilterButton
              filter={{ type: "status", status: "new" }}
              icon={Zap}
              label="Новые"
              count={newLeadsCount}
              urgent={newLeadsCount > 0}
            />
            <FilterButton
              filter={{ type: "urgent" }}
              icon={AlertCircle}
              label="Просроченные"
              count={urgentCount}
              urgent={urgentCount > 0}
            />
          </div>
        </div>

        {/* Today's Plan */}
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-textMuted mb-8 px-12">План на день</h3>
          <div className="space-y-4">
            <FilterButton
              filter={{ type: "today_calls" }}
              icon={PhoneCall}
              label="Звонки"
              count={todayCallsCount}
            />
            <FilterButton
              filter={{ type: "today_visits" }}
              icon={CalendarDays}
              label="Приезды"
              count={todayVisitsCount}
            />
          </div>
        </div>

        {/* All Active */}
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-textMuted mb-8 px-12">В работе</h3>
          <div className="space-y-4">
            <FilterButton
              filter={{ type: "status", status: "thinking" }}
              icon={Clock}
              label="Думают"
              count={thinkingCount}
            />
            <FilterButton
              filter={{ type: "status", status: "in-work" }}
              icon={Inbox}
              label="В процессе"
              count={inWorkCount}
            />
          </div>
        </div>

        {/* Archive / End statuses */}
         <div>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-textMuted mb-8 px-12">Завершенные</h3>
          <div className="space-y-4">
            <FilterButton
              filter={{ type: "status", status: "success" }}
              icon={CheckCircle2}
              label="Успешно"
              count={0} // Don't show count for archive to save perf
            />
            <FilterButton
              filter={{ type: "status", status: "decline" }}
              icon={XCircle}
              label="Отказы"
              count={0}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
