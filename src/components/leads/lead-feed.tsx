"use client";

import { useState } from "react";
import { Lead, LeadStatus, STATUS_NAMES } from "@/types/lead";
import { FilterType } from "@/app/leads/page";
import { useDateStore } from "@/lib/store/date-store";
import { isBefore, isSameDay, startOfDay, format } from "date-fns";
import { ru } from "date-fns/locale";
import { Phone, Calendar, Clock, ChevronRight, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { doc, updateDoc, addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

interface LeadFeedProps {
  leads: Lead[];
  filter: FilterType;
  onSelectLead: (id: string) => void;
}

export function LeadFeed({ leads, filter, onSelectLead }: LeadFeedProps) {
  const { selectedDate } = useDateStore();
  const [quickNote, setQuickNote] = useState<Record<string, string>>({});
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const filteredLeads = leads.filter(l => {
    // End statuses are explicitly filtered unless specifically requested
    const isEndStatus = ["success", "decline", "bank-decline", "defect"].includes(l.status);

    if (filter.type === "urgent") {
      if (isEndStatus) return false;
      if (!l.nextActionDate) return false;
      return isBefore(startOfDay(new Date(l.nextActionDate)), selectedDate);
    }

    if (filter.type === "today_calls") {
      if (!["in-work", "no-answer", "thinking", "callback"].includes(l.status)) return false;
      if (!l.nextActionDate) return false;
      return isSameDay(new Date(l.nextActionDate), selectedDate);
    }

    if (filter.type === "today_visits") {
      if (l.status !== "visit") return false;
      if (!l.nextActionDate) return false;
      return isSameDay(new Date(l.nextActionDate), selectedDate);
    }

    if (filter.type === "status") {
      if (filter.status === "in-work") {
         return ["in-work", "no-answer", "callback"].includes(l.status);
      }
      return l.status === filter.status;
    }

    return false;
  }).sort((a, b) => (b.nextActionDate || 0) - (a.nextActionDate || 0));

  const handleQuickAction = async (lead: Lead, action: "reschedule" | "no-answer" | "visit" | "success" | "decline") => {
    setIsUpdating(lead.id);
    try {
      const now = Date.now();
      const updates: Partial<Lead> = { updatedAt: now };
      let historyMsg = "";

      const noteToSave = quickNote[lead.id];
      if (noteToSave) {
        updates.notes = lead.notes ? `${lead.notes}\n${format(now, "dd.MM HH:mm")}: ${noteToSave}` : noteToSave;
      }

      if (action === "reschedule") {
        const nextDay = new Date(selectedDate);
        nextDay.setDate(nextDay.getDate() + 1);
        updates.nextActionDate = nextDay.getTime();
        updates.status = "callback";
        historyMsg = `Перенесено на завтра. ${noteToSave || ""}`;
      } else if (action === "no-answer") {
        updates.status = "no-answer";
        historyMsg = `Недозвон. ${noteToSave || ""}`;
      } else if (action === "visit") {
        updates.status = "visit";
        historyMsg = `Назначен приезд. ${noteToSave || ""}`;
      } else {
        updates.status = action;
        historyMsg = `Статус изменен на ${STATUS_NAMES[action as LeadStatus]}. ${noteToSave || ""}`;
        updates.nextActionDate = null; // Clear action for end statuses
      }

      await updateDoc(doc(db!, "leads", lead.id), updates);
      await addDoc(collection(db!, `leads/${lead.id}/history`), {
        status: updates.status || lead.status,
        notes: historyMsg,
        changedAt: now,
      });

      setQuickNote(prev => ({ ...prev, [lead.id]: "" }));
      toast.success("Обновлено");
    } catch (error) {
      console.error(error);
      toast.error("Ошибка");
    } finally {
      setIsUpdating(null);
    }
  };

  if (filteredLeads.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-textMuted p-32 text-center">
        <div className="w-64 h-64 bg-surfaceSecondary rounded-full flex items-center justify-center mb-16">
          <Clock className="w-32 h-32 opacity-50" />
        </div>
        <h3 className="text-body-bold text-textPrimary mb-8">В этом списке пока пусто</h3>
        <p className="text-caption max-w-[300px]">Вы выполнили все задачи из этого списка. Отличная работа!</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-16 md:p-32 space-y-16 custom-scrollbar">
      {filteredLeads.map(lead => {
        const isUrgentDate = lead.nextActionDate && isBefore(startOfDay(new Date(lead.nextActionDate)), selectedDate);

        return (
          <div key={lead.id} className="card-light dark:card-dark p-20 rounded-[12px] flex flex-col gap-16 border border-transparent hover:border-border transition-colors">

            {/* Header */}
            <div className="flex justify-between items-start gap-16">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-8 mb-4">
                  <h3 className="text-[16px] font-bold text-textPrimary truncate">{lead.name}</h3>
                  <Badge variant="outline" className="text-[10px] uppercase">{STATUS_NAMES[lead.status]}</Badge>
                </div>
                <div className="flex items-center gap-12 text-caption">
                  {lead.phone && (
                    <a href={`tel:${lead.phone}`} className="flex items-center gap-4 text-textMuted hover:text-accent transition-colors font-medium">
                      <Phone className="w-12 h-12" />
                      {lead.phone}
                    </a>
                  )}
                  {lead.car && <span className="text-textMuted">• {lead.car}</span>}
                </div>
              </div>

              <div className="flex flex-col items-end gap-8 shrink-0">
                {lead.nextActionDate && (
                  <div className={`flex items-center gap-4 text-[11px] font-bold px-8 py-4 rounded-sm ${isUrgentDate ? 'bg-[#FF3B30]/10 text-[#FF3B30]' : 'bg-surfaceSecondary text-textMuted'}`}>
                    <Calendar className="w-12 h-12" />
                    {format(lead.nextActionDate, "d MMM", { locale: ru })}
                    {lead.nextActionTime && `, ${lead.nextActionTime}`}
                  </div>
                )}
                <Button variant="ghost" size="sm" className="h-24 text-[11px] px-8" onClick={() => onSelectLead(lead.id)}>
                  Вся история
                  <ChevronRight className="w-12 h-12 ml-4" />
                </Button>
              </div>
            </div>

            {/* Content (Notes) */}
            {lead.notes && (
              <div className="bg-surfaceSecondary/50 p-12 rounded-md border border-border/50 text-caption text-textPrimary leading-relaxed">
                {lead.notes}
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-col lg:flex-row gap-12 pt-16 border-t border-border">
              <div className="flex-1 relative">
                <MessageSquare className="absolute left-12 top-1/2 -translate-y-1/2 w-14 h-14 text-textMuted" />
                <Input
                  className="pl-36 h-36 text-caption bg-surfaceSecondary border-transparent focus:border-accent"
                  value={quickNote[lead.id] || ""}
                  onChange={(e) => setQuickNote(prev => ({ ...prev, [lead.id]: e.target.value }))}
                />
              </div>
              <div className="flex flex-wrap gap-8 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-36 text-caption bg-surface border-border hover:bg-hover hover:text-textPrimary"
                  isLoading={isUpdating === lead.id}
                  onClick={() => handleQuickAction(lead, "reschedule")}
                >
                  Завтра
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-36 text-caption bg-surface border-border hover:bg-hover hover:text-textPrimary"
                  isLoading={isUpdating === lead.id}
                  onClick={() => handleQuickAction(lead, "no-answer")}
                >
                  Недозвон
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-36 text-caption bg-surface border-border hover:bg-hover hover:text-textPrimary"
                  isLoading={isUpdating === lead.id}
                  onClick={() => handleQuickAction(lead, "visit")}
                >
                  Приезд
                </Button>
                <div className="w-[1px] h-24 bg-border self-center mx-4 hidden lg:block" />
                <Button
                  variant="primary"
                  size="sm"
                  className="h-36 text-caption bg-[#32D74B] hover:bg-[#28A745] text-white"
                  isLoading={isUpdating === lead.id}
                  onClick={() => handleQuickAction(lead, "success")}
                >
                  Сделка
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="h-36 text-caption bg-[#FF3B30] hover:bg-[#D73227] text-white"
                  isLoading={isUpdating === lead.id}
                  onClick={() => handleQuickAction(lead, "decline")}
                >
                  Отказ
                </Button>
              </div>
            </div>

          </div>
        );
      })}
    </div>
  );
}
