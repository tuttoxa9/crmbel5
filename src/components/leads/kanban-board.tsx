"use client";

import { Lead, STATUS_NAMES, LeadStatus, SOURCE_NAMES } from "@/types/lead";
import { format, startOfDay, isBefore } from "date-fns";
import { ru } from "date-fns/locale";
import { Clock, Car, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

interface KanbanBoardProps {
  leads: Lead[];
  selectedDate: Date;
}

const COLUMNS: LeadStatus[] = [
  "new", "in-work", "visit", "thinking", "callback", "bought", "no-answer", "defect"
];

const STATUS_COLORS: Record<LeadStatus, "default" | "success" | "warning" | "danger" | "info" | "outline"> = {
  "new": "info",
  "in-work": "warning",
  "visit": "warning",
  "thinking": "default",
  "callback": "warning",
  "bought": "success",
  "no-answer": "danger",
  "defect": "danger",
};

export function KanbanBoard({ leads, selectedDate }: KanbanBoardProps) {
  const router = useRouter();

  const getLeadsByStatus = (status: LeadStatus) => {
    const targetStartOfDay = startOfDay(selectedDate).getTime();

    return leads.filter((lead) => {
      if (lead.status !== status) return false;

      // New or unassigned leads should probably show up on "Today" or their created date if they don't have nextActionDate.
      // But the requirement says: "Если человек работает сегодня... пришел лид ... этот лид появится только в дате 9 апреля".
      // Also: "чтобы не упускать старые лиды... они будут в этой колонке 9 апреля, но с пометкой 8 апреля".

      // Let's determine the "active" date for this lead.
      // 1. If nextActionDate exists, use it.
      // 2. Otherwise use createdAt.
      const leadDateValue = lead.nextActionDate ? lead.nextActionDate : lead.createdAt;
      const leadStartOfDay = startOfDay(new Date(leadDateValue)).getTime();
      const nowStartOfDay = startOfDay(new Date()).getTime();

      const isLeadBeforeTarget = leadStartOfDay < targetStartOfDay;
      const isLeadOnTarget = leadStartOfDay === targetStartOfDay;

      // We show the lead in the selectedDate column if:
      // - The lead's date is EXACTLY the selectedDate.
      // - OR, the lead's date is IN THE PAST (missed) AND the selectedDate is TODAY.
      // This prevents "missed" leads from showing up on future dates, but always keeps them visible on "Today" until actioned.
      if (isLeadOnTarget) {
         return true;
      }

      if (targetStartOfDay === nowStartOfDay && isLeadBeforeTarget) {
         return true;
      }

      return false;
    });
  };

  return (
    <div className="h-full flex gap-16 overflow-x-auto pb-16 snap-x snap-mandatory">
      {COLUMNS.map((status) => {
        const columnLeads = getLeadsByStatus(status);
        
        return (
          <div key={status} className="flex flex-col min-w-[260px] w-[260px] snap-center">
            <div className="flex items-center gap-6 mb-12 px-4">
              <h3 className="text-[14px] font-semibold text-textPrimary">{STATUS_NAMES[status]}</h3>
              <Badge variant="outline" className="text-textMuted text-[11px] px-2 py-0">{columnLeads.length}</Badge>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-8 pr-4 pb-32">
              {columnLeads.map((lead) => {
                const leadDateValue = lead.nextActionDate ? lead.nextActionDate : lead.createdAt;
                const isMissed = isBefore(startOfDay(new Date(leadDateValue)), startOfDay(selectedDate));

                return (
                <motion.div
                  key={lead.id}
                  layoutId={lead.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`card-base p-12 rounded-[8px] cursor-pointer relative group text-[13px] ${isMissed ? 'border-[#FF3B30]/30 bg-[#FF3B30]/5' : ''}`}
                  onClick={() => router.push(`/leads/${lead.id}`)}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="max-w-[140px]">
                      <h4 className="font-semibold text-textPrimary leading-tight truncate">{lead.name}</h4>
                      {lead.phone && (
                        <a 
                          href={`tel:${lead.phone}`} 
                          onClick={(e) => e.stopPropagation()}
                          className="text-[12px] text-textMuted hover:text-accent transition-colors block mt-2"
                        >
                          {lead.phone}
                        </a>
                      )}
                    </div>
                    <Badge variant={STATUS_COLORS[status]} className="text-[10px] px-2 py-0 h-16">
                      {SOURCE_NAMES[lead.source]}
                    </Badge>
                  </div>

                  {lead.car && (
                    <div className="flex items-center gap-4 mt-6 text-[12px] text-textPrimary">
                      <Car className="w-12 h-12 text-textMuted" strokeWidth={1.5} />
                      <span className="truncate">{lead.car}</span>
                    </div>
                  )}

                  {lead.notes && (
                    <p className="mt-6 text-[12px] text-textMuted line-clamp-2 leading-snug">
                      {lead.notes}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-12 pt-8 border-t border-border">
                    <div className="flex items-center gap-4">
                      {lead.nextActionDate ? (
                        <div className={`flex items-center gap-4 text-[11px] px-4 py-2 rounded-sm ${isMissed ? 'text-[#FF3B30] bg-[#FF3B30]/10 font-medium' : 'text-accent bg-accent/5'}`}>
                          <Clock className="w-12 h-12" strokeWidth={1.5} />
                          <span>
                            {format(lead.nextActionDate, "d MMM", { locale: ru })}
                            {lead.nextActionTime && `, ${lead.nextActionTime}`}
                          </span>
                        </div>
                      ) : (
                        <div className={`flex items-center gap-4 text-[11px] px-4 py-2 rounded-sm ${isMissed ? 'text-[#FF3B30] bg-[#FF3B30]/10 font-medium' : 'text-textMuted bg-surfaceSecondary'}`}>
                          <Clock className="w-12 h-12" strokeWidth={1.5} />
                          <span>
                            {format(lead.createdAt, "d MMM", { locale: ru })} (создан)
                          </span>
                        </div>
                      )}

                      {isMissed && (
                        <AlertCircle className="w-14 h-14 text-[#FF3B30]" strokeWidth={2} />
                      )}
                    </div>
                    <span className="text-[10px] text-textMuted shrink-0">
                      {format(lead.createdAt, "HH:mm")}
                    </span>
                  </div>
                </motion.div>
              )})}
              
              {columnLeads.length === 0 && (
                <div className="h-full min-h-[100px] border-2 border-dashed border-border rounded-[12px] flex items-center justify-center text-caption text-textMuted">
                  Нет лидов
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
