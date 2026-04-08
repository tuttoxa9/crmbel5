"use client";

import { Lead, STATUS_NAMES, LeadStatus, SOURCE_NAMES } from "@/types/lead";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Clock, Car } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { isBefore, startOfDay, isSameDay } from "date-fns";

interface KanbanBoardProps {
  leads: Lead[];
  onLeadClick: (id: string) => void;
}

const COLUMNS: LeadStatus[] = [
  "new", "in-work", "visit", "thinking", "callback", "success", "no-answer"
];

const STATUS_COLORS: Record<LeadStatus, "default" | "success" | "warning" | "danger" | "info" | "outline"> = {
  "new": "info",
  "in-work": "warning",
  "visit": "warning",
  "thinking": "default",
  "callback": "warning",
  "success": "success",
  "no-answer": "danger",
  "decline": "danger",
  "bank-decline": "danger",
  "defect": "danger",
};

export function KanbanBoard({ leads, onLeadClick }: KanbanBoardProps) {

  const getLeadsByStatus = (status: LeadStatus) => {
    return leads.filter((lead) => lead.status === status);
  };

  return (
    <div className="h-full flex gap-12 overflow-x-auto pb-16 snap-x snap-mandatory">
      {COLUMNS.map((status) => {
        const columnLeads = getLeadsByStatus(status);
        
        return (
          <div key={status} className="flex flex-col min-w-[260px] w-[260px] snap-center">
            <div className="flex items-center gap-8 mb-12 px-4">
              <h3 className="text-[14px] font-bold text-textPrimary">{STATUS_NAMES[status]}</h3>
              <Badge variant="outline" className="text-textMuted">{columnLeads.length}</Badge>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-8 pr-4 pb-32">
              {columnLeads.map((lead) => {
                const targetDate = lead.nextActionDate ? new Date(lead.nextActionDate) : new Date(lead.createdAt);
                const isOverdue = isBefore(startOfDay(targetDate), startOfDay(new Date()));
                const showRedBadge = isOverdue && !isSameDay(targetDate, new Date());

                return (
                  <motion.div
                    key={lead.id}
                    layoutId={lead.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card-base p-12 rounded-[10px] cursor-pointer relative group"
                    onClick={() => onLeadClick(lead.id)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-[13px] font-semibold text-textPrimary leading-tight">{lead.name}</h4>
                        {lead.phone && (
                          <a
                            href={`tel:${lead.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-[11px] text-textMuted hover:text-accent transition-colors block mt-2"
                          >
                            {lead.phone}
                          </a>
                        )}
                      </div>
                      <Badge variant={STATUS_COLORS[status]} className="scale-[0.8] origin-top-right">
                        {SOURCE_NAMES[lead.source]}
                      </Badge>
                    </div>

                    {lead.car && (
                      <div className="flex items-center gap-4 mt-4 text-[11px] text-textPrimary">
                        <Car className="w-10 h-10 text-textMuted" strokeWidth={1.5} />
                        <span className="truncate">{lead.car}</span>
                      </div>
                    )}

                    {lead.notes && (
                      <p className="mt-4 text-[11px] text-textMuted line-clamp-2 leading-snug">
                        {lead.notes}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                      {lead.nextActionDate ? (
                        <div className={`flex items-center gap-4 text-[10px] px-4 py-[2px] rounded-sm font-medium ${showRedBadge ? "text-[#FF3B30] bg-[#FF3B30]/10" : "text-accent bg-accent/5"}`}>
                          <Clock className="w-8 h-8" strokeWidth={1.5} />
                          <span>
                            {format(lead.nextActionDate, "d MMM", { locale: ru })}
                            {lead.nextActionTime && `, ${lead.nextActionTime}`}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-textMuted">Без даты</span>
                      )}
                      <span className="text-[10px] text-textMuted">
                        {format(lead.createdAt, "HH:mm")}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
              
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
