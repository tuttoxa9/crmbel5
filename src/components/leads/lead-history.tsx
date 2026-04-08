
import { LeadHistory as LeadHistoryType, STATUS_NAMES, LeadStatus } from "@/types/lead";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

interface LeadHistoryProps {
  history: LeadHistoryType[];
}

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

export function LeadHistory({ history }: LeadHistoryProps) {
  // Sort descending by changedAt
  const sortedHistory = [...history].sort((a, b) => b.changedAt - a.changedAt);

  return (
    <div className="card-base h-full rounded-[12px] p-24 overflow-y-auto">
      <h3 className="text-section-title text-textPrimary mb-24">История изменений</h3>
      
      <div className="relative border-l border-border ml-12 space-y-24">
        {sortedHistory.map((item) => (
          <div key={item.id} className="relative pl-24">
            <div className="absolute -left-[5px] top-[6px] w-10 h-10 rounded-full bg-accent ring-4 ring-surface" />
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-8">
                <Badge variant={STATUS_COLORS[item.status]}>
                  {STATUS_NAMES[item.status]}
                </Badge>
                <span className="text-caption text-textMuted">
                  {format(item.changedAt, "d MMM yyyy, HH:mm", { locale: ru })}
                </span>
              </div>
              
              {item.notes && (
                <div className="mt-8 p-12 bg-surfaceSecondary rounded-md border border-border text-body text-textPrimary">
                  {item.notes}
                </div>
              )}
            </div>
          </div>
        ))}
        {sortedHistory.length === 0 && (
          <div className="pl-24 text-caption text-textMuted">
            История пуста
          </div>
        )}
      </div>
    </div>
  );
}
