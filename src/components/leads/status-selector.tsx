"use client";

import { useState } from "react";
import { LeadStatus, STATUS_NAMES } from "@/types/lead";
import { doc, updateDoc, collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { toast } from "sonner";


interface StatusSelectorProps {
  leadId: string;
  currentStatus: LeadStatus;
}

const ALL_STATUSES: LeadStatus[] = [
  "new", "in-work", "visit", "thinking", "callback",
  "success", "no-answer", "decline", "bank-decline", "defect"
];

export function StatusSelector({ leadId, currentStatus }: StatusSelectorProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = async (newStatus: LeadStatus) => {
    if (newStatus === currentStatus) return;
    setIsLoading(true);
    try {
      const now = Date.now();
      
      // Update lead
      await updateDoc(doc(db!, "leads", leadId), {
        status: newStatus,
        updatedAt: now,
      });

      // Add to history
      await addDoc(collection(db!, `leads/${leadId}/history`), {
        status: newStatus,
        notes: "Статус изменен",
        changedAt: now,
      });

      toast.success("Статус обновлен");
    } catch (error) {
      console.error(error);
      toast.error("Ошибка при обновлении статуса");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card-base p-20 rounded-[12px]">
      <h3 className="text-caption-bold text-textMuted uppercase tracking-wider mb-16">
        Статус
      </h3>
      <div className="flex flex-wrap gap-8">
        {ALL_STATUSES.map((status) => {
          const isActive = status === currentStatus;
          return (
            <button
              key={status}
              disabled={isLoading}
              onClick={() => handleStatusChange(status)}
              className={`px-12 py-6 rounded-full text-caption font-medium transition-colors ${
                isActive
                  ? "bg-accent text-white"
                  : "bg-surfaceSecondary text-textPrimary hover:bg-border border border-border"
              }`}
            >
              {STATUS_NAMES[status]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
