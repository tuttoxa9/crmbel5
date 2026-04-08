"use client";

import { useState } from "react";
import { Plus, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLeads } from "@/hooks/use-leads";
import { CreateLeadModal } from "@/components/leads/create-lead-modal";
import { KanbanBoard } from "@/components/leads/kanban-board";
import { LeadTable } from "@/components/leads/lead-table";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

type ViewMode = "kanban" | "table";

export default function LeadsPage() {
  const { leads, loading, error } = useLeads();
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLeads = leads.filter((lead) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      lead.name.toLowerCase().includes(query) ||
      (lead.phone && lead.phone.toLowerCase().includes(query))
    );
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

      <div className="flex items-center gap-12 mb-24 shrink-0">
        <div className="relative w-[300px]">
          <Search className="absolute left-12 top-1/2 -translate-y-1/2 w-16 h-16 text-textMuted" strokeWidth={1.5} />
          <Input
            placeholder="Поиск по имени или телефону..."
            className="pl-40"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {/* TODO: Add more filters here */}
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
          <KanbanBoard leads={filteredLeads} />
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
