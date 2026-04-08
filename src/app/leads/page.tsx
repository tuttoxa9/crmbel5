"use client";

import { useState } from "react";
import { Plus, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLeads } from "@/hooks/use-leads";
import { CreateLeadModal } from "@/components/leads/create-lead-modal";
import { KanbanBoard } from "@/components/leads/kanban-board";
import { LeadTable } from "@/components/leads/lead-table";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { format, addDays, subDays, startOfDay } from "date-fns";
import { ru } from "date-fns/locale";

type ViewMode = "kanban" | "table";

export default function LeadsPage() {
  const { leads, loading, error } = useLeads();
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));

  const filteredLeads = leads.filter((lead) => {
    // 1. Search Query filtering
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = lead.name.toLowerCase().includes(query) || (lead.phone && lead.phone.toLowerCase().includes(query));
      if (!matchesSearch) return false;
    }

    return true; // The date logic is applied in KanbanBoard so it can show the "old" labels
  });

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col gap-16 md:flex-row md:items-center justify-between mb-24 shrink-0">
        <h1 className="text-page-title text-textPrimary">Лиды</h1>
        
        <div className="flex items-center gap-12">
          <div className="flex bg-surfaceSecondary rounded-md border border-border p-4">
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-8 rounded-sm transition-colors ${
                viewMode === "kanban" ? "bg-surface shadow-sm text-textPrimary" : "text-textMuted hover:text-textPrimary"
              }`}
            >
              <LayoutGrid className="w-16 h-16" strokeWidth={1.5} />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-8 rounded-sm transition-colors ${
                viewMode === "table" ? "bg-surface shadow-sm text-textPrimary" : "text-textMuted hover:text-textPrimary"
              }`}
            >
              <List className="w-16 h-16" strokeWidth={1.5} />
            </button>
          </div>
          
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-16 h-16 mr-8" strokeWidth={1.5} />
            Создать лид
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-12 mb-24 shrink-0 justify-between">
        <div className="flex items-center gap-12">
          <div className="flex items-center bg-surface border border-border rounded-md p-4">
            <button
              onClick={() => setSelectedDate(prev => subDays(prev, 1))}
              className="p-8 hover:bg-hover rounded-sm text-textMuted hover:text-textPrimary transition-colors"
            >
              <ChevronLeft className="w-16 h-16" strokeWidth={1.5} />
            </button>
            <div className="flex items-center gap-8 px-12 min-w-[140px] justify-center">
              <CalendarIcon className="w-14 h-14 text-accent" strokeWidth={1.5} />
              <span className="text-body-bold text-textPrimary capitalize">
                {format(selectedDate, "d MMMM", { locale: ru })}
              </span>
            </div>
            <button
              onClick={() => setSelectedDate(prev => addDays(prev, 1))}
              className="p-8 hover:bg-hover rounded-sm text-textMuted hover:text-textPrimary transition-colors"
            >
              <ChevronRight className="w-16 h-16" strokeWidth={1.5} />
            </button>
          </div>

          <div className="relative w-[240px]">
            <Input
              type="date"
              value={format(selectedDate, "yyyy-MM-dd")}
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedDate(startOfDay(new Date(e.target.value)));
                }
              }}
              className="h-[42px]"
            />
          </div>
        </div>

        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-12 top-1/2 -translate-y-1/2 w-16 h-16 text-textMuted" strokeWidth={1.5} />
          <Input 
            placeholder="Поиск по имени или телефону..." 
            className="pl-40 h-[42px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="w-32 h-32 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center text-[#FF3B30]">
            Ошибка загрузки лидов
          </div>
        ) : viewMode === "kanban" ? (
          <KanbanBoard leads={filteredLeads} selectedDate={selectedDate} />
        ) : (
          <LeadTable leads={filteredLeads} />
        )}
      </div>

      <CreateLeadModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
}
