"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLeads } from "@/hooks/use-leads";
import { CreateLeadModal } from "@/components/leads/create-lead-modal";
import { FeedSidebar } from "@/components/leads/feed-sidebar";
import { LeadFeed } from "@/components/leads/lead-feed";
import { Input } from "@/components/ui/input";
import { LeadDrawer } from "@/components/leads/lead-drawer";

export type FilterType =
  | { type: "urgent" }
  | { type: "today_calls" }
  | { type: "today_visits" }
  | { type: "status", status: string };

export default function LeadsPage() {
  const { leads, loading, error } = useLeads();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>({ type: "today_calls" });
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const filteredLeads = leads.filter((lead) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      lead.name.toLowerCase().includes(query) ||
      (lead.phone && lead.phone.toLowerCase().includes(query))
    );
  });

  return (
    <div className="h-[calc(100vh-130px)] flex gap-16 -m-16 md:-m-32 p-16 md:p-32 bg-background overflow-hidden">
      {/* Sidebar Filters */}
      <FeedSidebar
        leads={leads}
        activeFilter={activeFilter}
        onSelectFilter={setActiveFilter}
      />

      {/* Main Feed Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-surface rounded-[16px] border border-border overflow-hidden">
        <div className="h-64 flex items-center justify-between px-16 border-b border-border shrink-0">
          <div className="relative w-[300px]">
            <Search className="absolute left-12 top-1/2 -translate-y-1/2 w-16 h-16 text-textMuted" strokeWidth={1.5} />
            <Input
              className="pl-40 h-32 text-caption bg-surfaceSecondary border-transparent focus:border-accent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button size="sm" className="h-32 px-16" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-14 h-14 mr-6" strokeWidth={1.5} />
            Новый лид
          </Button>
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
          ) : (
            <LeadFeed
              leads={filteredLeads}
              filter={activeFilter}
              onSelectLead={setSelectedLeadId}
            />
          )}
        </div>
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
