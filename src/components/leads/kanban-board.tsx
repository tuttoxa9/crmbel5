"use client";

import { Lead, STATUS_NAMES, LeadStatus, SOURCE_NAMES } from "@/types/lead";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Clock, Car } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

interface KanbanBoardProps {
  leads: Lead[];
}

const COLUMNS: LeadStatus[] = [
  "new", "in-work", "visit", "test", "thinking", "callback", "signed", "bought", "no-answer", "decline", "bank-decline", "defect"
];

const STATUS_COLORS: Record<LeadStatus, "default" | "success" | "warning" | "danger" | "info" | "outline"> = {
  "new": "info",
  "in-work": "warning",
  "visit": "warning",
  "test": "warning",
  "thinking": "default",
  "callback": "warning",
  "signed": "success",
  "bought": "success",
  "no-answer": "danger",
  "decline": "danger",
  "bank-decline": "danger",
  "defect": "danger",
};

export function KanbanBoard({ leads }: KanbanBoardProps) {
  const router = useRouter();

  const getLeadsByStatus = (status: LeadStatus) => {
    return leads.filter((lead) => lead.status === status);
  };

  return (
    <div className="h-full flex gap-16 overflow-x-auto pb-16 snap-x snap-mandatory">
      {COLUMNS.map((status) => {
        const columnLeads = getLeadsByStatus(status);
        
        return (
          <div key={status} className="flex flex-col min-w-[320px] w-[320px] snap-center">
            <div className="flex items-center gap-8 mb-16 px-4">
              <h3 className="text-section-title text-textPrimary">{STATUS_NAMES[status]}</h3>
              <Badge variant="outline" className="text-textMuted">{columnLeads.length}</Badge>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-12 pr-4 pb-32">
              {columnLeads.map((lead) => (
                <motion.div
                  key={lead.id}
                  layoutId={lead.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card-base p-16 rounded-[12px] cursor-pointer relative group"
                  onClick={() => router.push(`/leads/${lead.id}`)}
                >
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h4 className="text-body-bold text-textPrimary">{lead.name}</h4>
                      {lead.phone && (
                        <a 
                          href={`tel:${lead.phone}`} 
                          onClick={(e) => e.stopPropagation()}
                          className="text-caption text-textMuted hover:text-accent transition-colors block mt-2"
                        >
                          {lead.phone}
                        </a>
                      )}
                    </div>
                    <Badge variant={STATUS_COLORS[status]}>
                      {SOURCE_NAMES[lead.source]}
                    </Badge>
                  </div>

                  {lead.car && (
                    <div className="flex items-center gap-6 mt-8 text-caption text-textPrimary">
                      <Car className="w-14 h-14 text-textMuted" strokeWidth={1.5} />
                      <span>{lead.car}</span>
                    </div>
                  )}

                  {lead.notes && (
                    <p className="mt-8 text-caption text-textMuted line-clamp-2 leading-relaxed">
                      {lead.notes}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-16 pt-12 border-t border-border">
                    {lead.nextActionDate ? (
                      <div className="flex items-center gap-6 text-caption text-accent bg-accent/5 px-6 py-2 rounded-sm">
                        <Clock className="w-14 h-14" strokeWidth={1.5} />
                        <span>
                          {format(lead.nextActionDate, "d MMM", { locale: ru })}
                          {lead.nextActionTime && `, ${lead.nextActionTime}`}
                        </span>
                      </div>
                    ) : (
                      <div />
                    )}
                    <span className="text-[11px] text-textMuted">
                      {format(lead.createdAt, "HH:mm")}
                    </span>
                  </div>
                </motion.div>
              ))}
              
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
