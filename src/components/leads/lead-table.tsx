"use client";

import { Lead, STATUS_NAMES, SOURCE_NAMES, LeadStatus } from "@/types/lead";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

interface LeadTableProps {
  leads: Lead[];
  onLeadClick?: (id: string) => void;
}

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

export function LeadTable({ leads, onLeadClick }: LeadTableProps) {
  const router = useRouter();

  return (
    <div className="w-full overflow-auto bg-surface border border-border rounded-[12px]">
      <table className="w-full text-left text-body">
        <thead className="bg-surfaceSecondary text-caption text-textMuted border-b border-border">
          <tr>
            <th className="px-16 py-12 font-medium">Клиент</th>
            <th className="px-16 py-12 font-medium">Автомобиль</th>
            <th className="px-16 py-12 font-medium">Источник</th>
            <th className="px-16 py-12 font-medium">Статус</th>
            <th className="px-16 py-12 font-medium">Следующее действие</th>
            <th className="px-16 py-12 font-medium">Создан</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {leads.map((lead) => (
            <tr 
              key={lead.id}
              onClick={() => onLeadClick ? onLeadClick(lead.id) : router.push(`/leads/${lead.id}`)}
              className="hover:bg-hover cursor-pointer transition-colors"
            >
              <td className="px-16 py-12">
                <div className="font-semibold text-textPrimary">{lead.name}</div>
                {lead.phone && (
                  <a 
                    href={`tel:${lead.phone}`} 
                    onClick={(e) => e.stopPropagation()}
                    className="text-caption text-textMuted hover:text-accent mt-2 block"
                  >
                    {lead.phone}
                  </a>
                )}
              </td>
              <td className="px-16 py-12 text-textPrimary">{lead.car || "-"}</td>
              <td className="px-16 py-12">
                <Badge variant="outline">{SOURCE_NAMES[lead.source]}</Badge>
              </td>
              <td className="px-16 py-12">
                <Badge variant={STATUS_COLORS[lead.status]}>{STATUS_NAMES[lead.status]}</Badge>
              </td>
              <td className="px-16 py-12 text-textPrimary">
                {lead.nextActionDate ? (
                  <span className={Date.now() > lead.nextActionDate ? "text-[#FF3B30]" : ""}>
                    {format(lead.nextActionDate, "dd.MM.yyyy")}
                    {lead.nextActionTime && ` в ${lead.nextActionTime}`}
                  </span>
                ) : (
                  <span className="text-textMuted">-</span>
                )}
              </td>
              <td className="px-16 py-12 text-textMuted text-caption">
                {format(lead.createdAt, "dd.MM.yyyy HH:mm")}
              </td>
            </tr>
          ))}
          {leads.length === 0 && (
            <tr>
              <td colSpan={6} className="px-16 py-32 text-center text-textMuted">
                Лидов не найдено
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
