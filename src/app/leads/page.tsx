"use client";

import { useState } from "react";
import { Plus, LayoutGrid, List, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLeads } from "@/hooks/use-leads";
import { CreateLeadModal } from "@/components/leads/create-lead-modal";
import { KanbanBoard } from "@/components/leads/kanban-board";
import { LeadTable } from "@/components/leads/lead-table";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { format, addDays, subDays, startOfDay, isBefore, isSameDay } from "date-fns";
import { ru } from "date-fns/locale";
import { LeadDrawer } from "@/components/leads/lead-drawer";

type ViewMode = "kanban" | "table";

export default function LeadsPage() {
  const { leads, loading, error } = useLeads();
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredLeads = leads.filter((lead) => {
    // 0. Table Filters (Source & Status) - only matter if we are in table mode, but we can apply them globally
    if (viewMode === "table") {
      if (sourceFilter !== "all" && lead.source !== sourceFilter) return false;
      if (statusFilter !== "all" && lead.status !== statusFilter) return false;
    }

    // 1. Text Search Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = lead.name.toLowerCase().includes(query) ||
        (lead.phone && lead.phone.toLowerCase().includes(query));
      if (!matchesSearch) return false;
    }

    // 2. Date Filter
    const targetDate = lead.nextActionDate ? startOfDay(new Date(lead.nextActionDate)) : startOfDay(new Date(lead.createdAt));

    // If selected date is "Today", also include leads that are overdue (their targetDate is before today)
    const today = startOfDay(new Date());
    const isSelectedToday = isSameDay(selectedDate, today);

    if (isSelectedToday) {
      // Return true if it's assigned to today OR in the past (overdue)
      return isSameDay(targetDate, selectedDate) || isBefore(targetDate, selectedDate);
    } else {
      // Return true only if it strictly matches the selected date
      return isSameDay(targetDate, selectedDate);
    }
  });

  const handlePrevDay = () => setSelectedDate(subDays(selectedDate, 1));
  const handleNextDay = () => setSelectedDate(addDays(selectedDate, 1));

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

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-12 mb-24 shrink-0">
        <div className="flex flex-wrap items-center gap-12">
          <div className="relative w-[240px]">
            <Search className="absolute left-10 top-1/2 -translate-y-1/2 w-14 h-14 text-textMuted" strokeWidth={1.5} />
            <Input
              placeholder="Поиск..."
              className="pl-32 h-[32px] text-[13px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {viewMode === "table" && (
            <>
              <select
                value={sourceFilter}
                onChange={e => setSourceFilter(e.target.value)}
                className="h-[32px] bg-surfaceSecondary border border-border rounded-[6px] px-8 text-[13px] text-textPrimary focus:outline-none"
              >
                <option value="all">Все источники</option>
                <option value="site">Сайт</option>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="call">Звонок</option>
                <option value="walk-in">С улицы</option>
              </select>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="h-[32px] bg-surfaceSecondary border border-border rounded-[6px] px-8 text-[13px] text-textPrimary focus:outline-none"
              >
                <option value="all">Все статусы</option>
                <option value="new">Новый</option>
                <option value="in-work">В работе</option>
                <option value="visit">Приезд</option>
                <option value="success">Сделка</option>
                <option value="no-answer">Не дозвон</option>
                <option value="decline">Отказ</option>
                <option value="bank-decline">Отказ банка</option>
                <option value="defect">Брак / Тест</option>
              </select>
            </>
          )}
        </div>

        {viewMode === "kanban" && (
        <div className="flex items-center gap-4 bg-surface border border-border rounded-[8px] p-[2px]">
          <button
            onClick={handlePrevDay}
            className="p-4 text-textMuted hover:bg-hover hover:text-textPrimary rounded-[6px] transition-colors"
          >
            <ChevronLeft className="w-14 h-14" strokeWidth={2} />
          </button>

          <div className="flex items-center gap-6 px-8 relative group cursor-pointer hover:bg-hover rounded-[6px] transition-colors h-[28px]">
             <CalendarIcon className="w-12 h-12 text-accent" strokeWidth={2} />
             <span className="text-[13px] font-bold text-textPrimary capitalize min-w-[80px] text-center">
               {format(selectedDate, "d MMM", { locale: ru })}
             </span>
             {/* Note: In a full app, we'd add a popover with DayPicker here */}
             <input
               type="date"
               className="absolute inset-0 opacity-0 cursor-pointer"
               value={format(selectedDate, "yyyy-MM-dd")}
               onChange={(e) => {
                 if (e.target.value) setSelectedDate(startOfDay(new Date(e.target.value)));
               }}
             />
          </div>

          <button
            onClick={handleNextDay}
            className="p-4 text-textMuted hover:bg-hover hover:text-textPrimary rounded-[6px] transition-colors"
          >
            <ChevronRight className="w-14 h-14" strokeWidth={2} />
          </button>

          {/* Quick jump to today */}
          {!isSameDay(selectedDate, new Date()) && (
            <button
              onClick={() => setSelectedDate(startOfDay(new Date()))}
              className="ml-2 px-6 h-[28px] text-[12px] font-medium text-accent hover:bg-accent/5 rounded-[6px] transition-colors"
            >
              Сегодня
            </button>
          )}
        </div>
        )}
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
          <KanbanBoard leads={filteredLeads} onLeadClick={setSelectedLeadId} />
        ) : (
          <LeadTable leads={filteredLeads} onLeadClick={setSelectedLeadId} />
        )}
      </div>

      <CreateLeadModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />

      <LeadDrawer
        leadId={selectedLeadId}
        onClose={() => setSelectedLeadId(null)}
      />
    </div>
  );
}
